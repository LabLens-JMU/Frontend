import React from "react";
import "../../css/Seat.css";

const getSeatStatus = (seatStates, seatNumber) => {
  const state = seatStates?.[seatNumber];

  if (state === "full") {
    return "full";
  }

  if (state === "empty") {
    return "empty";
  }

  return "idle";
};

// Render one horizontal block of 6 seats, each colored by its live status.
const renderSeatRow = (startSeat, seatStates) => (
  <section className="room-seats row" key={`row-${startSeat}`}>
    {Array.from({ length: 6 }, (_, seatOffset) => {
      const seatNumber = startSeat + seatOffset;

      return (
        <div
          key={seatNumber}
          className={`seat block ${getSeatStatus(seatStates, seatNumber)}`}
        >
          <p>Seat #{seatNumber}</p>
        </div>
      );
    })}
  </section>
);

const Seating2020 = ({ seatStates = {} }) => {
  return (
    <>
      <div className="roomContainer">
        <section className="front-row">
          <div className="block hor-board">
            <p>Board</p>
          </div>
          <div className="block hor-board">
            <p>Board</p>
          </div>
          <div className="block hor-board">
            <p>Board</p>
          </div>
        </section>

        <section className="room-body">
          <aside className="left-wall">
            <div className="block vert-board">
              <p>Board</p>
            </div>
          </aside>
          <div className="seat-columns">
            <section className="col">
              {[1, 7, 13].map((startSeat) =>
                renderSeatRow(startSeat, seatStates),
              )}
            </section>

            <section className="col">
              {[19, 25, 31].map((startSeat) =>
                renderSeatRow(startSeat, seatStates),
              )}
            </section>
          </div>

          <aside className="right-wall">
            <div className="block vert-board">
              <p>Board</p>
            </div>
            <div className="block vert-board">
              <p>Board</p>
            </div>
          </aside>
        </section>

        <section className="back-row">
          <div className="block doorway">
            <p>Door</p>
          </div>
          <div className="boards back-boards">
            <div className="block hor-board">
              <p>Board</p>
            </div>
            <div className="block hor-board">
              <p>Board</p>
            </div>
          </div>
          <div className="back-wall-spacer" />
        </section>
      </div>
    </>
  );
};

export default Seating2020;
