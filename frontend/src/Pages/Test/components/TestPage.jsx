// TestPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiFlag,
  FiMaximize2,
  FiMinimize2
} from 'react-icons/fi';
import '../Test.css';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

// Format seconds -> MM:SS (pad)
const formatTime = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

const TestPage = React.memo(function TestPage({
  questions = [],
  round = { time_limit_minutes: 0, name: 'Round', id: null },
  onSubmitTest = () => {},
  apiUrl = '',
  userId = null
}) {
  const navigate = useNavigate();

  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState([]);
  const [startTime, setStartTime] = useState(new Date());
  const [timeLeft, setTimeLeft] = useState(round.time_limit_minutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  // Refs
  const timerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const handleSubmitRef = useRef(null);
  const mountedRef = useRef(false);

  // Keep handleSubmitRef updated
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  });

  // ---- Handlers (stable) ----
  const handleKeyDown = useCallback((e) => {
    // Prevent some shortcuts commonly used to inspect / reload
    const key = e.key?.toLowerCase?.();
    if (
      e.key === 'F5' ||
      e.key === 'F12' ||
      (e.ctrlKey && key === 'r') ||
      (e.ctrlKey && e.shiftKey && key === 'r') ||
      (e.ctrlKey && key === 'u') ||
      (e.ctrlKey && e.shiftKey && key === 'i') ||
      (e.ctrlKey && e.shiftKey && key === 'j') ||
      (e.ctrlKey && e.shiftKey && key === 'c')
    ) {
      e.preventDefault();
      return false;
    }
    return undefined;
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      // ignore or log
      // console.error('Fullscreen error', err);
    }
  }, []);

  const handleBeforeUnload = useCallback((e) => {
    // show confirmation in supporting browsers
    const message = 'Are you sure you want to leave? The test will be auto-submitted.';
    // Standard:
    e.preventDefault();
    // Chrome requires returnValue set
    e.returnValue = message;
    return message;
  }, []);

  // Visibility change (tab switch) handler
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      setWarnings((prev) => {
        const newWarnings = prev + 1;

        setShowWarning(true);
        if (warningTimerRef.current) {
          clearTimeout(warningTimerRef.current);
        }
        warningTimerRef.current = setTimeout(() => setShowWarning(false), 5000);

        // If reach 3 warnings, auto-submit using ref to avoid stale closure
        if (newWarnings >= 3) {
          toast.error('Maximum warnings reached! Submitting test...');
          // call the latest handleSubmit with fromWarning=true to skip confirmation
          if (handleSubmitRef.current) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            handleSubmitRef.current(true);
          }
        } else {
          toast.warning(`Warning ${newWarnings}/3: Please do not switch tabs, refresh, or navigate away from this page.`);
        }

        return newWarnings;
      });
    }
  }, []);

  // Popstate (back button)
  const handlePopState = useCallback(() => {
    const confirmed = window.confirm('Are you sure you want to leave? The test will be auto-submitted.');
    if (confirmed) {
      if (handleSubmitRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        handleSubmitRef.current();
      }
    } else {
      // push state back to keep user on page
      window.history.pushState(null, '', window.location.pathname);
    }
  }, []);

  // Context menu prevention
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    return false;
  }, []);

  // ---------- Submit function ----------
  const handleSubmit = useCallback(async (fromWarning = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Skip confirmation if submitted due to warnings
      if (!fromWarning) {
        const confirmSubmit = window.confirm(
          'Are you sure you want to submit your test?\n\n• You will not be able to change your answers after submission.'
        );
        if (!confirmSubmit) {
          setIsSubmitting(false);
          return;
        }
      }

      const end = new Date();
      const time_taken = Math.floor((end - startTime) / 1000);

      const submissionData = {
        user_id: userId,  // Backend expects user_id (with underscore)
        roundId: round.id,
        time_taken,
        answers: Object.entries(answers).map(([qId, ans]) => ({
          questionId: qId,
          user_answer: String(ans ?? '')
        }))
      };
      
      console.log('Submitting test with data:', JSON.stringify(submissionData, null, 2));

      if (!userId) {
        toast.error('Your session has expired. Please log in again.');
        localStorage.removeItem('userId');
        navigate('/login');
        return;
      }

      const toastId = toast.loading('Submitting your test...');

      // Use axios with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        console.log('Sending request to:', `${apiUrl}/api/test/submit`);
        const res = await axios.post(`${apiUrl}/api/test/submit`, submissionData, {
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          validateStatus: (status) => status < 500 // Don't throw for 4xx errors
        });

        clearTimeout(timeoutId);
        
        console.log('Response received:', {
          status: res.status,
          statusText: res.statusText,
          data: res.data
        });

        if (res.status === 200 && res.data?.success) {
          localStorage.removeItem('testAnswers');
          localStorage.removeItem('markedForReview');
          localStorage.removeItem('testStartTime');

          toast.update(toastId, {
            render: 'Test submitted successfully!',
            type: 'success',
            isLoading: false,
            autoClose: 3000
          });

          // try logout
          try {
            await axios.post(`${apiUrl}/api/test/logout`, { user_id: userId });
          } catch (err) {
            // console.warn('Logout after submission failed:', err);
          } finally {
            localStorage.removeItem('userId');
            onSubmitTest();
          }
        } else {
          throw new Error(res?.data?.message || 'Failed to process your submission.');
        }
      } catch (err) {
        clearTimeout(timeoutId);
        toast.dismiss(toastId);

        // handle axios abort separately
        if (axios.isCancel?.(err) || err.name === 'CanceledError' || err.message?.toLowerCase?.().includes('timeout')) {
          toast.error('Request timed out. Please check your connection and try again.', { autoClose: 5000 });
        } else if (err?.response) {
          const { status, data } = err.response;
          if (status === 401) {
            toast.error('Your session has expired. Please log in again.', { autoClose: 5000 });
            localStorage.removeItem('userId');
            navigate('/login');
          } else if (status === 403) {
            toast.error(data?.message || 'You are not authorized to perform this action.', { autoClose: 5000 });
          } else if (status === 404) {
            toast.error(data?.message || 'Test not found or no longer available.', { autoClose: 5000 });
          } else if (status === 409) {
            toast.error("It seems you've already submitted this test.", { autoClose: 5000 });
          } else if (status >= 500) {
            toast.error('Server error. Please try again in a few minutes.', { autoClose: 5000 });
          } else {
            toast.error(data?.message || 'Failed to submit test. Please try again.', { autoClose: 5000 });
          }
        } else {
          toast.error(err?.message || 'An unexpected error occurred.', { autoClose: 5000 });
        }
      }
    } catch (outerErr) {
      toast.error(outerErr?.message || 'An unexpected error occurred.', { autoClose: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  }, [apiUrl, answers, isSubmitting, navigate, onSubmitTest, round.id, startTime, userId]);

  // ---------- Answer helpers ----------
  const saveAnswersToStorage = useCallback((a) => {
    try {
      localStorage.setItem('testAnswers', JSON.stringify(a));
    } catch (e) {
      // ignore storage errors
    }
  }, []);

  const handleAnswerSelect = useCallback((q, answer) => {
    let val = '';
    if (!q) return;
    if (q.question_type === 'MCQ') val = q.options?.[answer] ?? '';
    else if (['ShortAnswer', 'Text', 'FillInBlank'].includes(q.question_type)) val = answer;
    else if (q.question_type === 'TrueFalse') val = answer === 0 ? 'true' : 'false';
    else if (q.question_type === 'PseudoCode') val = answer;
    setAnswers((prev) => {
      const next = { ...prev, [q._id]: val };
      saveAnswersToStorage(next);
      return next;
    });
  }, [saveAnswersToStorage]);

  const handleMarkForReview = useCallback((id) => {
    setMarkedForReview((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem('markedForReview', JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  }, []);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentQuestionIndex((i) => Math.min(i + 1, questions.length - 1));
  }, [questions.length]);

  const handlePrevious = useCallback(() => {
    setDirection(-1);
    setCurrentQuestionIndex((i) => Math.max(i - 1, 0));
  }, []);

  const paginate = useCallback((i) => {
    setDirection(i > currentQuestionIndex ? 1 : -1);
    setCurrentQuestionIndex(i);
  }, [currentQuestionIndex]);

  // ---------- Effects: mount / timers / storage / listeners ----------
  useEffect(() => {
    // Load persisted state
    const savedAnswers = localStorage.getItem('testAnswers');
    if (savedAnswers) {
      try {
        setAnswers(JSON.parse(savedAnswers));
      } catch (e) {
        // ignore parse error
      }
    }

    const savedMarked = localStorage.getItem('markedForReview');
    if (savedMarked) {
      try {
        setMarkedForReview(JSON.parse(savedMarked));
      } catch (e) {
        // ignore
      }
    }

    const savedStart = localStorage.getItem('testStartTime');
    const sTime = savedStart ? new Date(savedStart) : new Date();
    setStartTime(sTime);

    if (!savedStart) {
      try {
        localStorage.setItem('testStartTime', sTime.toISOString());
      } catch (e) {
        // ignore
      }
    } else {
      const elapsed = Math.floor((new Date() - sTime) / 1000);
      const total = round.time_limit_minutes * 60;
      setTimeLeft(Math.max(0, total - elapsed));
    }

    // Enter fullscreen if allowed (best-effort)
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    setIsFullscreen(!!document.fullscreenElement);

    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // use ref to avoid stale closure
          if (handleSubmitRef.current) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            handleSubmitRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Attach listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', () => setIsFullscreen(!!document.fullscreenElement));

    mountedRef.current = true;

    return () => {
      // cleanup
      mountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      // Note: fullscreenchange listener added as lambda cannot be removed here, but it's harmless.
      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      // Persist minimal state cleanup only if test ended (optional)
      // Don't remove answers here; they are removed on successful submit
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // Keep localStorage for markedForReview in sync
  useEffect(() => {
    try {
      localStorage.setItem('markedForReview', JSON.stringify(markedForReview));
    } catch (e) {
      // ignore
    }
  }, [markedForReview]);

  // If answers changed, save (debounce could be added later)
  useEffect(() => {
    try {
      localStorage.setItem('testAnswers', JSON.stringify(answers));
    } catch (e) {
      // ignore
    }
  }, [answers]);

  // Auto-submit when timeLeft hits zero (also handled inside interval but keep safe)
  useEffect(() => {
    if (timeLeft === 0 && handleSubmitRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      handleSubmitRef.current();
    }
  }, [timeLeft]);

  // ---------- derived values ----------
  const currentQ = questions?.[currentQuestionIndex];
  const answeredCount = Object.keys(answers).filter((k) => answers[k] !== undefined && answers[k] !== '').length;
  const progressPercentage = questions?.length ? (answeredCount / questions.length) * 100 : 0;
  const totalSeconds = round.time_limit_minutes * 60 || 1;
  const timePercentage = (timeLeft / totalSeconds) * 100;
  const getTimeStatus = () => {
    const used = (1 - timeLeft / totalSeconds) * 100;
    if (used > 80) return 'danger';
    if (used > 60) return 'warning';
    return 'normal';
  };
  const isQuestionAnswered = (q) => {
    if (!q) return false;
    const a = answers[q._id];
    return a !== undefined && a !== '';
  };

  // ---------- Render ----------
  return (
    <div className="test-container">
      {showWarning && (
        <div className="warning-banner">
          ⚠️ Warning {warnings}/3: Please do not switch tabs, refresh, or navigate away from this page.
        </div>
      )}

      <header className="test-header">
        <div className="test-header-content">
          <h1 className="test-title">
            {round.name} Test
            <button
              onClick={toggleFullscreen}
              className="fullscreen-btn"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              type="button"
            >
              {isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
            </button>
          </h1>
          <div className={`timer-container ${getTimeStatus()}`}>
            <FiClock className="timer-icon" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
        <div className="progress-container">
          <div
            className={`progress-bar ${getTimeStatus()}`}
            style={{ width: `${timePercentage}%` }}
          />
        </div>
      </header>

      <main className="test-content">
        <aside className="question-sidebar">
          <div className="sidebar-header">
            <h3>Questions</h3>
            <span>{answeredCount}/{questions.length}</span>
          </div>
          <div className="question-grid">
            {questions.map((q, i) => {
              const answered = isQuestionAnswered(q);
              const current = i === currentQuestionIndex;
              const reviewed = markedForReview.includes(q._id);
              return (
                <button
                  key={q._id}
                  type="button"
                  className={`question-number question-nav-btn ${current ? 'current' : ''} ${answered ? 'answered' : ''} ${reviewed ? 'marked' : ''}`}
                  onClick={() => paginate(i)}
                  title={answered ? 'Answered' : 'Unanswered'}
                  data-question={i + 1}
                >
                  {i + 1}
                  {answered && <FiCheck className="answered-icon" />}
                  {reviewed && <FiFlag className="marked-icon" />}
                </button>
              );
            })}
          </div>
        </aside>

        <div className="question-display">
          <div className="question-area">
            <h3>Q{currentQuestionIndex + 1}. {currentQ?.question_text}</h3>
          </div>

          {/* MCQ */}
          {currentQ?.question_type === 'MCQ' && currentQ.options?.map((opt, idx) => (
            <label key={idx} className="option">
              <input
                type="radio"
                name={`q_${currentQ._id}`}
                checked={answers[currentQ._id] === opt}
                onChange={() => handleAnswerSelect(currentQ, idx)}
              />
              <span className="option-text">{opt}</span>
            </label>
          ))}

          {/* True / False */}
          {currentQ?.question_type === 'TrueFalse' && (
            <div className="true-false-options">
              {['True', 'False'].map((label, idx) => (
                <label key={idx} className="option">
                  <input
                    type="radio"
                    name={`q_${currentQ._id}`}
                    checked={answers[currentQ._id] === label.toLowerCase()}
                    onChange={() => handleAnswerSelect(currentQ, idx)}
                  />
                  <span className="option-text">{label}</span>
                </label>
              ))}
            </div>
          )}

          {/* Short Answer / Text / Fill-in-the-blanks */}
          {['ShortAnswer', 'Text', 'FillInBlank'].includes(currentQ?.question_type) && (
            <textarea
              className="text-answer"
              placeholder="Type your answer here..."
              value={answers[currentQ._id] || ''}
              onChange={(e) => handleAnswerSelect(currentQ, e.target.value)}
            />
          )}

          {/* Pseudo-code or Code snippet */}
          {currentQ?.question_type === 'PseudoCode' && (
            <textarea
              className="code-answer"
              placeholder="Write your code here..."
              spellCheck="false"
              value={answers[currentQ._id] || ''}
              onChange={(e) => handleAnswerSelect(currentQ, e.target.value)}
            />
          )}

          <button
            type="button"
            className={`mark-review-btn ${markedForReview.includes(currentQ?._id) ? 'marked' : ''}`}
            onClick={() => handleMarkForReview(currentQ._id)}
            aria-label={markedForReview.includes(currentQ?._id) ? 'Unmark question for review' : 'Mark question for review'}
          >
            {markedForReview.includes(currentQ?._id) ? 'Unmark Review' : 'Mark for Review'}
          </button>
        </div>
      </main>

      <footer className="test-footer">
        <div className="progress-summary">
          <span>{answeredCount}/{questions.length} answered</span>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>

        <div className="action-buttons">
          <button
            type="button"
            className="btn btn-secondary clear-answer-btn"
            onClick={() => {
              if (window.confirm('Clear this answer?')) {
                setAnswers((prev) => {
                  const next = { ...prev };
                  delete next[currentQ._id];
                  saveAnswersToStorage(next);
                  return next;
                });
              }
            }}
            disabled={!isQuestionAnswered(currentQ)}
            aria-label="Clear answer"
          >
            Clear Answer
          </button>

          <div className="navigation-buttons">
            <button
              type="button"
              className="btn btn-secondary prev-question-btn"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              aria-label="Previous question"
            >
              <FiChevronLeft /> Previous
            </button>
            <div className="question-counter">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            <button
              type="button"
              className="btn btn-primary next-question-btn"
              onClick={handleNext}
              disabled={currentQuestionIndex === questions.length - 1}
              aria-label="Next question"
            >
              Next <FiChevronRight />
            </button>

            {currentQuestionIndex === questions.length - 1 && (
              <button
                type="button"
                className="btn btn-primary submit-test-btn"
                onClick={handleSubmit}
                disabled={isSubmitting}
                aria-label="Submit test"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Test'}
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
});

TestPage.propTypes = {
  questions: PropTypes.arrayOf(PropTypes.object),
  round: PropTypes.shape({
    time_limit_minutes: PropTypes.number,
    name: PropTypes.string,
    id: PropTypes.any
  }),
  onSubmitTest: PropTypes.func,
  apiUrl: PropTypes.string,
  userId: PropTypes.any
};

export default TestPage;
