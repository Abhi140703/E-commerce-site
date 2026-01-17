import React from "react";
import { Link } from "react-router-dom";
import "./Hero.css";
import hand_icon from "../Assets/hand_icon.webp";
import hero_image from "../Assets/hero_img.jpg";

const Hero = () => {
  return (
    <div className="hero">
      <div className="hero-left">
        <h2>NEW ARRIVALS ONLY</h2>

        <div>
          <div className="hero-hand-icon">
            <p>new</p>
            <img src={hand_icon} alt="" />
          </div>
          <p>collection</p>
          <p>for everyone</p>
        </div>

        <Link to="/latest-collection" className="hero-latest-btn">
          <div>Latest Collection</div>
        </Link>
      </div>

      <div className="hero-right">
        <div className="hero-container">
          <img src={hero_image} alt="" />
        </div>
      </div>
    </div>
  );
};

export default Hero;
