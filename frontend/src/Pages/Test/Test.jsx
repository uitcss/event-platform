import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TestInstructions from './components/TestInstructions';
import TestPage from './components/TestPage';
import './Test.css';

const Test = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [round, setRound] = useState(null);
  const [apiUrl] = useState('http://localhost:4000');
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  
  // Check if user is authenticated and fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        navigate('/contest');
        return;
      }
      
      // Check if we should redirect to contest
      const shouldRedirect = sessionStorage.getItem('redirectToContest');
      if (shouldRedirect) {
        sessionStorage.removeItem('redirectToContest');
        window.location.href = '/contest';
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.post(`${apiUrl}/api/test`, {
          userId: userId
        })
        
        if (response.data.success) {
          setQuestions(response.data.questions);
          setRound({
            id: response.data.round.id,
            round_id: response.data.round.round_id,
            name: response.data.round.name,
            time_limit_minutes: response.data.round.time_limit_minutes
          });
        } else {
          // If not successful, set a flag in session storage and reload
          sessionStorage.setItem('redirectToContest', 'true');
          window.location.reload();
          return;
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        const errorMessage = error.response?.data?.message || 'Failed to load questions. Please try again.';
        
        if (error.response?.status === 401) {
          toast.error('Session expired. Please log in again.');
          navigate('/contest');
          return;
        } 
        
        if (error.response?.status === 403) {
          // Handle specific 403 error messages
          if (errorMessage.includes('not active')) {
            toast.error('Your account is not active. Please contact the admin.');
          } else if (errorMessage.includes('not eligible')) {
            toast.error('You are not eligible for this round.');
          } else {
            toast.error('Access denied. Please contact support.');
          }
          // Redirect to contest page after showing the error
          setTimeout(() => navigate('/contest', { replace: true }), 2000);
          return;
        }
        
        if (error.response?.status === 404) {
          if (errorMessage.includes('No active round')) {
            toast.error('No active round found. Please try again later.');
          } else if (errorMessage.includes('No questions available')) {
            toast.error('No questions available for this round yet.');
          } else {
            toast.error('The requested resource was not found.');
          }
          setTimeout(() => navigate('/contest', { replace: true }), 2000);
          return;
        }
        
        // For all other errors
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [apiUrl, navigate, userId]);

  const handleLogout = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/contest');
      return;
    }

    try {
      await axios.post(
        `${apiUrl}/api/test/logout`, 
        { user_id: userId }
      );
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout. Please try again.');
    } finally {
      localStorage.removeItem('userId');
      setTestStarted(false);
      setQuestions([]);
      setRound(null);
      navigate('/contest');
    }
  };

  const handleStartTest = () => {
    setTestStarted(true);
  };

  const handleTestComplete = () => {
    // Reset the test state
    setTestStarted(false);
    setQuestions([]);
    setRound(null);
    
    // Redirect to home page
    navigate('/');
    toast.success('Your test has been submitted successfully!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  // Show test instructions if not started
  if (!testStarted && round) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <TestInstructions 
              onStartTest={handleStartTest} 
              roundName={round.name} 
              timeLimit={round.time_limit_minutes}
              apiUrl={apiUrl}
            />
          </div>
        </div>
    );
  }

  // Show the test
  if (testStarted && questions.length > 0 && round) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <TestPage 
            questions={questions} 
            round={round} 
            onSubmitTest={handleTestComplete} 
            apiUrl={apiUrl}
            userId={localStorage.getItem('userId')}
          />
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-lg text-gray-600">Loading test...</div>
      </div>
    </div>
  );
};

export default Test;
