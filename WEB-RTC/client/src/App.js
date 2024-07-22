import { Routes, Route } from "react-router-dom";
import "./App.css";
import { LobbyScreen } from "./Screens/Lobby";
import { RoomPage } from "./Screens/Room";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LobbyScreen />}></Route>
        <Route path="/room/:roomId" element={<RoomPage />}></Route>
      </Routes>
    </div>
  );
}

export default App;
