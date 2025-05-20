import React, { useRef, useState } from "react";
import DollarRecognizer from "./utils/dollarRecognizer";

const recognizer = new DollarRecognizer();

export default function GestureTrainer({ onAddGesture }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [label, setLabel] = useState("");

  const handleMouseDown = (e) => {
    setDrawing(true);
    setPoints([{ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }]);
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, 300, 150);
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
    setPoints((pts) => [...pts, { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }]);
  };

  const handleMouseUp = () => {
    setDrawing(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (label && points.length > 5) {
      recognizer.AddGesture(label, points);
      if (onAddGesture) onAddGesture(label, points);
      setLabel("");
      setPoints([]);
      canvasRef.current.getContext("2d").clearRect(0, 0, 300, 150);
      alert(`Gesture saved for "${label}"!`);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Train a Gesture</h2>
      <canvas
        ref={canvasRef}
        width={300}
        height={150}
        style={{ border: "1px solid #ccc" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Word or phrase"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
        />
        <button type="submit">Save Gesture</button>
      </form>
    </div>
  );
}