// Espera todo o conteúdo da página carregar antes de executar o script
document.addEventListener('DOMContentLoaded', function(menu) {
    
    // Seleciona todos os elementos que têm a classe 'menu-botao'
    const menuButtons = document.querySelectorAll('#retornar');
    
    // Para cada botão, adiciona um atraso para a animação aparecer
    menuButtons.forEach((button, index) => {
        // Atraso aumenta para cada botão (150ms, 300ms, 450ms...)
        setTimeout(() => {
            button.style.opacity = '1';
            button.style.transform = 'translateY(0)';
        }, 150 * (index + 1));
    });

});

// Espera todo o conteúdo da página carregar antes de executar o script
document.addEventListener('DOMContentLoaded', function(credito) {
    
    // Seleciona todos os elementos que têm a classe 'menu-botao'
    const menuButtons = document.querySelectorAll('#creditos');
    
    // Para cada botão, adiciona um atraso para a animação aparecer
    menuButtons.forEach((button, index) => {
        // Atraso aumenta para cada botão (150ms, 300ms, 450ms...)
        setTimeout(() => {
            button.style.opacity = '1';
            button.style.transform = 'translateY(0)';
        }, 600 * (index + 1));
    });

});

// Funções auxiliares de conversão (Graus <-> Radianos)
const degToRad = (deg) => deg * Math.PI / 180;
const radToDeg = (rad) => rad * 180 / Math.PI;

// Elementos do DOM
const form = document.getElementById('triangle-form');
const resultsDiv = document.getElementById('results');
const canvas = document.getElementById('triangle-canvas');
const ctx = canvas.getContext('2d');
const inputs = {
    a: document.getElementById('side-a'),
    b: document.getElementById('side-b'),
    c: document.getElementById('side-c'),
    A: document.getElementById('angle-A'),
    B: document.getElementById('angle-B'),
    C: document.getElementById('angle-C')
};

// Event Listeners
form.addEventListener('submit', handleCalculate);
document.getElementById('btn-clear').addEventListener('click', clearAll);

/**
 * Ponto de entrada principal.
 * Lida com o envio do formulário.
 */
function handleCalculate(e) {
    e.preventDefault();
    resultsDiv.innerHTML = ''; // Limpa resultados anteriores
    clearCanvas();

    let values = {};
    let knownCount = 0;
    for (const key in inputs) {
        const val = parseFloat(inputs[key].value);
        if (!isNaN(val) && val > 0) {
            values[key] = val;
            knownCount++;
        } else {
            values[key] = null;
        }
    }

    // Validação de entrada
    if (knownCount !== 3) {
        showError("Por favor, forneça exatamente 3 valores positivos.");
        return;
    }

    // Converte ângulos conhecidos para radianos para cálculo
    if (values.A) values.A_rad = degToRad(values.A);
    if (values.B) values.B_rad = degToRad(values.B);
    if (values.C) values.C_rad = degToRad(values.C);

    try {
        // Tenta resolver o triângulo
        const solution = solveTriangle(values);
        displaySolution(solution);
        // Desenha a primeira solução (no caso ambíguo)
        drawTriangle(solution.solutions[0]); 
    } catch (error) {
        showError(error.message);
    }
}

/**
 * Direciona para a função de resolução correta com base nos dados.
 */
function solveTriangle(v) {
    const s = [v.a, v.b, v.c].filter(val => val !== null).length; // Contagem de lados
    const a = [v.A, v.B, v.C].filter(val => val !== null).length; // Contagem de ângulos

    // Caso LLL (Lado, Lado, Lado)
    if (s === 3) {
        return solveSSS(v.a, v.b, v.c);
    }

    // Caso LAL (Lado, Ângulo, Lado)
    if (s === 2 && a === 1) {
        if (v.a && v.b && v.C_rad) return solveSAS(v.a, v.b, v.C_rad, 'C');
        if (v.a && v.c && v.B_rad) return solveSAS(v.a, v.c, v.B_rad, 'B');
        if (v.b && v.c && v.A_rad) return solveSAS(v.b, v.c, v.A_rad, 'A');
    }

    // Caso ALA ou LAA (Dois ângulos e um lado)
    if (s === 1 && a === 2) {
        return solveAAS_ASA(v);
    }

    // Caso LLA (Lado, Lado, Ângulo) - O Caso Ambíguo
    if (s === 2 && a === 1) {
        // Se não for LAL, só pode ser LLA
        return solveSSA(v);
    }

    throw new Error("Combinação de entradas inválida. Verifique seus valores.");
}

