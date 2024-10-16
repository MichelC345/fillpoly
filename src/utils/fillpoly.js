/* 
Algoritmo de preenchimento de cor interna, tendo os seguintes parâmetros:
ctx - refere-se ao quadro onde os polígonos são desenhados
polygonPoints - a lista de pontos/vértices do polígono
fillColor - a cor de preenchimento
*/

const fillpoly = (ctx, polygonPoints, fillColor) => {
    // Determina a cor
    ctx.fillStyle = fillColor;

    // Obtém os pontos mínimo e máximo em Y
    const minY = Math.min(...polygonPoints.map(point => point.y));
    const maxY = Math.max(...polygonPoints.map(point => point.y));

    //Percorre todas as scanlines (n° de scanlines = maxY - minY)
    for (let y = minY; y <= maxY; y++) {
        //Prepara um array vazio para armazenar os pontos de interseção com a scanline atual
        let intersections = [];

        // Encontra as interseções do polígono na scanline atual
        for (let i = 0; i < polygonPoints.length; i++) {
            let j = (i + 1) % polygonPoints.length;
            //Para cada ponto Pi, obtém o seu ponto adjacente Pj e verifica a aresta PiPj
            const x1 = polygonPoints[i].x;
            const y1 = polygonPoints[i].y;
            const x2 = polygonPoints[j].x;
            const y2 = polygonPoints[j].y;

            // Check if the edge crosses the scanline
            //Verifica se a aresta PiPj faz interseção com a scanline
            if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
                const intersectX = x1 + ((y - y1) * (x2 - x1)) / (y2 - y1);
                intersections.push(intersectX);
            }
        }

        //Ordena as interseções em ordem crescente
        intersections.sort((a, b) => a - b);

        //Percorre os "blocos" representados por cada par de pontos da lista de interseções
        for (let i = 0; i < intersections.length; i += 2) {
            const startX = intersections[i]; //início do bloco
            const endX = intersections[i + 1]; //fim do bloco

            // Preenchimento dos pixels entre as interseções
            //inicia o caminho para indicar a área delimitada
            ctx.beginPath();
            ctx.moveTo(startX, y); //começa pelo ponto superior esquerdo
            ctx.lineTo(endX, y); //ponto superior direito
            //avança para a próxima linha para um preenchimento perfeito
            ctx.lineTo(endX, y + 1); // ponto inferior direito
            ctx.lineTo(startX, y + 1); //ponto inferior esquerdo
            //fecha o caminho indicando a área delimitada formada por 4 pontos
            ctx.closePath();
            //executa a rasterização na área delimitada
            ctx.fill();
        }
    }
};

export default fillpoly;