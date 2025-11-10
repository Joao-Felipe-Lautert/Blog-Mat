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

calcPythagoras = () => {
    let a = parseFloat(document.getElementById('cateto-a').value);
    let b = parseFloat(document.getElementById('cateto-b').value);
    let c = Math.sqrt(a * a + b * b);
    document.getElementById('pythagoras-result').innerText = `A hipotenusa é: ${c.toFixed(2)}`;
}

clearPythagoras = () => {
    document.getElementById('cateto-a').value = '';
    document.getElementById('cateto-b').value = '';
    document.getElementById('pythagoras-result').innerText = '';
}