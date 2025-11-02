import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiCheck, FiX, FiChevronLeft, FiChevronRight, FiRefreshCw } from 'react-icons/fi';
import './ValidatingAnswers.css';
import api from '../../api';

const ValidatingAnswers = () => {
  const [submissions, setSubmissions] = useState([]);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    pendingValidation: 0,
    validated: 0,
    correctSubmissions: 0,
    incorrectSubmissions: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [refreshing, setRefreshing] = useState(false);

  const navigate = useNavigate();

  const fetchSubmissions = async () => {
    try {
      setRefreshing(true);
      const [submissionsRes, statsRes] = await Promise.all([
        api.get('/answer-validation'),
        api.get('/answer-validation/stats')
      ]);
      
      setSubmissions(submissionsRes.data);
      setStats(statsRes.data);
      
      if (submissionsRes.data.length > 0 && !currentSubmission) {
        setCurrentSubmission(submissionsRes.data[0]);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleValidate = async (isCorrect) => {
    if (!currentSubmission) return;

    try {
      await api.put(`/answer-validation/${currentSubmission._id}`, { is_correct: isCorrect });
      
      const updatedSubmission = { ...currentSubmission, is_correct: isCorrect };
      setCurrentSubmission(updatedSubmission);
      
      const updatedSubmissions = submissions.map(sub => 
        sub._id === currentSubmission._id ? updatedSubmission : sub
      );
      
      setSubmissions(updatedSubmissions);
      
      setStats(prev => ({
        ...prev,
        pendingValidation: isCorrect || !isCorrect ? prev.pendingValidation - 1 : prev.pendingValidation,
        validated: prev.validated + 1,
        correctSubmissions: isCorrect ? prev.correctSubmissions + 1 : prev.correctSubmissions,
        incorrectSubmissions: !isCorrect ? prev.incorrectSubmissions + 1 : prev.incorrectSubmissions
      }));
      
      toast.success(`Marked as ${isCorrect ? 'correct' : 'incorrect'}`);
      
      const currentIndex = submissions.findIndex(sub => sub._id === currentSubmission._id);
      if (currentIndex < submissions.length - 1) {
        setCurrentSubmission(updatedSubmissions[currentIndex + 1]);
      } else if (currentIndex > 0) {
        setCurrentSubmission(updatedSubmissions[currentIndex - 1]);
      }
    } catch (error) {
      console.error('Error validating submission:', error);
      toast.error('Failed to validate submission');
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = submissions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(submissions.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
    <div className="validating-answers">
      <div className="validating-answers__header">
        <h1 className="validating-answers__title">Answer Validation</h1>
        <p className="validating-answers__subtitle">Review and validate user submissions</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3 className="stat-card__title">Total Submissions</h3>
          <p className="stat-card__value">{stats.totalSubmissions}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-card__title">Pending Validation</h3>
          <p className="stat-card__value">{stats.pendingValidation}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-card__title">Correct Answers</h3>
          <p className="stat-card__value">{stats.correctSubmissions}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-card__title">Incorrect Answers</h3>
          <p className="stat-card__value">{stats.incorrectSubmissions}</p>
        </div>
      </div>

      <div className="submission-container">
        {/* Submissions List */}
        <div className="submission-list-container">
          <div className="submission-list__header">
            <h2 className="submission-list__title">Submissions</h2>
            <button 
              onClick={fetchSubmissions}
              disabled={refreshing}
              className="submission-list__refresh"
              title="Refresh"
            >
              <FiRefreshCw className={refreshing ? 'submission-list__refresh-icon--spinning' : 'submission-list__refresh-icon'} />
            </button>
          </div>
          
          {submissions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">
                <svg
                  className="empty-state__icon-svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="empty-state__title">No submissions found</h3>
              <p className="empty-state__description">There are no submissions to validate at this time.</p>
            </div>
          ) : (
            <div className="submission-list">
              {currentItems.map((submission) => {
                let statusClass = '';
                let statusText = 'Pending';
                
                if (submission.is_correct === true) {
                  statusClass = 'status-badge--correct';
                  statusText = 'Correct';
                } else if (submission.is_correct === false) {
                  statusClass = 'status-badge--incorrect';
                  statusText = 'Incorrect';
                } else {
                  statusClass = 'status-badge--pending';
                }

                return (
                  <div 
                    key={submission._id}
                    onClick={() => setCurrentSubmission(submission)}
                    className={`submission-item ${
                      currentSubmission?._id === submission._id ? 'submission-item--selected' : ''
                    }`}
                  >
                    <div className="submission-item__user">
                      {submission.user_id?.name || 'Unknown User'}
                    </div>
                    <div className="submission-item__meta">
                      <span>
                        {submission.round_id?.round_name || 'Round'} • {new Date(submission.createdAt).toLocaleDateString()}
                      </span>
                      <span className={`status-badge ${statusClass}`}>
                        {statusText}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {submissions.length > itemsPerPage && (
            <div className="pagination">
              <button
                onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                disabled={currentPage === 1}
                className="pagination__button"
              >
                <FiChevronLeft />
              </button>
              <span className="pagination__info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                disabled={currentPage === totalPages}
                className="pagination__button"
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </div>

        {/* Submission Details */}
        <div className="submission-detail">
          {currentSubmission ? (
            <>
              <div className="submission-detail__header">
                <div>
                  <h2 className="submission-detail__title">
                    {currentSubmission.user_id?.name || 'Unknown User'}'s Submission
                  </h2>
                  <p className="submission-detail__meta">
                    {currentSubmission.round_id?.round_name || 'Round'} • {new Date(currentSubmission.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="submission-detail__status">
                  {currentSubmission.is_correct === true && (
                    <span className="status-badge status-badge--correct">
                      <FiCheck className="status-badge__icon" /> Validated as Correct
                    </span>
                  )}
                  {currentSubmission.is_correct === false && (
                    <span className="status-badge status-badge--incorrect">
                      <FiX className="status-badge__icon" /> Validated as Incorrect
                    </span>
                  )}
                  {currentSubmission.is_correct === null && (
                    <span className="status-badge status-badge--pending">
                      Awaiting Validation
                    </span>
                  )}
                </div>
              </div>

              <div className="submission-detail__content">
                <div className="answer-section">
                  <h3 className="answer-section__title">Question</h3>
                  <div className="answer-box answer-box--question">
                    {currentSubmission.question_id?.question_text || 'Question text not available'}
                  </div>
                </div>

                <div className="answer-section">
                  <h3 className="answer-section__title">Correct Answer</h3>
                  <div className="answer-box answer-box--correct">
                    {currentSubmission.question_id?.correct_answer || 'Correct answer not available'}
                  </div>
                </div>

                <div className="answer-section">
                  <h3 className="answer-section__title">User's Answer</h3>
                  <div className="answer-box answer-box--user">
                    {currentSubmission.user_answer || 'No answer provided'}
                  </div>
                </div>

                {currentSubmission.is_correct === null && (
                  <div className="validation-actions">
                    <button
                      onClick={() => handleValidate(true)}
                      className="validation-button validation-button--correct"
                    >
                      <FiCheck className="validation-button__icon" />
                      <span>Mark as Correct</span>
                    </button>
                    <button
                      onClick={() => handleValidate(false)}
                      className="validation-button validation-button--incorrect"
                    >
                      <FiX className="validation-button__icon" />
                      <span>Mark as Incorrect</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state__icon">
                <svg
                  className="empty-state__icon-svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="empty-state__title">No submission selected</h3>
              <p className="empty-state__description">
                {submissions.length > 0
                  ? 'Select a submission from the list to view details'
                  : 'No submissions require validation at this time.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default ValidatingAnswers;