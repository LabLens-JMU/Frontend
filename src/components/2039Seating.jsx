import React from "react";
import RoomLayout from "./RoomLayout";

const seatStatus = "Not finished";

const room2039Map = [
  ["display", "display", "display", "display", "display", "display", "display", "display"],
  ["seat-1", "seat-2", "seat-3", "aisle", "seat-1", "seat-2", "seat-3", "open"],
  ["seat-1", "seat-2", "seat-3", "aisle", "seat-1", "seat-2", "seat-3", "open"],
  ["walkway", "walkway", "walkway", "walkway", "walkway", "walkway", "walkway", "walkway"],
  ["seat-1", "seat-2", "seat-3", "aisle", "seat-1", "seat-2", "seat-3", "open"],
  ["seat-1", "seat-2", "seat-3", "aisle", "seat-1", "seat-2", "seat-3", "open"],
  ["seat-1", "seat-2", "seat-3", "aisle", "seat-1", "seat-2", "seat-3", "open"],
  ["instructor", "instructor", "instructor", "instructor", "open", "door", "door", "open"],
];

const Seating2039 = () => {
  return (
    <RoomLayout
      roomName="Room 2039"
      roomMap={room2039Map}
      seatStatus={seatStatus}
    />
  );
};

export default Seating2039;
