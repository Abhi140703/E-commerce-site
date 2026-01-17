import React, { useState } from "react";
import "./Offers.css";
import exclusive_image from "../Assets/exclusive_image.jpg";

const Offers = () => {
  const [showMessage, setShowMessage] = useState(false);

  return (
    <div className="offers">
      <div className="offers-left">
        {!showMessage ? (
          <>
            <h1>Exclusive</h1>
            <h1>Offers For You</h1>
            <p>ONLY ON BEST SELLERS PRODUCTS</p>
            <button onClick={() => setShowMessage(true)}>Check Now</button>
          </>
        ) : (
          <div className="offers-message">
            <h2>🎉 Offers are arriving very soon!</h2>
            <p>Stay tuned for exciting deals and discounts.</p>
          </div>
        )}
      </div>

      <div className="offers-right">
        <div className="image-container">
          <img src={exclusive_image} alt="" />
        </div>
      </div>
    </div>
  );
};

export default Offers;
