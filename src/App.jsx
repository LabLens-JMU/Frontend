import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';
import '/css/styles.css';

// Connect to the Express server
const socket = io('http://localhost:3001');

export default function App() {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);

  useEffect(() => {
    // Listen for the server's "receive_message" push
    socket.on('receive_message', (data) => {
      setChatLog((prev) => [...prev, data]);
    });

    return () => socket.off('receive_message');
  }, []);

  const sendMessage = () => {
    // Push data to the server (and eventually to Mongo)
    socket.emit('send_message', message);
    setMessage("");
  };

  return (
  <div>
  </div>
  );
}
