import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../Test.css';

const TestInstructions = ({ onStartTest, apiUrl, roundName, timeLimit }) => {
  const navigate = useNavigate();

  const handleStartTest = () => {
    // Clear any existing test data from localStorage
    localStorage.removeItem('testStartTime');
    localStorage.removeItem('testAnswers');
    
    // Set test start time
    localStorage.setItem('testStartTime', new Date().toISOString());
    
    // Notify parent component to start the test
    onStartTest();
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel the test? All your progress will be lost.')) {
      const userId = localStorage.getItem('userId');
      
      try {
        if (userId) {
          const response = await axios.post(`${apiUrl}/api/test/logout`, { userId });
          if (response.data.success) {
            toast.success('Logout successful');
          } else {
            toast.error(`Logout failed: ${response.data.message || 'Unknown error'}`);
          }
        }
      } catch (error) {
        console.error('Error during logout:', error);
        toast.error('Error during logout. Please try again.');
      } finally {
        // Clear all test-related data
        localStorage.removeItem('userId');
        localStorage.removeItem('testStartTime');
        localStorage.removeItem('testAnswers');
        localStorage.removeItem('markedForReview');
        
        
        // Show notification
        toast.info('Test cancelled. You can start again later.');
        
        // Navigate to contest page after a short delay
        setTimeout(() => {
          navigate('/contest');
        }, 1000);
      }
    }
  };

  return (
    <div className="instructions-container">
      <h2 className="instructions-title">Test Instructions</h2>
      
      <div>
        <h3>Round: {roundName}</h3>
        <p className="instructions-text">
          Please read the following instructions carefully before starting the test.
        </p>
        
        <div className="instructions-warning">
          <div className="flex">
            <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p>
              <strong>Time Limit:</strong> {timeLimit} minutes
            </p>
          </div>
        </div>

        <ul className="instructions-list">
          <li>
            The test consists of multiple-choice questions (MCQs) and true/false questions.
          </li>
          
          <li>
            You have <strong>{timeLimit} minutes</strong> to complete the test.
          </li>
          
          <li>
            The test will automatically submit when the time runs out.
          </li>
         <li>
            On changing tabs , the test will be submitted automatically after 3 warnings.
          </li>
          <li>
            Do not refresh the page or use the browser's back button during the test.
          </li>
          
          <li>
            Make sure you have a stable internet connection throughout the test.
          </li>
        </ul>
      </div>

      <div className="instructions-actions">
        <button
          onClick={handleStartTest}
          className="btn btn-primary"
        >
          Start Test
        </button>
        <button
          onClick={handleCancel}
          className="btn btn-secondary"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TestInstructions;
