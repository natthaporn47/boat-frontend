const WS_URL = "ws://100.73.198.53:8000/ws/boat";

export function connectBoatWebSocket(onData) {
  const socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("Boat WebSocket connected");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Boat data:", data);

    onData(data);
  };

  socket.onerror = (error) => {
    console.error("Boat WebSocket error:", error);
  };

  socket.onclose = () => {
    console.log("Boat WebSocket disconnected");
  };

  return socket;
}