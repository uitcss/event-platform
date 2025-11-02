import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import "./Results.css";
import api from '../../api';

const Results = () => {
  const [rounds, setRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState(null);
  const [selectedRoundId, setSelectedRoundId] = useState(null); // Store the numeric round_id separately
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roundsLoading, setRoundsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch all rounds
  useEffect(() => {
    const fetchRounds = async () => {
      try {
        setRoundsLoading(true);
        console.log('Fetching rounds...');
        
        let response;
        try {
          response = await api.get('/rounds');
          console.log('Rounds API Response:', response.data);
        } catch (err) {
          console.error('Error fetching rounds:', err);
          throw new Error(`Failed to load rounds: ${err.response?.data?.message || err.message}`);
        }
        
        // The API returns { message: string, rounds: Array }
        const roundsData = Array.isArray(response?.data?.rounds) ? response.data.rounds : [];
        console.log('Parsed Rounds:', roundsData);
        
        if (roundsData.length === 0) {
          console.warn('No rounds available in the response');
          setError('No rounds available. Please create rounds first.');
        } else {
          // Sort rounds by round_id to ensure consistent ordering
          roundsData.sort((a, b) => a.round_id - b.round_id);
          setRounds(roundsData);
          
          // Set the first round as selected if available
          if (roundsData.length > 0) {
            console.log('Setting selected round to:', roundsData[0]._id, 'Round ID:', roundsData[0].round_id);
            setSelectedRound(roundsData[0]._id);
            setSelectedRoundId(roundsData[0].round_id);
          }
        }
      } catch (err) {
        console.error('Error fetching rounds:', err);
        setError('Failed to load rounds. Please try again.');
        toast.error('Failed to load rounds');
        setRounds([]);
      } finally {
        setRoundsLoading(false);
      }
    };

    fetchRounds();
  }, []);

  // Fetch results when selectedRound changes
  useEffect(() => {
    const fetchResults = async () => {
      if (!selectedRoundId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching users for round ID:', selectedRoundId);
        
        // First, get all users in the selected round
        let usersResponse;
        try {
          // Use the numeric round_id to find users
          usersResponse = await api.get(`/users/round/${selectedRoundId}`);
          console.log('Users in round:', usersResponse.data);
        } catch (err) {
          console.error('Error fetching users:', err);
          throw new Error(`Failed to fetch users: ${err.response?.data?.message || err.message}`);
        }
        
        const users = Array.isArray(usersResponse.data) ? usersResponse.data : [];
        
        if (users.length === 0) {
          console.log('No users found in this round');
          setResults([]);
          setError('No users found in this round');
          return;
        }
        
        // Then, get the results for each user
        const resultsPromises = users.map(async (user) => {
          try {
            if (!user._id) {
              console.warn('User has no _id:', user);
              return null;
            }
            
            console.log(`Fetching results for user ${user._id}`);
            let response;
            try {
              response = await api.get(`/results/user/${user._id}`);
              console.log(`Results for user ${user._id}:`, response.data);
            } catch (err) {
              console.error(`Error fetching results for user ${user._id}:`, err);
              // If there's an error, we'll still include the user but mark as not attempted
              return {
                user_id: user._id,
                name: user.name || 'Unknown',
                email: user.email || 'No email',
                score: 0,
                total_marks_possible: 0,
                correct_answers: 0,
                total_questions: 0,
                hasError: true,
                error: err.response?.data?.message || 'Error loading results'
              };
            }
            
            // Handle different response formats
            let userResults = [];
            if (Array.isArray(response.data)) {
              userResults = response.data;
            } else if (response.data && Array.isArray(response.data.results)) {
              userResults = response.data.results;
            } else if (response.data) {
              // Handle case where the response is a single result object
              userResults = [response.data];
            }
            
            // Try to find a matching result for the current round
            const roundResult = userResults.find(r => 
              r?.round === selectedRound || 
              r?.round_id === selectedRoundId ||
              r?.round?._id === selectedRound
            );
            
            if (roundResult) {
              return {
                user_id: user._id,
                name: user.name || 'Unknown',
                email: user.email || 'No email',
                ...roundResult,
                // Ensure all required fields have defaults
                score: roundResult.score || 0,
                total_marks_possible: roundResult.total_marks_possible || roundResult.totalMarks || 1,
                correct_answers: roundResult.correct_answers || roundResult.correctAnswers || 0,
                total_questions: roundResult.total_questions || roundResult.totalQuestions || 0
              };
            }
            
            // If no matching result found, return a default result
            return {
              user_id: user._id,
              name: user.name || 'Unknown',
              email: user.email || 'No email',
              score: 0,
              total_marks_possible: 0,
              correct_answers: 0,
              total_questions: 0,
              notAttempted: true
            };
            
          } catch (err) {
            console.error(`Unexpected error processing user ${user._id}:`, err);
            return null;
          }
        });
        
        const resultsData = (await Promise.all(resultsPromises)).filter(Boolean);
        console.log('Final results data:', resultsData);
        
        // Sort results by score (descending)
        const sortedResults = [...resultsData].sort((a, b) => (b.score || 0) - (a.score || 0));
        
        setResults(sortedResults);
        
        if (sortedResults.length === 0) {
          setError('No results found for this round');
        } else if (sortedResults.every(r => r.notAttempted)) {
          setError('No users have attempted this round yet');
        } else {
          setError(null);
        }
      } catch (err) {
        console.error('Error in fetchResults:', err);
        const errorMessage = err.response?.data?.message || 'Failed to load results. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [selectedRoundId]);

  // Handle round selection change
  const handleRoundChange = (e) => {
    const roundId = e.target.value;
    const selected = rounds.find(r => r._id === roundId);
    console.log('Round changed to:', roundId, 'Round ID:', selected?.round_id);
    setSelectedRound(roundId);
    setSelectedRoundId(selected?.round_id);
  };

  const getRoundName = (roundId) => {
    const round = rounds.find(r => r._id === roundId);
    return round ? `Round ${round.round_id}` : 'Unknown Round';
  };

  return (
    <div className="page-container results-container  ">
      <div className="results-header">
        <h1>Results</h1>
        <div className="results-filter">
          <label htmlFor="round-select">Select Round: </label>
          {roundsLoading ? (
            <div className="loading-text">Loading rounds...</div>
          ) : Array.isArray(rounds) && rounds.length > 0 ? (
            <select 
              id="round-select" 
              className="results-dropdown"
              value={selectedRound}
              onChange={handleRoundChange}
              disabled={loading}
            >
              {rounds.map(round => (
                <option key={round._id} value={round._id}>
                  {round.round_name} (Round {round.round_id})
                </option>
              ))}
            </select>
          ) : (
            <div className="no-rounds">No rounds available</div>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="results-table-container">
        {loading ? (
          <div className="loading-message">Loading results...</div>
        ) : (
          <table className="results-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Email</th>
                <th>Score</th>
                <th>Correct Answers</th>
                <th>Marks</th>
              </tr>
            </thead>
            <tbody>
              {results.length > 0 ? (
                results.map((result, index) => {
                  // Safely extract values with defaults
                  const score = result.score || 0;
                  const totalMarks = result.total_marks_possible || result.totalMarks || 1; // Avoid division by zero
                  const correctAnswers = result.correct_answers || result.correctAnswers || 0;
                  const totalQuestions = result.total_questions || result.totalQuestions || 0;
                  const percentage = Math.round((score / totalMarks) * 100) || 0;
                  
                  return (
                    <tr key={result.user_id || index} className="results-table-row">
                      <td>{index + 1}</td>
                      <td>{result.name || 'N/A'}</td>
                      <td>{result.email || 'N/A'}</td>
                      <td>{score} / {totalMarks}</td>
                      <td>{correctAnswers} / {totalQuestions}</td>
                      <td>{score}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="no-results">
                    {error || 'No results found for this round.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Results;