// --- Funções de Resolução ---

function solveSSS(a, b, c) {
    // Verificação da Desigualdade Triangular
    if (a + b <= c || a + c <= b || b + c <= a) {
        throw new Error("Triângulo impossível. A soma de quaisquer dois lados deve ser maior que o terceiro lado.");
    }

    const A_rad = Math.acos((b * b + c * c - a * a) / (2 * b * c));
    const B_rad = Math.acos((a * a + c * c - b * b) / (2 * a * c));
    const C_rad = Math.PI - A_rad - B_rad; // Mais estável do que usar cosseno novamente

    const solution = {
        a, b, c,
        A: radToDeg(A_rad),
        B: radToDeg(B_rad),
        C: radToDeg(C_rad)
    };
    return { solutions: [solution], message: "Caso LLL (Lado-Lado-Lado)" };
}

function solveSAS(s1, s2, ang_rad, ang_name) {
    let a, b, c, A_rad, B_rad, C_rad;

    // Encontra o terceiro lado usando a Lei dos Cossenos
    const s3 = Math.sqrt(s1 * s1 + s2 * s2 - 2 * s1 * s2 * Math.cos(ang_rad));

    // Atribui lados e ângulos com base em qual ângulo foi dado
    if (ang_name === 'A') { a = s3; b = s1; c = s2; A_rad = ang_rad; }
    if (ang_name === 'B') { b = s3; a = s1; c = s2; B_rad = ang_rad; }
    if (ang_name === 'C') { c = s3; a = s1; b = s2; C_rad = ang_rad; }

    // Agora, usa a Lei dos Senos para encontrar um segundo ângulo
    if (ang_name === 'C') {
        A_rad = Math.asin(a * Math.sin(C_rad) / c);
        B_rad = Math.PI - A_rad - C_rad;
    } else if (ang_name === 'B') {
        A_rad = Math.asin(a * Math.sin(B_rad) / b);
        C_rad = Math.PI - A_rad - B_rad;
    } else if (ang_name === 'A') {
        B_rad = Math.asin(b * Math.sin(A_rad) / a);
        C_rad = Math.PI - A_rad - B_rad;
    }

    const solution = {
        a, b, c,
        A: radToDeg(A_rad),
        B: radToDeg(B_rad),
        C: radToDeg(C_rad)
    };
    return { solutions: [solution], message: "Caso LAL (Lado-Ângulo-Lado)" };
}

function solveAAS_ASA(v) {
    let a = v.a, b = v.b, c = v.c;
    let A_rad = v.A_rad, B_rad = v.B_rad, C_rad = v.C_rad;

    // Encontra o terceiro ângulo
    if (!A_rad) A_rad = Math.PI - B_rad - C_rad;
    if (!B_rad) B_rad = Math.PI - A_rad - C_rad;
    if (!C_rad) C_rad = Math.PI - A_rad - B_rad;

    // Garante que todos os ângulos sejam válidos
    if (A_rad <= 0 || B_rad <= 0 || C_rad <= 0) {
        throw new Error("Ângulos inválidos. A soma dos dois ângulos fornecidos é >= 180°.");
    }

    // Usa a Lei dos Senos para encontrar os lados que faltam
    if (a) { // Lado 'a' é conhecido
        b = a * Math.sin(B_rad) / Math.sin(A_rad);
        c = a * Math.sin(C_rad) / Math.sin(A_rad);
    } else if (b) { // Lado 'b' é conhecido
        a = b * Math.sin(A_rad) / Math.sin(B_rad);
        c = b * Math.sin(C_rad) / Math.sin(B_rad);
    } else { // Lado 'c' é conhecido
        a = c * Math.sin(A_rad) / Math.sin(C_rad);
        b = c * Math.sin(B_rad) / Math.sin(C_rad);
    }

    const solution = {
        a, b, c,
        A: radToDeg(A_rad),
        B: radToDeg(B_rad),
        C: radToDeg(C_rad)
    };
    return { solutions: [solution], message: "Caso ALA ou LAA (Ângulo-Lado-Ângulo)" };
}

