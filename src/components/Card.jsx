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
          <p className="description">Occupancy: 0</p>
        </button>
      ))}
    </section>
  );
};

export default Card;
