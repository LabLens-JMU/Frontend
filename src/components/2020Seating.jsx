import React from "react";
import "../../css/Seat.css";

const WALL_BLOCKS = 14;
const SEAT_GROUPS = [
  [
    [1, 2, 3, 4, 5, 6],
    [7, 8, 9, 10, 11, 12],
  ],
  [
    [13, 14, 15, 16, 17, 18],
    [19, 20, 21, 22, 23, 24],
  ],
  [
    [25, 26, 27, 28, 29, 30],
    [31, 32, 33, 34, 35, 36],
  ],
];

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

const formatSeatStatus = (status) => {
  if (status === "full") {
    return "Full";
  }

  if (status === "idle") {
    return "Idle";
  }

  return "Empty";
};

const Seating2020 = ({ seatStates = {} }) => {
  return (
    <>
      <div className="roomContainer room-2020">
        <section className="col wall-column">
          {Array.from({ length: WALL_BLOCKS }, (_, index) => (
            <div className="block board wall-block" key={`left-wall-${index + 1}`}>
              <p>Board</p>
            </div>
          ))}
        </section>

        {SEAT_GROUPS.map((seatColumn, columnIndex) => (
          <section className="col seat-column" key={`seat-column-${columnIndex + 1}`}>
            {seatColumn.map((seatRow, rowIndex) => (
              <section className="room-seats row" key={`seat-row-${columnIndex + 1}-${rowIndex + 1}`}>
                {seatRow.map((seatNumber) => {
                  const status = getSeatStatus(seatStates, seatNumber);

                  return (
                    <div
                      key={seatNumber}
                      className={`seat seat-2020 block ${status}`}
                    >
                      <p>Seat {seatNumber}</p>
                      <p>{formatSeatStatus(status)}</p>
                    </div>
                  );
                })}
              </section>
            ))}
            <div className="block board wall-block">
              <p>Board</p>
            </div>
          </section>
        ))}

        <section className="col wall-column">
          <div className="block doorway wall-block">
            <p>Door</p>
          </div>
          {Array.from({ length: WALL_BLOCKS - 1 }, (_, index) => (
            <div className="block board wall-block" key={`right-wall-${index + 1}`}>
              <p>Board</p>
            </div>
          ))}
        </section>
      </div>
    </>
  );
};

export default Seating2020;
