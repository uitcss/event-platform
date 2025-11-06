import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../api";
import "./Results.css";

const Results = () => {
  const [rounds, setRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roundsLoading, setRoundsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all rounds on mount
  useEffect(() => {
    const fetchRounds = async () => {
      try {
        setRoundsLoading(true);
        const { data } = await api.get("/rounds");

        const roundsData = Array.isArray(data?.rounds) ? data.rounds : [];
        if (!roundsData.length) {
          setError("No rounds available. Please create rounds first.");
          setRounds([]);
          return;
        }

        // Sort and set first round as default
        roundsData.sort((a, b) => a.round_id - b.round_id);
        setRounds(roundsData);
        setSelectedRound(roundsData[0]._id);
      } catch (err) {
        console.error("Error fetching rounds:", err);
        setError("Failed to load rounds.");
        toast.error("Failed to load rounds.");
      } finally {
        setRoundsLoading(false);
      }
    };

    fetchRounds();
  }, []);

  // Fetch results for selected round
  useEffect(() => {
    if (!selectedRound) return;

    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching results for round:", selectedRound);
        const { data } = await api.get(`/results/round/${selectedRound}`);

        const resultsData = Array.isArray(data) ? data : [];

        if (!resultsData.length) {
          setError("No results found for this round.");
          setResults([]);
          return;
        }

        // Already sorted by score descending from backend
        setResults(resultsData);
      } catch (err) {
        console.error("Error fetching results:", err);
        const message =
          err.response?.data?.message || "Failed to load results.";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [selectedRound]);

  // Handle round change
  const handleRoundChange = (e) => {
    setSelectedRound(e.target.value);
  };

  return (
    <div className="page-container results-container">
      <div className="results-header">
        <h1>Results</h1>

        <div className="results-filter">
          <label htmlFor="round-select">Select Round:</label>
          {roundsLoading ? (
            <div className="loading-text">Loading rounds...</div>
          ) : rounds.length > 0 ? (
            <select
              id="round-select"
              className="results-dropdown"
              value={selectedRound || ""}
              onChange={handleRoundChange}
              disabled={loading}
            >
              {rounds.map((round) => (
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
                <th>Correct Answers</th>
                <th>Score</th>
                <th>Time Taken</th>
              </tr>
            </thead>
            <tbody>
              {results.length > 0 ? (
                results.map((r, index) => (
                  <tr key={r.user_id || index} className="results-table-row">
                    <td>{index + 1}</td>
                    <td>{r.name || "N/A"}</td>
                    <td>{r.email || "N/A"}</td>
                    <td>
                      {r.correct_answers} / {r.total_questions}
                    </td>
                    <td>{r.score}</td>
                    <td>{r.time_taken ? `${(r.time_taken / 60).toFixed(2)} min` : 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-results">
                    {error || "No results found for this round."}
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
