import "../../css/Aside.css";

const campusData = [
  {
    id: "b1",
    name: "Engeo",
    rooms: [
      { id: "r2020", name: "Room 2020" },
      { id: "r2037", name: "Room 2037" },
    ],
  },
  {
    id: "b2",
    name: "King Hall",
    rooms: [
      { id: "r201", name: "Study Room 201" },
      { id: "r203", name: "Study Room 203" },
    ],
  },
];

export function Aside({
  onSelectRoom,
  onSelectBuilding,
  selectedBuilding,
  activeRoomId,
}) {
  let breadcrumb = null;
  let content = null;
  let breadcrumbClassName = "breadcrumb-item active";

  // After choosing a building, show that building name and its rooms.
  if (selectedBuilding) {
    breadcrumbClassName = "breadcrumb-item";
    breadcrumb = (
      <>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item active">{selectedBuilding.name}</span>
      </>
    );

    if (selectedBuilding.rooms.length > 0) {
      content = selectedBuilding.rooms.map((room) => {
        let itemClassName = "location-item";

        if (activeRoomId === room.id) {
          itemClassName += " active";
        }

        return (
          <div
            key={room.id}
            onClick={() => onSelectRoom?.(room.id)}
            className={itemClassName}
          >
            <span>Room</span>
            <span>{room.name}</span>
          </div>
        );
      });
    } else {
      content = (
        <div className="empty-location">
          No rooms available in this building.
        </div>
      );
    }
  } else {
    // Default landing page: list the available buildings.
    content = campusData.map((building) => (
      <div
        key={building.id}
        onClick={() => onSelectBuilding?.(building)}
        className="location-item"
      >
        <span>Building</span>
        <span>{building.name}</span>
        <span className="chevron-right">{">"}</span>
      </div>
    ));
  }

  return (
    <div className="aside">
      <div className="breadcrumb-header">
        <span
          onClick={() => onSelectBuilding?.(null)}
          className={breadcrumbClassName}
        >
          Buildings
        </span>
        {breadcrumb}
      </div>
      <div className="contents-view">{content}</div>
    </div>
  );
}

export default Aside;
