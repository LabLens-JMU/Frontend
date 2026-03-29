import React from "react";
import RoomLayout from "./RoomLayout";

const seatStatus = "Not finished";

const room2020Map = [
  ["display", "display", "display", "display", "display", "display", "display"],
  ["seat-1", "seat-2", "seat-3", "aisle", "seat-1", "seat-2", "seat-3"],
  ["seat-1", "seat-2", "seat-3", "aisle", "seat-1", "seat-2", "seat-3"],
  ["seat-1", "seat-2", "seat-3", "aisle", "seat-1", "seat-2", "seat-3"],
  ["walkway", "walkway", "walkway", "walkway", "walkway", "walkway", "walkway"],
  ["seat-1", "seat-2", "seat-3", "aisle", "seat-1", "seat-2", "seat-3"],
  ["seat-1", "seat-2", "seat-3", "aisle", "seat-1", "seat-2", "seat-3"],
  ["seat-1", "seat-2", "seat-3", "aisle", "seat-1", "seat-2", "seat-3"],
  ["instructor", "instructor", "instructor", "open", "door", "door", "open"],
];

const Seating2020 = () => {
  return (
    <RoomLayout
      roomName="Room 2020"
      roomMap={room2020Map}
      seatStatus={seatStatus}
    />
  );
};

export default Seating2020;
