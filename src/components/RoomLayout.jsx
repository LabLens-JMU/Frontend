import React from "react";
import "../../css/Seat.css";

const seatVariants = new Set(["seat-1", "seat-2", "seat-3"]);

const fixtureLabels = {
  display: "Display",
  instructor: "Instructor",
  walkway: "Walkway",
  door: "Door",
};

const RoomLayout = ({ roomName, roomMap, seatStatus }) => {
  let seatNumber = 1;
  const columns = roomMap[0]?.length ?? 0;

  return (
    <section className="lab-room-shell">
      <header className="lab-room-header">
        <h2>{roomName}</h2>
        <p>Seats are rendered in place so aisles and front-of-room elements read like a real lab.</p>
      </header>

      <section
        className="lab-room-grid"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(72px, 1fr))` }}
      >
        {roomMap.flatMap((row, rowIndex) =>
          row.map((cell, columnIndex) => {
            if (cell === "open") {
              return <div key={`${rowIndex}-${columnIndex}`} className="room-space room-space-open" />;
            }

            if (cell === "aisle") {
              return (
                <div key={`${rowIndex}-${columnIndex}`} className="room-space room-space-aisle">
                  Aisle
                </div>
              );
            }

            if (!seatVariants.has(cell)) {
              return (
                <div key={`${rowIndex}-${columnIndex}`} className={`room-fixture room-fixture-${cell}`}>
                  {fixtureLabels[cell] ?? cell}
                </div>
              );
            }

            const currentSeat = seatNumber;
            seatNumber += 1;

            return (
              <article key={`${rowIndex}-${columnIndex}`} className={`seat-card ${cell}`}>
                <p>Seat #{currentSeat}</p>
                <p>Status: {seatStatus}</p>
              </article>
            );
          }),
        )}
      </section>
    </section>
  );
};

export default RoomLayout;
