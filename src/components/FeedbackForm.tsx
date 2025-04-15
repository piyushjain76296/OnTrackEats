import React, { useState } from 'react';

const FeedbackForm = () => {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Feedback submitted:', feedback); // Replace with API call
    setFeedback('');
    setSubmitted(true);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Support / Feedback</h2>
      {submitted ? (
        <p className="text-green-600">Thanks for your feedback!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full p-2 border rounded mb-4"
            rows={4}
            placeholder="Enter your feedback or support query..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default FeedbackForm;
