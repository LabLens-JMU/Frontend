import React from "react";
import "../../css/Seat.css";

const getSeatStatus = (seatStates, seatNumber) => {
  const state = seatStates?.[seatNumber];

  if (state === "full") {
    return "full";
  }

  if (state === "idle") {
    return "idle";
  }

  return "empty";
};

// Render one horizontal block of 6 seats, each colored by its live status.
const renderSeatRow4 = (startSeat, seatStates) => (
    <section className="room-seats row" key={`row-${startSeat}`}>
      {Array.from({ length: 4 }, (_, seatOffset) => {
        const seatNumber = startSeat + seatOffset;

        return (
            <div
                key={seatNumber}
                className={`seat block ${getSeatStatus(seatStates, seatNumber)}`}
            >
              <p>{seatNumber}</p>
            </div>
        );
      })}
    </section>
);

const renderSeatRow6 = (startSeat, seatStates) => (
    <section className="room-seats row" key={`row-${startSeat}`}>
      {Array.from({ length: 6 }, (_, seatOffset) => {
        const seatNumber = startSeat + seatOffset;

        return (
            <div
                key={seatNumber}
                className={`seat block ${getSeatStatus(seatStates, seatNumber)}`}
            >
              <p>{seatNumber}</p>
            </div>
        );
      })}
    </section>
);

const Seating2020 = ({ seatStates = {} }) => {
  return (
      <>
        <div className="roomContainer room-2020">
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

          <section className="room-body room-body-2020">
            <aside className="left-wall">
              <div className="block vert-board">
                <p>Board</p>
              </div>
            </aside>
            <div className="seat-columns">
              <section className="col">
                {[1, 5, 9].map((startSeat) =>
                    renderSeatRow4(startSeat, seatStates),
                )}
              </section>

              <section className="col">
                {[13, 19, 26].map((startSeat) =>
                    renderSeatRow6(startSeat, seatStates),
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
