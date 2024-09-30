import React, { useState, useRef, useEffect } from "react";
import "./App.css";

const App = () => {
  const [points, setPoints] = useState([]); // Current points for the polygon
  const [polygons, setPolygons] = useState([]); // Store all completed polygons
  const [isDrawing, setIsDrawing] = useState(false); // Toggle drawing mode
  const [polygonCompleted, setPolygonCompleted] = useState(false); // Flag for completed polygon

  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    redrawAllPolygons(ctx);
  }, [polygons, points]);

  const redrawAllPolygons = (ctx) => {
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); // Clear canvas
    polygons.forEach((polygon) => drawPolygon(ctx, polygon, true)); // Redraw all completed polygons
    drawPolygon(ctx, points, polygonCompleted); // Draw the polygon being created
  };

  const drawPolygon = (ctx, pointsArray, completed) => {
    if (pointsArray.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(pointsArray[0].x, pointsArray[0].y);

    for (let i = 1; i < pointsArray.length; i++) {
      ctx.lineTo(pointsArray[i].x, pointsArray[i].y);
    }

    if (completed) {
      ctx.lineTo(pointsArray[0].x, pointsArray[0].y); // Close polygon
      ctx.fillStyle = "rgba(0, 150, 255, 0.5)";
      //ctx.fill();
    }

    ctx.stroke();
  };

  const handleCanvasClick = (event) => {
    if (!isDrawing || polygonCompleted) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if the click is close to the first point to close the polygon
    if (points.length > 0) {
      const firstPoint = points[0];
      const dist = Math.sqrt((x - firstPoint.x) ** 2 + (y - firstPoint.y) ** 2);
      if (dist < 10) {
        setIsDrawing(false); // Stop drawing
        setPolygons([...polygons, points]); // Save the completed polygon
        setPolygonCompleted(true);
        return;
      }
    }

    // Add new point
    setPoints([...points, { x, y }]);
  };

  const startDrawing = () => {
    if (polygonCompleted) {
      setPoints([]); // Reset points for new polygon
      setPolygonCompleted(false);
    }
    setIsDrawing(true); // Enable drawing
  };

  const clearCanvas = () => {
    setPoints([]);
    setPolygons([]);
    setIsDrawing(false);
    setPolygonCompleted(false);
  };

  return (
    <div>
      <h2>Click to draw a polygon</h2>
      <canvas
        id="polygonCanvas"
        ref={canvasRef}
        width={1024}
        height={768}
        onClick={handleCanvasClick}
      />
      <div>
        <button onClick={startDrawing}>Desenhar Polígono</button>
        <button onClick={clearCanvas}>Limpar</button>
      </div>
    </div>
  );
};

export default App;
