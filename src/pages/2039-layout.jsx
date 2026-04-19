import React from "react";
import Seat from "../components/2039Seating";
import "../../css/labRoom.css";

const Layout2039 = ({ seatStates = {}, onBack }) => {
  return (
    <>
      <main className="lab-room-layout">
        <button onClick={onBack} className="back-button">← Back to Rooms</button>
        <Seat seatStates={seatStates} />
      </main>
    </>
  );
};

export default Layout2039;
