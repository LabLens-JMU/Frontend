import React from "react";
import "../../css/Card.css";

const Card = ({ onSelectRoom }) => {
  return (
    <section className="container">
      <div className="hero-card">
        <h3 className="room">Lab Room 2020</h3>
        <p className="description">Occupancy: 0</p>
      </div>
      <div className="hero-card">
        <h3 className="room">Lab Room 2039</h3>
        <p className="description">Occupancy: 0</p>
      </div>
    </section>
  );
};

export default Card;
