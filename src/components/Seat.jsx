import React from "react";
import "../../css/Seat.css";

const Seat = () => {
  const seatStatus = "Not finished";

  return (
    <>
      <main className='room-seats'>
        <div className="seat-1 block">
          <p>Seat #...</p>
          <p>Status: {seatStatus}</p>
        </div>
        <div className="seat-2 block">
          <p>Seat #...</p>
          <p>Status: {seatStatus}</p>
        </div>
        <div className="seat-3 block">
          <p>Seat #...</p>
          <p>Status: {seatStatus}</p>
        </div>
      </main>
    </>
  );
};

export default Seat;
