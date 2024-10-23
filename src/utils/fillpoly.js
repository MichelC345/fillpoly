/* 
Algoritmo de preenchimento de cor interna, tendo os seguintes parâmetros:
ctx - refere-se ao quadro onde os polígonos são desenhados
polygonPoints - a lista de pontos/vértices do polígono
fillColor - a cor de preenchimento
*/

const drawLine = (ctx, xi, xf, y, color) => {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.lineTo(xi, y);
    ctx.lineTo(xf, y);
    ctx.stroke();
}

const fillpoly = (ctx, polygonPoints, fillColor) => {
    //console.log("executando fillpoly");
    // Determina a cor
    ctx.fillStyle = fillColor;

    //Armazena as arestas do polígono
    let edges = []
    for (let i = 0; i < polygonPoints.length; i++) {
        let j = (i + 1) % polygonPoints.length;
        //Para cada ponto Pi, obtém o seu ponto adjacente Pj e armazena a aresta PiPj
        const xi = polygonPoints[i].x;
        const yi = polygonPoints[i].y;
        const xf = polygonPoints[j].x;
        const yf = polygonPoints[j].y;
        if (yi === yf) {
            continue; //Arestas horizontais não serão processadas
        }else if (yi < yf) { //Verifica quais serão os pontos inicial e final
            edges.push({xi: xi, yi: yi, xf: xf, yf: yf});
        }else {
            edges.push({xi: xf, yi: yf, xf: xi, yf: yi});
        }
    }

    // Obtém os pontos mínimo e máximo em Y
    const minY = Math.min(...polygonPoints.map(point => point.y));
    const maxY = Math.max(...polygonPoints.map(point => point.y));
    //console.log("tamanho esperado", maxY-minY);
    

    //Prepara a lista de interseções para armazenar um n° de listas igual a Ns = maxY - minY.
    let intersections = [];
    for (let i = 0;i < maxY-minY;i++) { //Inicializa a lista
        intersections[i] = [];
    }
    //Processamento de arestas
    for (let i = 0;i < edges.length;i++) {
        //console.log("aresta", edges[i]);
        //Cálculo do coeficiente
        let m_inversed = (edges[i].xf - edges[i].xi) / (edges[i].yf - edges[i].yi);
        //Cálculo do índice na lista de interseções
        let x = edges[i].xi;
        for (let y = edges[i].yi;y < edges[i].yf;y++) {
            let index = y - minY;
            intersections[index].push(x);
            x += m_inversed;
        }
    }

    //Ordena as interseções em ordem crescente
    for (let i = 0; i < intersections.length; i++) {
        intersections[i].sort((a, b) => a - b);
    }

    //Executa a rasterização nas áreas delimitadas
    for (let i = 0;i < intersections.length;i++) {
        for (let j = 0;j < intersections[i].length-1;j += 2) {
            drawLine(ctx, Math.ceil(intersections[i][j]), Math.floor(intersections[i][j+1]), i+minY, fillColor);
        }
    }
};

export default fillpoly;