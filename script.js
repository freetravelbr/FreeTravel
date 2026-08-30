// Permite que os links normais (.html) abram a página e apenas links com '#' rolem a tela
document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('a');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Se o link for para um arquivo .html ou link externo, deixa navegar normalmente
            if (href && (href.endsWith('.html') || href.startsWith('http') || href.startsWith('https'))) {
                return; // Não bloqueia a navegação
            }
            
            // Se for apenas uma âncora interna (#), faz a rolagem suave
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
});
document.addEventListener('DOMContentLoaded', () => {
  const oneWayRadio = document.getElementById('typeOneWay');
  const roundTripRadio = document.getElementById('typeRoundTrip');
  const returnInput = document.getElementById('return');

  if (oneWayRadio && roundTripRadio && returnInput) {
    function toggleReturnField() {
      if (oneWayRadio.checked) {
        returnInput.disabled = true;
        returnInput.required = false;
        returnInput.value = '';
        returnInput.classList.add('disabled-input');
      } else {
        returnInput.disabled = false;
        returnInput.required = true;
        returnInput.classList.remove('disabled-input');
      }
    }

    oneWayRadio.addEventListener('change', toggleReturnField);
    roundTripRadio.addEventListener('change', toggleReturnField);
  }
});
