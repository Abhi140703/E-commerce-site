import React, { useState } from "react";
import "./NewsLetter.css";

const NewsLetter = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!email) return; // optional safety
    setSubmitted(true);
  };

  return (
    <div className="newsletter">
      {!submitted ? (
        <>
          <h1>Get Exclusive Offers On Your Email</h1>
          <p>Subscribe to our newsletter and stay updated</p>

          <div className="newsletter-input">
            <input
              type="email"
              placeholder="Your Email Id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleSubmit}>Subscribe</button>
          </div>
        </>
      ) : (
        <div className="thank-you-message">
          <h2>Thank you for your response 💖</h2>
          <p>Your response has been submitted successfully.</p>
        </div>
      )}
    </div>
  );
};

export default NewsLetter;
