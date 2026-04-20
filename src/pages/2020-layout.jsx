import React from "react";
import Seat from "../components/2020Seating";
import "../../css/labRoom.css";

const Layout2020 = ({ seatStates = {}, onBack }) => {
  return (
    <>
      <main className="lab-room-layout">
        <button onClick={onBack} className="back-button">&lt; Back to Rooms</button>
        <div className="room-scroll-shell">
          <Seat seatStates={seatStates} />
        </div>
      </main>
    </>
  );
};

export default Layout2020;