function solveSSA(v) {
    // Identifica o ângulo conhecido e os lados
    let l1, l2, ang1_rad, ang1_name, ang2_name, l3_name;
    
    if (v.A_rad && v.a && v.b) { l1 = v.a; l2 = v.b; ang1_rad = v.A_rad; ang1_name = 'A'; ang2_name = 'B'; l3_name = 'c'; }
    else if (v.A_rad && v.a && v.c) { l1 = v.a; l2 = v.c; ang1_rad = v.A_rad; ang1_name = 'A'; ang2_name = 'C'; l3_name = 'b'; }
    else if (v.B_rad && v.b && v.a) { l1 = v.b; l2 = v.a; ang1_rad = v.B_rad; ang1_name = 'B'; ang2_name = 'A'; l3_name = 'c'; }
    else if (v.B_rad && v.b && v.c) { l1 = v.b; l2 = v.c; ang1_rad = v.B_rad; ang1_name = 'B'; ang2_name = 'C'; l3_name = 'a'; }
    else if (v.C_rad && v.c && v.a) { l1 = v.c; l2 = v.a; ang1_rad = v.C_rad; ang1_name = 'C'; ang2_name = 'A'; l3_name = 'b'; }
    else if (v.C_rad && v.c && v.b) { l1 = v.c; l2 = v.b; ang1_rad = v.C_rad; ang1_name = 'C'; ang2_name = 'B'; l3_name = 'a'; }
    else {
        throw new Error("Não foi possível identificar um caso LLA válido.");
    }

    // l1 é oposto a ang1_rad, l2 é adjacente
    const sin_ang2 = (l2 * Math.sin(ang1_rad)) / l1;

    if (sin_ang2 > 1.000001) { // Ligeira tolerância para erros de ponto flutuante
        throw new Error("Caso LLA: Sem solução. O lado oposto é muito curto.");
    }

    let solutions = [];
    let message = "";

    // Solução 1 (ângulo agudo)
    const ang2_rad_1 = Math.asin(sin_ang2);
    const ang3_rad_1 = Math.PI - ang1_rad - ang2_rad_1;

    if (ang3_rad_1 > 0) {
        const l3_1 = l1 * Math.sin(ang3_rad_1) / Math.sin(ang1_rad);
        solutions.push(buildSolution(l1, l2, l3_1, ang1_rad, ang2_rad_1, ang3_rad_1, ang1_name, ang2_name, l3_name));
    }

    // Solução 2 (ângulo obtuso) - se ang2_rad_1 não for 90°
    if (sin_ang2 < 0.999999) {
        const ang2_rad_2 = Math.PI - ang2_rad_1;
        const ang3_rad_2 = Math.PI - ang1_rad - ang2_rad_2;

        if (ang3_rad_2 > 0) {
            const l3_2 = l1 * Math.sin(ang3_rad_2) / Math.sin(ang1_rad);
            solutions.push(buildSolution(l1, l2, l3_2, ang1_rad, ang2_rad_2, ang3_rad_2, ang1_name, ang2_name, l3_name));
        }
    }
    
    if (solutions.length === 0) {
        throw new Error("Caso LLA: Sem solução.");
    } else if (solutions.length === 1) {
        message = "Caso LLA: Uma solução encontrada.";
    } else {
        message = "Caso LLA Ambíguo: Duas soluções encontradas.";
    }

    return { solutions, message };
}

