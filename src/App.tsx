import { useEffect, useState } from 'preact/hooks';
import { loadDemo } from './config';
import type { DemoConfig } from './lib/types';
import type { RestorableExamState, SubmissionResult } from './lib/examTypes';
import {
  clearAttempt,
  loadAttempt,
  loadHistory,
  recordResult,
  remainingTime,
  saveAttempt,
  type StoredAttempt,
  type StoredHistory,
} from './lib/storage';
import { buildSignupUrl } from './lib/signupUrl';
import { startSignup } from './lib/handoff';
import { track } from './lib/track';
import StartCard from './components/StartCard';
import ExamScreen from './components/ExamScreen';
import ExamResult from './components/ExamResult';
import ExamResultActions from './components/ExamResultActions';
import QuestionReview from './components/QuestionReview';
import ResultHeader from './components/ResultHeader';
import OpenInBrowserSheet from './components/OpenInBrowserSheet';
import { SignupCard, SignupStickyBar } from './components/SignupCta';

type Screen = 'start' | 'exam' | 'result' | 'review';

interface Submitted {
  result: SubmissionResult;
  state: RestorableExamState;
}

export default function App() {
  const [demo, setDemo] = useState<DemoConfig | null>(null);
  const [screen, setScreen] = useState<Screen>('start');
  const [saved, setSaved] = useState<StoredAttempt | null>(null);
  const [resumeFrom, setResumeFrom] = useState<StoredAttempt | null>(null);
  const [submitted, setSubmitted] = useState<Submitted | null>(null);
  const [history, setHistory] = useState<StoredHistory>({ attempts: 0, bestScore: 0, lastScore: 0 });
  const [helpTarget, setHelpTarget] = useState<string | null>(null);

  // Load the demo picked by ?d=<id>, then decide where the visitor lands
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('d');
    loadDemo(id).then((d) => {
      setDemo(d);
      setHistory(loadHistory(d.id, d.version));
      track('view', { demoId: d.id });

      const attempt = loadAttempt(d.id, d.version);
      if (attempt?.status === 'submitted' && attempt.result) {
        // Came back after submitting: show the last result
        setSubmitted({ result: attempt.result, state: attempt });
        setScreen('result');
      } else if (attempt?.status === 'in_progress') {
        if (remainingTime(attempt) === 0) {
          // Time ran out while away: reopen the exam with 0s left, which auto-submits
          // the saved answers through the normal scoring path
          setResumeFrom(attempt);
          setScreen('exam');
        } else {
          setSaved(attempt);
        }
      }
    });
  }, []);

  if (!demo) return null;

  const total = demo.questions.length;
  const openSignup = (source: string) => {
    const score = submitted ? { value: Number(submitted.result.score.toFixed(2)), total } : undefined;
    startSignup(buildSignupUrl(demo, score), setHelpTarget, source);
  };

  function handleSubmitted(result: SubmissionResult, state: RestorableExamState, startedAt: number) {
    const d = demo!;
    saveAttempt(d.id, d.version, { status: 'submitted', startedAt, timeRemaining: 0, savedAt: Date.now(), ...state, result });
    setHistory(recordResult(d.id, d.version, result.score));
    setSubmitted({ result, state });
    setSaved(null);
    setScreen('result');
    track('exam_submit', { demoId: d.id, score: result.score });
    track('result_view', { demoId: d.id, score: result.score });
    window.scrollTo(0, 0);
  }

  function startFresh() {
    clearAttempt(demo!.id, demo!.version);
    setResumeFrom(null);
    setSubmitted(null);
    setScreen('exam');
    track('exam_start', { demoId: demo!.id, resumed: false });
  }

  function resume() {
    setResumeFrom(saved);
    setScreen('exam');
    track('exam_start', { demoId: demo!.id, resumed: true });
  }

  function retry() {
    clearAttempt(demo!.id, demo!.version);
    setSubmitted(null);
    setSaved(null);
    setScreen('start');
    window.scrollTo(0, 0);
  }

  const helpSheet = helpTarget && <OpenInBrowserSheet target={helpTarget} onClose={() => setHelpTarget(null)} />;

  if (screen === 'exam') {
    return (
      <ExamScreen
        demo={demo}
        resume={
          resumeFrom
            ? { state: resumeFrom, timeRemaining: remainingTime(resumeFrom), startedAt: resumeFrom.startedAt }
            : null
        }
        onSubmitted={handleSubmitted}
      />
    );
  }

  if (screen === 'review' && submitted) {
    return (
      <div className="pb-20">
        <QuestionReview
          examName={`Paper - ${demo.paper.name}`}
          questions={demo.questions}
          answers={submitted.state.answers}
          markedForReview={submitted.state.markedForReview}
          onBackToResult={() => setScreen('result')}
        />
        <SignupStickyBar label={demo.copy.ctaButton} onClick={() => openSignup('review_bar')} />
        {helpSheet}
      </div>
    );
  }

  if (screen === 'result' && submitted) {
    const r = submitted.result;
    const attempted = r.correctAnswers + r.wrongAnswers;
    const seconds = Math.max(0, r.timeTaken);
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-100 via-orange-50/30 to-stone-100 flex flex-col pb-20">
        <ResultHeader paperName={demo.paper.name} onSignup={() => openSignup('result_header')} />
        <main className="flex-1 py-4 sm:py-5 lg:py-6">
          <div className="max-w-4xl mx-auto px-3 sm:px-4">
            <ExamResult
              isPassed={r.percentage >= demo.paper.passPercentage}
              passPercentage={demo.paper.passPercentage}
              score={r.score}
              percentage={r.percentage}
              correctAnswers={r.correctAnswers}
              incorrectAnswers={r.wrongAnswers}
              unattemptedQuestions={r.skippedQuestions}
              totalQuestions={r.totalQuestions}
              timeTaken={{ hours: Math.floor(seconds / 3600), minutes: Math.floor((seconds % 3600) / 60), seconds: seconds % 60 }}
              attemptedQuestions={attempted}
              accuracy={attempted > 0 ? (r.correctAnswers / attempted) * 100 : 0}
            />

            <SignupCard
              scoreText={`Your score ${r.score.toFixed(2)}/${total}${history.attempts > 1 ? ` · Attempt ${history.attempts} · Best ${history.bestScore.toFixed(2)}` : ''}`}
              title={demo.copy.ctaTitle}
              buttonLabel={demo.copy.ctaButton}
              onClick={() => openSignup('result_card')}
            />

            <ExamResultActions
              hasQuestions={true}
              onReviewAnswers={() => {
                track('review_open', { demoId: demo.id });
                setScreen('review');
                window.scrollTo(0, 0);
              }}
              onBackToHome={retry}
              backLabel="Retry Test"
            />
          </div>
        </main>
        <SignupStickyBar label={demo.copy.ctaButton} onClick={() => openSignup('result_bar')} />
        {helpSheet}
      </div>
    );
  }

  return (
    <>
      <StartCard
        demo={demo}
        history={history}
        resumeSeconds={saved ? remainingTime(saved) : null}
        resumeAnswered={saved ? saved.answers.filter((a) => a !== null).length : 0}
        onStart={startFresh}
        onResume={resume}
        onSignup={() => openSignup('start_header')}
      />
      {helpSheet}
    </>
  );
}
