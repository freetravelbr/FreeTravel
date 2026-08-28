// ==========================================
// AUTOCOMPLETE E REDIRECIONAMENTO DE AFILIADO
// ==========================================

const TRAVELPAYOUTS_MARKER = "771005";

// Função para buscar cidades e aeroportos na API pública
async function buscarAeroportos(termo) {
  if (!termo || termo.length < 2) return [];
  try {
    const res = await fetch(`https://autocomplete.travelpayouts.com/places2?term=${encodeURIComponent(termo)}&locale=pt&types[]=city&types[]=airport`);
    return await res.json();
  } catch (err) {
    console.error("Erro ao buscar aeroportos:", err);
    return [];
  }
}

// Helper para formatar data (AAAA-MM-DD para DDMM)
function formatarDataIATA(dataString) {
  if (!dataString) return "";
  const partes = dataString.split('-');
  if (partes.length < 3) return "";
  return `${partes[2]}${partes[1]}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const inputOrigem = document.querySelectorAll("input[type='text']")[0];
  const inputDestino = document.querySelectorAll("input[type='text']")[1];
  const inputIda = document.querySelectorAll("input[type='date']")[0];
  const inputVolta = document.querySelectorAll("input[type='date']")[1];
  const btnBuscar = document.querySelector(".btn-search") || document.querySelector("button");

  // Ação ao clicar no botão Buscar
  if (btnBuscar) {
    btnBuscar.addEventListener("click", (e) => {
      e.preventDefault();

      const origemVal = inputOrigem ? inputOrigem.value.trim() : "";
      const destinoVal = inputDestino ? inputDestino.value.trim() : "";
      const dataIdaVal = inputIda ? inputIda.value : "";
      const dataVoltaVal = inputVolta ? inputVolta.value : "";

      if (!origemVal || !destinoVal) {
        alert("Por favor, preencha a origem e o destino.");
        return;
      }

      const extrairIATA = (texto) => {
        const match = texto.match(/\(([^)]+)\)/);
        if (match && match[1]) return match[1].toUpperCase();
        return texto.length === 3 ? texto.toUpperCase() : texto;
      };

      const iataOrigem = extrairIATA(origemVal);
      const iataDestino = extrairIATA(destinoVal);
      const idaFormatada = formatarDataIATA(dataIdaVal);
      const voltaFormatada = formatarDataIATA(dataVoltaVal);

      const urlFinal = `https://aviasales.com/search/${iataOrigem}${idaFormatada}${iataDestino}${voltaFormatada}1?marker=${TRAVELPAYOUTS_MARKER}`;
      window.open(urlFinal, '_blank');
    });
  }

  // Autocomplete nos campos de origem e destino
  [inputOrigem, inputDestino].forEach((input) => {
    if (!input) return;

    const sugestoesDiv = document.createElement("div");
    sugestoesDiv.style.position = "absolute";
    sugestoesDiv.style.backgroundColor = "#ffffff";
    sugestoesDiv.style.color = "#000000";
    sugestoesDiv.style.border = "1px solid #ddd";
    sugestoesDiv.style.borderRadius = "8px";
    sugestoesDiv.style.zIndex = "1000";
    sugestoesDiv.style.maxHeight = "180px";
    sugestoesDiv.style.overflowY = "auto";
    sugestoesDiv.style.width = "100%";
    sugestoesDiv.style.display = "none";
    sugestoesDiv.style.boxShadow = "0px 4px 10px rgba(0,0,0,0.15)";

    if (input.parentNode) {
      input.parentNode.style.position = "relative";
      input.parentNode.appendChild(sugestoesDiv);
    }

    input.addEventListener("input", async (e) => {
      const termo = e.target.value;
      if (termo.length < 2) {
        sugestoesDiv.style.display = "none";
        return;
      }

      const lista = await buscarAeroportos(termo);
      sugestoesDiv.innerHTML = "";

      if (lista.length === 0) {
        sugestoesDiv.style.display = "none";
        return;
      }

      lista.forEach((item) => {
        const opcao = document.createElement("div");
        opcao.style.padding = "10px";
        opcao.style.cursor = "pointer";
        opcao.style.borderBottom = "1px solid #eee";
        opcao.innerText = `${item.name} (${item.code})`;

        opcao.addEventListener("click", () => {
          input.value = `${item.name} (${item.code})`;
          sugestoesDiv.style.display = "none";
        });

        sugestoesDiv.appendChild(opcao);
      });

      sugestoesDiv.style.display = "block";
    });

    document.addEventListener("click", (evt) => {
      if (!input.contains(evt.target) && !sugestoesDiv.contains(evt.target)) {
        sugestoesDiv.style.display = "none";
      }
    });
  });
});