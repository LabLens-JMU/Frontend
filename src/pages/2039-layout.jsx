import React from "react";
import Seat from "../components/2039Seating";
import "../../css/labRoom.css";

const Layout2039 = ({ seatStates = {} }) => {
  return (
    <>
      <main className="lab-room-layout">
        <Seat seatStates={seatStates} />
      </main>
    </>
  );
};

export default Layout2039;
