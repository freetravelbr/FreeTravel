document.addEventListener('DOMContentLoaded', () => {
  
  // 1. GERENCIAMENTO DE LINKS E ROLAGEM SUAVE
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      
      // Evita erro se o href for apenas "#"
      if (href && href.length > 1) {
        const targetElement = document.querySelector(href);
        
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // 2. ALTERNÂNCIA IDA E VOLTA / SOMENTE IDA
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


