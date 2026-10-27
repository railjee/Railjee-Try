import logoUrl from '@/assets/logo.png';
import { useState, useMemo } from 'preact/hooks';
import { ReviewFilter, FilterCounts, QuestionReviewProps } from '@/lib/examTypes';
import { filterQuestions, getFilterCounts } from '@/lib/examUtils';
import ExamQuestion from './ExamQuestion';
import QuestionPalette from './QuestionPalette';

export default function QuestionReview({
  examName,
  questions,
  answers,
  markedForReview,
  onBackToResult
}: QuestionReviewProps) {
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');
  const [reviewQuestionIndex, setReviewQuestionIndex] = useState(0);
  const [showReviewPalette, setShowReviewPalette] = useState(false);

  const filteredQuestions = useMemo(
    () => filterQuestions(questions, answers, reviewFilter),
    [questions, answers, reviewFilter]
  );
  const filterCounts = useMemo(
    () => getFilterCounts(questions, answers),
    [questions, answers]
  );

  const handleFilterChange = (filter: ReviewFilter) => {
    setReviewFilter(filter);
    setReviewQuestionIndex(0);
  };

  const handleNavigatePrevious = () => {
    setReviewQuestionIndex(Math.max(0, reviewQuestionIndex - 1));
  };

  const handleNavigateNext = (maxIndex: number) => {
    setReviewQuestionIndex(Math.min(maxIndex, reviewQuestionIndex + 1));
  };

  const handleJumpToQuestion = (originalIndex: number) => {
    const filteredIndex = filteredQuestions.findIndex(item => item.index === originalIndex);
    
    if (filteredIndex !== -1) {
      // Question exists in current filter
      setReviewQuestionIndex(filteredIndex);
    } else {
      // Question not in current filter, switch to "all"
      setReviewFilter('all');
      const allFilteredQuestions = filterQuestions(questions, answers, 'all');
      const allFilteredIndex = allFilteredQuestions.findIndex(item => item.index === originalIndex);
      if (allFilteredIndex !== -1) {
        setReviewQuestionIndex(allFilteredIndex);
      }
    }
    
    setShowReviewPalette(false);
  };

  const allVisited = useMemo(() => new Set(questions.map((_, i) => i)), [questions]);

  const currentFilteredItem = filteredQuestions[reviewQuestionIndex];
  const reviewQuestion = currentFilteredItem?.question || questions[0];
  const actualQuestionIndex = currentFilteredItem?.index || 0;
  const userAnswer = answers[actualQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-orange-50/30 to-stone-100 flex flex-col">
      {/* Header */}
      <ReviewHeader 
        examName={examName}
        onBack={onBackToResult}
      />

      {/* Filter Tabs */}
      <FilterTabs
        activeFilter={reviewFilter}
        filterCounts={filterCounts}
        onFilterChange={handleFilterChange}
        onShowPalette={() => setShowReviewPalette(true)}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-hidden pb-4">
        <div className="max-w-2xl mx-auto px-3 sm:px-4">
          {filteredQuestions.length === 0 ? (
            <EmptyFilterMessage filter={reviewFilter} />
          ) : (
            <>
              {/* Question Display */}
              <div className="mb-2">
                <ExamQuestion
                  question={reviewQuestion}
                  questionIndex={actualQuestionIndex}
                  totalQuestions={questions.length}
                  selectedAnswer={userAnswer}
                  onSelectAnswer={() => {}} // No-op in review mode
                  reviewMode={true}
                  correctAnswer={reviewQuestion.correctAnswer}
                />
              </div>

              {/* Navigation */}
              <ReviewNavigation
                currentIndex={reviewQuestionIndex}
                totalFiltered={filteredQuestions.length}
                onPrevious={handleNavigatePrevious}
                onNext={() => handleNavigateNext(filteredQuestions.length - 1)}
              />
            </>
          )}
        </div>
      </main>

      {/* Question Palette */}
      <QuestionPalette
        totalQuestions={questions.length}
        currentQuestionIndex={actualQuestionIndex}
        answers={answers}
        markedForReview={markedForReview}
        visitedQuestions={allVisited}
        onQuestionJump={handleJumpToQuestion}
        showMobile={showReviewPalette}
        onCloseMobile={() => setShowReviewPalette(false)}
        reviewMode={true}
        questions={questions}
      />
    </div>
  );
}

// Sub-components

interface ReviewHeaderProps {
  examName: string;
  onBack: () => void;
}

function ReviewHeader({ examName, onBack }: ReviewHeaderProps) {
  return (
    <div className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onBack}
              className="p-1.5 hover:bg-stone-100 rounded-lg transition-all flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xs sm:text-sm font-bold text-stone-800">Question Review</h1>
              <p className="text-xxs sm:text-xs text-stone-500">{examName}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <img
              src={logoUrl}
              alt="RailJee Logo"
              width={164}
              height={51}
              className="h-7 sm:h-10 w-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface FilterTabsProps {
  activeFilter: ReviewFilter;
  filterCounts: FilterCounts;
  onFilterChange: (filter: ReviewFilter) => void;
  onShowPalette: () => void;
}

function FilterTabs({ activeFilter, filterCounts, onFilterChange, onShowPalette }: FilterTabsProps) {
  const filters: { key: ReviewFilter; label: string; activeClass: string }[] = [
    { key: 'all', label: 'All', activeClass: 'bg-stone-800 text-white' },
    { key: 'correct', label: 'Correct', activeClass: 'bg-green-500 text-white' },
    { key: 'wrong', label: 'Wrong', activeClass: 'bg-red-500 text-white' },
    { key: 'skipped', label: 'Skipped', activeClass: 'bg-amber-500 text-white' }
  ];

  return (
    <div>
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-1 sm:py-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex flex-wrap gap-1.5 sm:gap-2 flex-1">
            {filters.map(({ key, label, activeClass }) => (
              <button
                key={key}
                onClick={() => onFilterChange(key)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium text-xxs sm:text-xs transition-all ${
                  activeFilter === key ? activeClass : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {label} ({filterCounts[key]})
              </button>
            ))}
          </div>
          {/* Palette Button */}
          <button
            onClick={onShowPalette}
            className="ml-auto p-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg transition-all flex items-center justify-center flex-shrink-0"
            title="Question Palette"
          >
            <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth={1.5} />
              <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth={1.5} />
              <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth={1.5} />
              <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth={1.5} />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

interface EmptyFilterMessageProps {
  filter: ReviewFilter;
}

function EmptyFilterMessage({ filter }: EmptyFilterMessageProps) {
  const messages: Record<ReviewFilter, string> = {
    all: 'No questions available.',
    correct: 'No questions were answered correctly.',
    wrong: 'No questions were answered incorrectly.',
    skipped: 'No questions were skipped.'
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
      <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h4 className="text-lg font-bold text-stone-800 mb-1">No Questions Found</h4>
      <p className="text-sm text-stone-500">{messages[filter]}</p>
    </div>
  );
}

interface ReviewNavigationProps {
  currentIndex: number;
  totalFiltered: number;
  onPrevious: () => void;
  onNext: () => void;
}

function ReviewNavigation({ currentIndex, totalFiltered, onPrevious, onNext }: ReviewNavigationProps) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-2">
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {/* Previous Button */}
        <button
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-stone-100 text-stone-700 rounded-lg sm:rounded-xl hover:bg-stone-200 transition-all font-semibold text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Next Button */}
        <button
          onClick={onNext}
          disabled={currentIndex === totalFiltered - 1}
          className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all font-semibold text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Next</span>
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
