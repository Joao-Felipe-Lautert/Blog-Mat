// Espera todo o conteúdo da página carregar antes de executar o script
document.addEventListener('DOMContentLoaded', function(retorno) {
    
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

/* ---------- FUNÇÕES AUXILIARES ---------- */
function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
}
function comb(n, k) {
    if (k > n || k < 0) return 0;
    return factorial(n) / (factorial(k) * factorial(n - k));
}
function perm(n, k) {
    if (k > n || k < 0) return 0;
    return factorial(n) / factorial(n - k);
}

/* ---------- MOEDA ---------- */
function calcCoin() {
    const n = parseInt(document.getElementById('coin-n').value);
    const k = parseInt(document.getElementById('coin-k').value);
    if (isNaN(n) || isNaN(k) || n < 1 || k < 0 || k > n) {
        document.getElementById('coin-result').innerText = 'Entrada inválida';
        return;
    }
    const p = 0.5;
    const prob = comb(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
    document.getElementById('coin-result').innerText =
        `P(exatamente ${k} ${document.getElementById('coin-type').value}(s)) = ${prob.toFixed(6)} (${(prob*100).toFixed(2)}%)`;
}

/* ---------- DADO ---------- */
function calcDice() {
    const num = parseInt(document.getElementById('dice-num').value);
    const faces = parseInt(document.getElementById('dice-faces').value);
    const target = parseInt(document.getElementById('dice-sum').value);
    if (isNaN(num)||isNaN(faces)||isNaN(target) || num<1||faces<2||target<num||target>num*faces) {
        document.getElementById('dice-result').innerText = 'Entrada inválida';
        return;
    }
    // Contar combinações que dão a soma
    let ways = 0;
    const total = Math.pow(faces, num);
    // Brute-force (funciona até 5 dados)
    const recurse = (cur, sum, left) => {
        if (left === 0) { if (sum === target) ways++; return; }
        for (let f=1; f<=faces; f++) recurse(cur, sum+f, left-1);
    };
    recurse([], 0, num);
    const prob = ways / total;
    document.getElementById('dice-result').innerText =
        `P(soma = ${target}) = ${ways}/${total} = ${prob.toFixed(6)} (${(prob*100).toFixed(2)}%)`;
}

/* ---------- BARALHO ---------- */
function calcCard() {
    const n = parseInt(document.getElementById('card-n').value);
    const k = parseInt(document.getElementById('card-k').value);
    const repo = document.getElementById('card-repo').checked;
    const type = document.getElementById('card-type').value;

    const map = {as:4, rei:4, dama:4, valete:4, naipe:13};
    const fav = map[type];

    if (isNaN(n)||isNaN(k)||n<1||k<0||k>n||fav===undefined) {
        document.getElementById('card-result').innerText = 'Entrada inválida';
        return;
    }

    let prob;
    if (repo) { // com reposição
        prob = comb(n, k) * Math.pow(fav/52, k) * Math.pow((52-fav)/52, n-k);
    } else { // sem reposição (hipergeométrica)
        const totalFav = fav;
        const totalNon = 52 - fav;
        prob = comb(totalFav, k) * comb(totalNon, n-k) / comb(52, n);
    }
    document.getElementById('card-result').innerText =
        `P(exatamente ${k} ${type}) = ${prob.toFixed(6)} (${(prob*100).toFixed(2)}%)`;
}

/* ---------- ROLETA ---------- */
function calcRoulette() {
    const type = document.getElementById('roulette-type').value;
    const bet  = document.getElementById('roulette-bet').value;
    const total = (type==='eu') ? 37 : 38;

    const map = {
        single:1, red:18, black:18, even:18, odd:18, low:18, high:18
    };
    const fav = map[bet];
    const prob = fav / total;
    const name = {
        single:'número único', red:'vermelho', black:'preto',
        even:'par', odd:'ímpar', low:'baixa (1-18)', high:'alta (19-36)'
    };
    document.getElementById('roulette-result').innerText =
        `P(${name[bet]}) = ${fav}/${total} = ${prob.toFixed(6)} (${(prob*100).toFixed(2)}%)`;
}

/* ---------- URNA ---------- */
function calcUrn() {
    const total = parseInt(document.getElementById('urn-total').value);
    const fav   = parseInt(document.getElementById('urn-fav').value);
    const draw  = parseInt(document.getElementById('urn-draw').value);
    const k     = parseInt(document.getElementById('urn-k').value);
    const repo  = document.getElementById('urn-repo').checked;

    if (isNaN(total)||isNaN(fav)||isNaN(draw)||isNaN(k) ||
        total<1||fav<0||fav>total||draw<1||k<0||k>draw) {
        document.getElementById('urn-result').innerText = 'Entrada inválida';
        return;
    }

    let prob;
    if (repo) { // com reposição
        prob = comb(draw, k) * Math.pow(fav/total, k) * Math.pow((total-fav)/total, draw-k);
    } else { // sem reposição (hipergeométrica)
        prob = comb(fav, k) * comb(total-fav, draw-k) / comb(total, draw);
    }
    document.getElementById('urn-result').innerText =
        `P(exatamente ${k} favoráveis) = ${prob.toFixed(6)} (${(prob*100).toFixed(2)}%)`;
}