import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import './UploadQuestions.css';

const UploadQuestions = () => {
  const navigate = useNavigate();
  const { roundId: initialRoundId } = useParams();
  const [rounds, setRounds] = useState([]);
  const [selectedRoundId, setSelectedRoundId] = useState(initialRoundId || '');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState({
    rounds: false,
    questions: false,
    form: false
  });
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    question_text: '',
    question_type: 'MCQ',
    options: ['', ''],
    correct_answer: '',
    correct_option_index: -1 // Track the index of the correct option
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch available rounds
  useEffect(() => {
    const fetchRounds = async () => {
      try {
        setLoading(prev => ({ ...prev, rounds: true }));
        const response = await api.get('/rounds');
        const rounds = response.data.rounds || [];

        
        setRounds(rounds);
        
        // If no round is selected but we have rounds, select the first one
        if (!selectedRoundId && rounds.length > 0) {
          setSelectedRoundId(rounds[0]._id);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching rounds:', err);
        setError('Failed to load rounds. Please try again.');
      } finally {
        setLoading(prev => ({ ...prev, rounds: false }));
      }
    };

    fetchRounds();
  }, []);

  // Fetch questions when selected round changes
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedRoundId) return;
      
      try {
        setLoading(prev => ({ ...prev, questions: true }));
        const response = await api.get(`/questions/round/${selectedRoundId}`);
        setQuestions(response.data.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions. Please try again.');
      } finally {
        setLoading(prev => ({ ...prev, questions: false }));
      }
    };

    fetchQuestions();
    
    // Update URL when round changes
    if (selectedRoundId) {
      navigate(`/questions/${selectedRoundId}`, { replace: true });
    }
  }, [selectedRoundId, navigate]);
  
  const handleRoundChange = (e) => {
    setSelectedRoundId(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    
    setFormData(prev => {
      // If we're updating the correct answer's text, update the correct_answer as well
      const correct_answer = prev.correct_option_index === index ? value : prev.correct_answer;
      
      return {
        ...prev,
        options: newOptions,
        correct_answer
      };
    });
  };

  const addOption = () => {
    if (formData.options.length < 5) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, ''],
        // Only reset correct_answer if we're adding a new option and no correct answer is set
        correct_answer: prev.correct_answer === '' ? '' : prev.correct_answer
      }));
    }
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = [...formData.options];
      const removedOption = newOptions[index];
      newOptions.splice(index, 1);
      
      setFormData(prev => {
        // If we're removing the correct answer, clear it
        const correct_answer = prev.correct_answer === removedOption ? '' : prev.correct_answer;
        let correct_option_index = prev.correct_option_index;
        
        // Adjust the correct_option_index if needed
        if (index < correct_option_index) {
          correct_option_index--;
        } else if (index === correct_option_index) {
          correct_option_index = -1;
        }
        
        return {
          ...prev,
          options: newOptions,
          correct_answer,
          correct_option_index
        };
      });
    }
  };

  const resetForm = () => {
    setFormData({
      question_text: '',
      question_type: 'MCQ',
      options: ['', ''],
      correct_answer: '',
      correct_option_index: -1
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedRoundId) {
      setError('Please select a round first');
      return;
    }
    
    if (!formData.question_text.trim()) {
      setError('Question text is required');
      return;
    }
    
    // Ensure we have the round object
    const round = rounds.find(r => r._id === selectedRoundId);
    if (!round) {
      setError('Invalid round selected');
      return;
    }

    if (formData.question_type === 'MCQ') {
      // Check all options are filled
      if (formData.options.some(opt => !opt.trim())) {
        setError('All options must be filled');
        return;
      }
      
      // Check if a correct answer is selected
      if (!formData.correct_answer || formData.correct_option_index === -1) {
        setError('Please select the correct answer');
        return;
      }
      
      // Ensure the correct answer matches one of the options
      if (!formData.options.includes(formData.correct_answer)) {
        setError('The correct answer must match one of the options');
        return;
      }
      
      // Ensure we have at least 2 options
      if (formData.options.length < 2) {
        setError('At least 2 options are required');
        return;
      }
      
      
      // Remove any duplicate options (case-insensitive)
      const uniqueOptions = [];
      const seen = new Set();
      const normalizedOptions = formData.options.map(opt => opt.trim());
      
      for (const opt of normalizedOptions) {
        const lowerOpt = opt.toLowerCase();
        if (!seen.has(lowerOpt)) {
          seen.add(lowerOpt);
          uniqueOptions.push(opt);
        }
      }
      
      if (uniqueOptions.length !== formData.options.length) {
        setFormData(prev => ({
          ...prev,
          options: uniqueOptions,
          // Update correct_answer if it was removed due to being a duplicate
          correct_answer: uniqueOptions.includes(prev.correct_answer) 
            ? prev.correct_answer 
            : ''
        }));
        setError('Duplicate options were removed. Please select the correct answer again.');
        return;
      }
    }

    try {
      setLoading(prev => ({ ...prev, form: true }));
      
      if (editingId) {
        // Update existing question
        await api.put(`/questions/${editingId}`, formData);
      } else {
        // Create new question with the selected round_id
        await api.post(`/questions/round/${selectedRoundId}`, formData);
      }
      
      // Refresh questions list
      setLoading(prev => ({ ...prev, questions: true }));
      const response = await api.get(`/questions/round/${selectedRoundId}`);
      setQuestions(response.data.data || []);
      resetForm();
      setError(null);
    } catch (err) {
      console.error('Error saving question:', err);
      setError(err.response?.data?.message || 'Failed to save question');
    } finally {
      setLoading(prev => ({ ...prev, form: false, questions: false }));
    }
  };

  const handleEdit = (question) => {
    const options = question.options || ['', ''];
    const correct_answer = question.correct_answer || '';
    const correct_option_index = question.question_type === 'MCQ' 
      ? options.findIndex(opt => opt === correct_answer)
      : -1;
    
    setFormData({
      question_text: question.question_text,
      question_type: question.question_type,
      options,
      correct_answer,
      correct_option_index
    });
    setEditingId(question._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        setLoading(prev => ({ ...prev, form: true }));
        await api.delete(`/questions/${id}`);
        // Refresh questions list after deletion
        const response = await api.get(`/questions/round/${selectedRoundId}`);
        setQuestions(response.data.data || []);
        setError(null);
      } catch (err) {
        console.error('Error deleting question:', err);
        setError(err.response?.data?.message || 'Failed to delete question');
      } finally {
        setLoading(prev => ({ ...prev, form: false, questions: false }));
      }
    }
  };

  return (
    <div className="page-container">
      <div className="question-container">
      <div className="page-header">
        <h2>Manage Questions</h2>
        <div className="round-selector">
          <label>Select Round:</label>
          <select 
            value={selectedRoundId || ''} 
            onChange={handleRoundChange}
            disabled={loading.rounds || loading.questions}
          >
            {loading.rounds ? (
              <option>Loading rounds...</option>
            ) : rounds.length === 0 ? (
              <option value="">No rounds available</option>
            ) : (
              rounds.map(round => (
                <option key={round._id} value={round._id}>
                  {round.round_name} (Round {round.round_id})
                </option>
              ))
            )}
          </select>
        </div>
      </div>
      
      {error && (
        <div className="error-message" style={{ color: '#FF6F61', marginBottom: '15px' }}>
          {error}
        </div>
      )}
      
      {!selectedRoundId && !loading.rounds && rounds.length === 0 && (
        <div className="no-rounds-message">
          <p>No rounds available. Please create a round first.</p>
        </div>
      )}
      
      <div className="card">
        <h3>{editingId ? 'Edit Question' : 'Add New Question'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Question Text</label>
            <textarea
              name="question_text"
              value={formData.question_text}
              onChange={handleInputChange}
              placeholder="Enter question text"
              rows="3"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Question Type</label>
            <select
              name="question_type"
              value={formData.question_type}
              onChange={handleInputChange}
              disabled={!!editingId}
            >
              <option value="MCQ">Multiple Choice</option>
              <option value="TrueFalse">True/False</option>
              <option value="ShortAnswer">Short Answer</option>
            </select>
          </div>
          
          {formData.question_type === 'MCQ' && (
            <div className="form-group">
              <label>Options</label>
              {formData.options.map((option, index) => (
                <div key={index} className="option-row">
                  <label>
                    <input
                      type="radio"
                      name="correct_option"
                      checked={formData.correct_answer === option && option !== ''}
                      onChange={() => setFormData(prev => ({
                        ...prev,
                        correct_answer: option,
                        correct_option_index: index
                      }))}
                      disabled={!option.trim()}
                    />
                    <span className="radio-custom"></span>
                  </label>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    required
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => removeOption(index)}
                      style={{ marginLeft: '10px' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {formData.options.length < 5 && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={addOption}
                  style={{ marginTop: '10px' }}
                >
                  Add Option
                </button>
              )}
            </div>
          )}
          
          {formData.question_type === 'TrueFalse' && (
            <div className="form-group">
              <label>Correct Answer</label>
              <div>
                <label>
                  <input
                    type="radio"
                    name="correct_answer_tf"
                    checked={formData.correct_answer === 'true'}
                    onChange={() => setFormData(prev => ({
                      ...prev,
                      correct_answer: 'true'
                    }))}
                  />
                  True
                </label>
                <label style={{ marginLeft: '20px' }}>
                  <input
                    type="radio"
                    name="correct_answer_tf"
                    checked={formData.correct_answer === 'false'}
                    onChange={() => setFormData(prev => ({
                      ...prev,
                      correct_answer: 'false'
                    }))}
                  />
                  False
                </label>
              </div>
            </div>
          )}
          
          {formData.question_type === 'ShortAnswer' && (
            <div className="form-group">
              <label>Expected Answer</label>
              <input
                type="text"
                name="correct_answer"
                value={formData.correct_answer}
                onChange={handleInputChange}
                placeholder="Expected answer (not case sensitive)"
              />
            </div>
          )}
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading.form}
            >
              {loading.form ? 'Saving...' : editingId ? 'Update Question' : 'Add Question'}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn-secondary"
                onClick={resetForm}
                style={{ marginLeft: '10px' }}
                disabled={loading.form}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      <div className="questions-list" style={{ marginTop: '30px' }}>
        <h3>Existing Questions</h3>
        {loading.questions ? (
          <p>Loading questions...</p>
        ) : questions.length === 0 ? (
          <p>No questions found for this round.</p>
        ) : (
          <table className="questions-table">
            <thead>
              <tr>
                <th>S.NO</th>
                <th>Question</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((question, index) => (
                <tr key={question._id}>
                  <td>{index+1}</td>
                  <td>{question.question_text}</td>
                  <td>
                    {question.question_type === 'MCQ' && 'Multiple Choice'}
                    {question.question_type === 'TrueFalse' && 'True/False'}
                    {question.question_type === 'ShortAnswer' && 'Short Answer'}
                  </td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(question)}
                      disabled={loading.questions || loading.form}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(question._id)}
                      disabled={loading.questions || loading.form}
                      style={{ marginLeft: '10px' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      </div>
    </div>
  );
};

export default UploadQuestions;
