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

const Seating2039 = ({ seatStates = {} }) => {
  return (
    <>
      <div className="roomContainer room-2039">
        <section className="front-row">
          <div className="block hor-board">
            <p>Board</p>
          </div>
        </section>

        <section className="room-body room-body-2039">
          <aside className="left-wall">
            <div className="block vert-board">
              <p>Board</p>
            </div>
          </aside>

          <section className="seat-stack">
            {/* 4 rows x 6 seats; each seat reads its own live status by station id */}
            {[0, 1, 2, 3].map((rowIndex) => (
              <section className="room-seats row" key={`row-${rowIndex + 1}`}>
                {Array.from({ length: 6 }, (_, seatOffset) => {
                  const seatNumber = rowIndex * 6 + seatOffset + 1;

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
            ))}
          </section>

          <aside className="right-wall">
            <div className="block vert-board">
              <p>Board</p>
            </div>
            <div className="block vert-board">
              <p>Board</p>
            </div>
          </aside>
        </section>

        <section className="back-row back-row-right-door">
          <div className="back-wall-spacer" />
          <div className="boards back-boards">
            <div className="block hor-board">
              <p>Board</p>
            </div>
          </div>
          <div className="block doorway">
            <p>Door</p>
          </div>
        </section>
      </div>
    </>
  );
};

export default Seating2039;
