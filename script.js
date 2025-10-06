// Espera todo o conteúdo da página carregar antes de executar o script
document.addEventListener('DOMContentLoaded', function() {
    
    // Seleciona todos os elementos que têm a classe 'menu-botao'
    const menuButtons = document.querySelectorAll('.menu-botao');
    
    // Para cada botão, adiciona um atraso para a animação aparecer
    menuButtons.forEach((button, index) => {
        // Atraso aumenta para cada botão (150ms, 300ms, 450ms...)
        setTimeout(() => {
            button.style.opacity = '1';
            button.style.transform = 'translateY(0)';
        }, 150 * (index + 1));
    });

});