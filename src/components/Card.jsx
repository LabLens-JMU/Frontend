import "../../css/Card.css";

const Card = ({ rooms = [], onSelectRoom }) => {
  return (
    <section className="container">
      {rooms.map((room) => (
        <button
          key={room.id}
          type="button"
          className="hero-card"
          onClick={() => onSelectRoom?.(room.id)}
        >
          <h3 className="room">Room {room.name}</h3>
          <p className="description">
            Occupancy: {room.occupied_count ?? 0}/{room.room_total ?? 0} occupied
          </p>
        </button>
      ))}
    </section>
  );
};

export default Card;
