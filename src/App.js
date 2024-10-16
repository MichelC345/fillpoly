import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import fillpoly from "./utils/fillpoly";

//Nesta função utiliza-se o algoritmo de ray-casting para verificar se um ponto está contido em um polígono
function isPointInPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

const App = () => {
  // Lista de pontos para o polígono atual
  const [points, setPoints] = useState([]);
  // Lista para armazenar os polígonos
  const [polygons, setPolygons] = useState([]);
  // Lista para armazenar os índices dos polígonos selecionados
  const [selectedPolygonIndices, setSelectedPolygonIndices] = useState([]);
  // Variável que determina a cor de preenchimento
  const [fillColor, setFillColor] = useState("blue");
  // Variável que determina a cor da aresta
  const [strokeColor, setStrokeColor] = useState("yellow");
  // isDrawing é uma condição booleana que determina se o usuário pode desenhar ou não
  const [isDrawing, setIsDrawing] = useState(false);
  // polygonCompleted determina se o polígono mais recente está completo
  const [polygonCompleted, setPolygonCompleted] = useState(false);
  // allPolygonsCompleted diz se todos os polígonos estão completos
  const [allPolygonsCompleted, setAllPolygonsCompleted] = useState(false);

  const canvasRef = useRef(null);

  /*
  Sempre que houver alterações na lista global de polígonos, na lista de pontos ou na lista de polígonos selecionados, 
  a exibição será atualizada e a função de redesenhar será executada para refletir as atualizações.
  */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    redrawAllPolygons(ctx);
  }, [polygons, points, selectedPolygonIndices]);


  //Função para redesenhar os polígonos e refletir alterações
  const redrawAllPolygons = (ctx) => {
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); //Limpa o quadro
    polygons.forEach((polygon, index) => {
      const isSelected = selectedPolygonIndices.includes(index);
      drawPolygon(
        ctx,
        polygon.points,
        true,
        polygon.fillColor,
        polygon.strokeColor,
        isSelected
      ); //Desenha cada polígono completo aplicando o efeito de seleção, caso se aplique
    });
    //Para evitar redesenhar o último polígono caso o mesmo esteja completo, interrompe a função caso todos
    //os polígonos estejam completos
    if (allPolygonsCompleted) {
      return;
    }
    //senão, desenha as arestas criadas até o momento
    drawPolygon(ctx, points, polygonCompleted, fillColor, strokeColor, false);
  };

  const deleteSelectedPolygons = () => {
    //Remove todos os polígonos selecionados: ou seja, cujo índice está em selectedPolygonIndices
    const updatedPolygons = polygons.filter(
      (polygon, index) => !selectedPolygonIndices.includes(index)
    );
    setAllPolygonsCompleted(true);
    setPolygons(updatedPolygons);
    setSelectedPolygonIndices([]); // Esvazia a lista de selecionados
  };


  //Função para desenhar um polígono
  const drawPolygon = (ctx, pointsArray, completed, fill, stroke, isSelected) => {
    //Deve ter ao menos 3 vértices
    if (pointsArray.length < 2) return;

    if (isSelected) {
      //Caso o polígono esteja selecionado, aplica os efeitos de seleção
      ctx.lineWidth = 10;
      ctx.strokeStyle = "red";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "rgba(255, 0, 0, 0.8)";
    } else {
      //Caso contrário, desenha normalmente
      ctx.lineWidth = 5;
      ctx.strokeStyle = stroke;
      ctx.shadowBlur = 0;
    }

    //Traça um caminho começando pelo ponto inicial
    ctx.beginPath();
    ctx.moveTo(pointsArray[0].x, pointsArray[0].y);

    for (let i = 1; i < pointsArray.length; i++) {
      //Desenha arestas passando pelos pontos adjacentes
      ctx.lineTo(pointsArray[i].x, pointsArray[i].y);
    }

    if (completed) {
      //Caso o polígono esteja completo, desenha a última aresta para fechar
      ctx.lineTo(pointsArray[0].x, pointsArray[0].y);
      ctx.stroke();
      //Executa o algoritmo de preenchimento de cor
      fillpoly(ctx, pointsArray, fill);
    }


    ctx.stroke();

    // Cada ponto será desenhado como um círculo e nomeado alfabeticamente
    pointsArray.forEach((point, index) => {
      drawPoint(ctx, point.x, point.y, index);
    });
  };

  //Função para desenhar um ponto
  const drawPoint = (ctx, x, y, index) => {
    const radius = 5; // Cada ponto será um círculo de raio 5
    const label = String.fromCharCode(65 + index); // Cada ponto será representado na ordem alfabética A, B, C, ...

    // Desenha o círculo
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.stroke();

    // Desenha a letra atribuída ao ponto
    ctx.font = "16px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(label, x + 8, y - 8); // Desloca o nome para que apareça próximo do círculo
  };

  //Função para determinar o que fazer quando o usuário clica no quadro
  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Verifica se o click está contido em algum polígono
    let clickedPolygonIndex = null;
    polygons.forEach((polygon, index) => {
      if (isPointInPolygon(x, y, polygon.points)) {
        clickedPolygonIndex = index;
      }
    });

    if (clickedPolygonIndex !== null) {
      //Caso o usuário tenha clicado dentro da área de algum polígono, muda o estado selecionado desse polígono
      if (selectedPolygonIndices.includes(clickedPolygonIndex)) {
        // Caso esteja selecionado, remove da lista de selecionados
        setSelectedPolygonIndices(
          selectedPolygonIndices.filter((i) => i !== clickedPolygonIndex)
        );
      } else {
        // Senão, adiciona na lista
        setSelectedPolygonIndices([...selectedPolygonIndices, clickedPolygonIndex]);
      }
    } else { //Caso nenhum polígono tenha sido selecionado
      if (!isDrawing || polygonCompleted) return;

      if (points.length > 0) {
        const firstPoint = points[0];
        const dist = Math.sqrt((x - firstPoint.x) ** 2 + (y - firstPoint.y) ** 2);
        if (dist < 10) { //Caso o click tenha sido próximo ao primeiro ponto, completa o polígono e interrompe a função
          setIsDrawing(false); // Para de desenhar
          setAllPolygonsCompleted(true);
          // Adiciona o novo polígono na lista incluindo sua lista de pontos e suas cores de preenchimento e aresta
          setPolygons([...polygons, { points: [...points], fillColor, strokeColor }]);
          setPolygonCompleted(true);
          return;
        }
      }

      // Adiciona um novo ponto para o polígono sendo desenhado
      setPoints([...points, { x, y }]);
    }
  };

  //Função para permitir que o usuário desenhe um novo polígono
  const startDrawing = () => {
    if (polygonCompleted) {
      setPoints([]); // Reseta o array de pontos para armazenar o novo polígono
      setPolygonCompleted(false);
      setSelectedPolygonIndices([]); // Remove a seleção dos polígonos selecionados
      setAllPolygonsCompleted(false);
    }
    setIsDrawing(true); // Permite o desenho
  };

  //Função para limpar o quadro: zera todas as listas e atualiza as flags
  const clearCanvas = () => {
    setPoints([]);
    setPolygons([]);
    setIsDrawing(false);
    setPolygonCompleted(false);
    setSelectedPolygonIndices([]);
    setAllPolygonsCompleted(false);
  };

  //Função para alterar a cor de prenenchimento
  const changeFillColor = (e) => {
    const color = e.target.value;
    setFillColor(color);

    // Percorre a lista de polígonos selecionados atualizando as suas cores
    if (selectedPolygonIndices.length > 0) {
      const updatedPolygons = [...polygons];
      selectedPolygonIndices.forEach((index) => {
        updatedPolygons[index].fillColor = color;
      });
      setAllPolygonsCompleted(true);
      setPolygons(updatedPolygons);
    }
  };

//Função para alterar cor da aresta
  const changeStrokeColor = (e) => {
    const color = e.target.value;
    setStrokeColor(color);

    //Percorre a lista de polígonos atualizando suas cores de arestas
    if (selectedPolygonIndices.length > 0) {
      const updatedPolygons = [...polygons];
      selectedPolygonIndices.forEach((index) => {
        updatedPolygons[index].strokeColor = color;
      });
      setAllPolygonsCompleted(true);
      setPolygons(updatedPolygons);
    }
    setStrokeColor("yellow"); //Retoma a cor de aresta padrão
  };

  return (
    <div>
      <h2>Clique para desenhar um polígono</h2>
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
        <button onClick={deleteSelectedPolygons}>Remover Selecionados</button>
        <div>
          <label>Cor de Preenchimento:</label>
          <input type="color" value={fillColor} onChange={changeFillColor} />
        </div>
        <div>
          <label>Cor da Aresta:</label>
          <input type="color" value={strokeColor} onChange={changeStrokeColor} />
        </div>
      </div>
    </div>
  );
};

export default App;
