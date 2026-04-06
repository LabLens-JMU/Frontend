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

const Seating2037 = ({ seatStates = {} }) => {
  return (
    <>
      <div className="roomContainer room-2037">
        <section className="front-row">
          <div className="block hor-board">
            <p>Board</p>
          </div>
        </section>

        <section className="room-body room-body-2037">
          <section className="room-seats row room-seats-2037">
            {Array.from({ length: 7 }, (_, seatOffset) => {
              const seatNumber = seatOffset + 1;

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
        </section>

        <section className="back-row back-row-left-door">
          <div className="block doorway">
            <p>Door</p>
          </div>
          <div className="boards back-boards">
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

export default Seating2037;
