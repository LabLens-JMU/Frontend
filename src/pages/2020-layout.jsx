import React from "react";
import Seat from "../components/2020Seating";
import "../../css/labRoom.css";

const Layout2020 = ({ seatStates = {} }) => {
  return (
    <>
      <main className="lab-room-layout">
        <Seat seatStates={seatStates} />
      </main>
    </>
  );
};

export default Layout2020;
