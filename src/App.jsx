import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";
import "/css/styles.css";
import Aside from "./components/Aside";
import Header from "./components/Header";
import Card from "./components/Card";
import Layout from "./pages/2020-layout";

// Connect to the Express server
const socket = io("http://localhost:3001");

export default function App() {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);

  useEffect(() => {
    // Listen for the server's "receive_message" push
    socket.on("receive_message", (data) => {
      setChatLog((prev) => [...prev, data]);
    });

    return () => socket.off("receive_message");
  }, []);

  const sendMessage = () => {
    // Push data to the server (and eventually to Mongo)
    socket.emit("send_message", message);
    setMessage("");
  };

  return (
    <div className="main">
      <section className="top">
        <Header />
      </section>
      <div className='center'>
        <section className="left">
          <Aside />
        </section>
        <section className="screen">
          {activeRoom === "2020" ? (
            <Layout />
          ) : (
            <Card onSelectRoom={setActiveRoom} />
          )}
        </section>
      </div>
    </div>
  );
}