/**
 * Função auxiliar para montar o objeto de solução para LLA.
 */
function buildSolution(l1, l2, l3, ang1_rad, ang2_rad, ang3_rad, ang1_name, ang2_name, l3_name) {
    const sol = {};
    sol[ang1_name.toLowerCase()] = l1;
    sol[ang2_name.toLowerCase()] = l2;
    sol[l3_name] = l3;
    sol[ang1_name] = radToDeg(ang1_rad);
    sol[ang2_name] = radToDeg(ang2_rad);
    sol[l3_name.toUpperCase()] = radToDeg(ang3_rad);
    return sol;
}

// --- Funções de Exibição e Desenho ---

function displaySolution(result) {
    // 1. A variável 'html' começa com a mensagem do caso.
    let html = `<h3>${result.message}</h3>`;

    // 2. O código adiciona os resultados de cada solução
    //    (normalmente apenas uma) a essa mesma variável 'html'.
    result.solutions.forEach((sol, index) => {
        if (result.solutions.length > 1) {
            html += `<h4>Solução ${index + 1}</h4>`;
        }
        const area = 0.5 * sol.a * sol.b * Math.sin(degToRad(sol.C));
        
        html += `
            <pre>
Lados:
a = ${sol.a.toFixed(4)}
b = ${sol.b.toFixed(4)}
c = ${sol.c.toFixed(4)}

Ângulos:
A = ${sol.A.toFixed(4)}°
B = ${sol.B.toFixed(4)}°
C = ${sol.C.toFixed(4)}°
(Soma: ${(sol.A + sol.B + sol.C).toFixed(4)}°)

Propriedades:
Área = ${area.toFixed(4)}
Perímetro = ${(sol.a + sol.b + sol.c).toFixed(4)}
            </pre>
        `;
    });
    
    // 3. No final, 'html' (que contém a mensagem + os resultados)
    //    é colocado dentro da div 'results'.
    resultsDiv.innerHTML = html;
}

