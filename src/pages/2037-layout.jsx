import React from "react";
import Seat from "../components/2037Seating";
import "../../css/labRoom.css";

const Layout2037 = ({ seatStates = {} }) => {
  return (
    <>
      <main className="lab-room-layout">
        <Seat seatStates={seatStates} />
      </main>
    </>
  );
};

export default Layout2037;
