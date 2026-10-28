import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { DemoConfig } from '@/lib/types';
import type { RestorableExamState, SubmissionResult } from '@/lib/examTypes';
import { useExamState } from '@/hooks/useExamState';
import { useExamTimer } from '@/hooks/useExamTimer';
import { useExamSubmission } from '@/hooks/useExamSubmission';
import { saveAttempt, type StoredAttempt } from '@/lib/storage';
import ExamHeader from './ExamHeader';
import ExamQuestion from './ExamQuestion';
import ExamActionBar from './ExamActionBar';
import QuestionPalette from './QuestionPalette';
import SubmitConfirmation from './SubmitConfirmation';

/** Timer is saved at most this often (answers/navigation are saved immediately) */
const SAVE_EVERY_SECONDS = 5;

interface ExamScreenProps {
  demo: DemoConfig;
  /** Saved attempt to resume, or null for a fresh start */
  resume: { state: RestorableExamState; timeRemaining: number; startedAt: number } | null;
  onSubmitted: (result: SubmissionResult, state: RestorableExamState, startedAt: number) => void;
}

/**
 * Same layout as the main site's ExamPageClient (header, question, action bar,
 * palette, submit popup), with scoring done locally and progress saved to localStorage.
 */
export default function ExamScreen({ demo, resume, onSubmitted }: ExamScreenProps) {
  const { questions, paper } = demo;
  const totalTime = paper.durationMinutes * 60;

  const [showMobilePalette, setShowMobilePalette] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [ready, setReady] = useState(false);
  const startedAt = useRef(resume?.startedAt ?? Date.now());
  const submitted = useRef(false);

  const examState = useExamState({ totalQuestions: questions.length });
  const markingScheme = useMemo(
    () => ({ correct: 1, incorrect: -paper.negativeMarking, unattempted: 0 }),
    [paper.negativeMarking]
  );
  const submission = useExamSubmission({ initialTime: totalTime, markingScheme });
  const timer = useExamTimer({
    initialTime: resume?.timeRemaining ?? totalTime,
    isActive: ready,
    // Submitting is done in the effect below rather than inside the timer's state update
    onTimeUp: () => {},
  });

  // Auto-submit when time runs out (same behaviour as the main site)
  useEffect(() => {
    if (ready && timer.timeRemaining === 0) handleSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, timer.timeRemaining]);

  // Start fresh or restore the saved attempt
  useEffect(() => {
    if (resume) examState.restoreState(resume.state);
    else examState.initializeExam(questions.length);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const snapshot = (): RestorableExamState => ({
    currentIndex: examState.currentIndex,
    answers: examState.answers,
    markedForReview: examState.markedForReview,
    visited: [...examState.visitedQuestions],
  });

  // Keep the latest snapshot for the pagehide handler
  const latest = useRef<StoredAttempt | null>(null);
  latest.current = ready
    ? { status: 'in_progress', startedAt: startedAt.current, timeRemaining: timer.timeRemaining, savedAt: Date.now(), ...snapshot() }
    : null;

  const persist = () => {
    if (latest.current && !submitted.current) saveAttempt(demo.id, demo.version, latest.current);
  };

  // Save on every answer / flag / navigation
  useEffect(persist, [ready, examState.answers, examState.markedForReview, examState.currentIndex]);

  // Save the timer every few seconds
  useEffect(() => {
    if (timer.timeRemaining % SAVE_EVERY_SECONDS === 0) persist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.timeRemaining]);

  // Save when the tab is hidden or closed (phone lock, app switch)
  useEffect(() => {
    const onHide = () => persist();
    const onVisibility = () => document.visibilityState === 'hidden' && persist();
    window.addEventListener('pagehide', onHide);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', onHide);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Scroll to top when question changes (same as main site)
  useEffect(() => {
    if (ready) window.scrollTo(0, 0);
  }, [examState.currentIndex, ready]);

  function handleSubmit() {
    if (submitted.current) return;
    submitted.current = true;
    const result = submission.calculateResult(questions, examState.answers, timer.timeRemaining);
    setShowSubmitConfirm(false);
    onSubmitted(result, snapshot(), startedAt.current);
  }

  function handleNextQuestion() {
    const moved = examState.goToNextQuestion();
    if (!moved) setShowSubmitConfirm(true);
  }

  function handleQuestionJump(index: number) {
    examState.goToQuestion(index);
    setShowMobilePalette(false);
    setShowSubmitConfirm(false);
  }

  if (!ready || examState.answers.length === 0) return null;

  const currentQuestion = questions[examState.currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-orange-50/30 to-stone-100 flex flex-col">
      <ExamHeader
        examName={paper.name}
        currentQuestionIndex={examState.currentIndex}
        totalQuestions={questions.length}
        timeRemaining={timer.timeRemaining}
        answeredCount={examState.answeredCount}
        onShowPalette={() => setShowMobilePalette(true)}
        onSubmit={() => setShowSubmitConfirm(true)}
      />

      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-5xl p-3 sm:p-4 lg:p-6">
          <div className="w-full">
            <div className="mb-3 sm:mb-4">
              <ExamQuestion
                question={currentQuestion}
                questionIndex={examState.currentIndex}
                totalQuestions={questions.length}
                selectedAnswer={examState.selectedAnswer}
                onSelectAnswer={(i) => examState.selectAnswer(i, false)}
                markedForReview={examState.markedForReview[examState.currentIndex]}
                onToggleMarkForReview={examState.toggleMarkForReview}
                onSubmit={() => setShowSubmitConfirm(true)}
                showSubmitButton={true}
                negativeMarking={paper.negativeMarking}
              />
            </div>

            <ExamActionBar
              currentQuestionIndex={examState.currentIndex}
              totalQuestions={questions.length}
              onPrevious={examState.goToPreviousQuestion}
              onNext={handleNextQuestion}
              onSubmit={() => setShowSubmitConfirm(true)}
            />
          </div>
        </div>
      </div>

      {showSubmitConfirm && (
        <SubmitConfirmation
          totalQuestions={questions.length}
          answeredCount={examState.answeredCount}
          skippedCount={examState.skippedCount}
          markedCount={examState.markedCount}
          answers={examState.answers}
          markedForReview={examState.markedForReview}
          visitedQuestions={examState.visitedQuestions}
          onSubmit={handleSubmit}
          onCancel={() => setShowSubmitConfirm(false)}
          onQuestionJump={handleQuestionJump}
        />
      )}

      <QuestionPalette
        totalQuestions={questions.length}
        currentQuestionIndex={examState.currentIndex}
        answers={examState.answers}
        markedForReview={examState.markedForReview}
        visitedQuestions={examState.visitedQuestions}
        onQuestionJump={handleQuestionJump}
        showMobile={showMobilePalette}
        onCloseMobile={() => setShowMobilePalette(false)}
      />
    </div>
  );
}