function drawTriangle(sol) {
    clearCanvas();

    // Desestrutura a solução completa
    const { a, b, c, A, B, C } = sol;
    const A_rad = degToRad(A);
    
    // Define o tamanho e o preenchimento do canvas
    const w = canvas.width;
    const h = canvas.height;
    // AUMENTADO O PADDING para dar mais espaço para os rótulos
    const padding = 60; 

    // Vértice A na origem (0,0)
    // Vértice B no eixo x em (c, 0)
    // Vértice C é (b * cos(A), b * sin(A))
    const coords = [
        { x: 0, y: 0 }, // Vértice A
        { x: c, y: 0 }, // Vértice B
        { x: b * Math.cos(A_rad), y: b * Math.sin(A_rad) } // Vértice C
    ];

    // Encontra os limites (bounding box) do triângulo
    const minX = Math.min(...coords.map(p => p.x));
    const maxX = Math.max(...coords.map(p => p.x));
    const minY = Math.min(...coords.map(p => p.y));
    const maxY = Math.max(...coords.map(p => p.y));

    const triWidth = maxX - minX;
    const triHeight = maxY - minY;

    // Define a área "desenhável" do canvas
    const drawableW = w - padding * 2;
    const drawableH = h - padding * 2;

    // Calcula o fator de escala para caber no canvas
    const scale = Math.min(drawableW / triWidth, drawableH / triHeight);

    // Calcula o tamanho real do triângulo escalado
    const scaledW = triWidth * scale;
    const scaledH = triHeight * scale;

    // Calcula o offset para centralizar
    const offsetX = (drawableW - scaledW) / 2;
    const offsetY = (drawableH - scaledH) / 2;

    // Calcula as coordenadas finais no canvas (Y invertido)
    const pA = { // Vértice A
        x: padding + offsetX + (coords[0].x - minX) * scale,
        y: padding + offsetY + (maxY - coords[0].y) * scale
    };
    const pB = { // Vértice B
        x: padding + offsetX + (coords[1].x - minX) * scale,
        y: padding + offsetY + (maxY - coords[1].y) * scale
    };
    const pC = { // Vértice C
        x: padding + offsetX + (coords[2].x - minX) * scale,
        y: padding + offsetY + (maxY - coords[2].y) * scale
    };

    // --- Desenha o Triângulo ---
    ctx.beginPath();
    ctx.moveTo(pA.x, pA.y);
    ctx.lineTo(pB.x, pB.y);
    ctx.lineTo(pC.x, pC.y);
    ctx.closePath();
    ctx.strokeStyle = '#ffd900';
    ctx.lineWidth = 2;
    ctx.stroke();

    // --- Desenha os Rótulos (Vértices e Ângulos) ---
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';

    // CORREÇÃO: Alinha o texto para DENTRO do triângulo
    
    // Vértice A (inferior esquerdo)
    ctx.textAlign = 'left';
    ctx.fillText(`A (${A.toFixed(1)}°)`, pA.x + 5, pA.y - 7); // Levemente p/ direita e p/ cima
    
    // Vértice B (inferior direito)
    ctx.textAlign = 'right';
    ctx.fillText(`B (${B.toFixed(1)}°)`, pB.x - 5, pB.y - 7); // Levemente p/ esquerda e p/ cima
    
    // Vértice C (superior)
    ctx.textAlign = 'center';
    ctx.fillText(`C (${C.toFixed(1)}°)`, pC.x, pC.y - 10); // Acima do ponto

    // Reseta o alinhamento para o padrão (para os rótulos dos lados)
    ctx.textAlign = 'left'; 

    // --- Desenha os Rótulos (Lados) ---
    ctx.fillStyle = '#00ffff';
    ctx.font = 'italic 14px Arial';
    ctx.textAlign = 'center'; // Centraliza o texto do lado

    // Lado a (oposto a A, entre B e C)
    // Salva o estado atual para rotacionar o texto
    ctx.save();
    ctx.translate((pB.x + pC.x) / 2, (pB.y + pC.y) / 2); // Move para o meio do lado 'a'
    let angle_a = Math.atan2(pC.y - pB.y, pC.x - pB.x); // Pega o ângulo do lado
    if (angle_a > Math.PI / 2) angle_a -= Math.PI; // Garante que o texto não fique de cabeça para baixo
    if (angle_a < -Math.PI / 2) angle_a += Math.PI;
    ctx.rotate(angle_a);
    ctx.fillText(`a = ${a.toFixed(2)}`, 0, -5); // Desenha o texto acima da linha
    ctx.restore(); // Restaura o estado
    
    // Lado b (oposto a B, entre A e C)
    ctx.save();
    ctx.translate((pA.x + pC.x) / 2, (pA.y + pC.y) / 2); // Move para o meio do lado 'b'
    let angle_b = Math.atan2(pC.y - pA.y, pC.x - pA.x); // Pega o ângulo
    if (angle_b > Math.PI / 2) angle_b -= Math.PI;
    if (angle_b < -Math.PI / 2) angle_b += Math.PI;
    ctx.rotate(angle_b);
    ctx.fillText(`b = ${b.toFixed(2)}`, 0, -5);
    ctx.restore();
    
    // Lado c (oposto a C, entre A e B)
    ctx.fillText(`c = ${c.toFixed(2)}`, (pA.x + pB.x) / 2, (pA.y + pB.y) / 2 + 20); // Abaixo da linha (horizontal)

    ctx.textAlign = 'left'; // Reseta
}

function showError(message) {
    resultsDiv.innerHTML = `<div class="error">${message}</div>`;
    clearCanvas();
}

function clearAll() {
    for (const key in inputs) {
        inputs[key].value = '';
    }
    resultsDiv.innerHTML = '';
    clearCanvas();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Limpa o canvas ao carregar
clearCanvas();