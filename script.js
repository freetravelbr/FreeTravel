// Estado da Aplicação
const state = {
    allTrips: [
        {
            id: 'trip-1',
            title: 'Rio de Janeiro saindo de São Paulo',
            category: 'Praia',
            price: 450,
            days: 5,
            originCode: 'GRU',
            destinationCode: 'GIG',
            departureDate: '2026-10-15',
            returnDate: '2026-10-20',
            image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&auto=format&fit=crop&q=80',
            badge: 'Imperdível'
        },
        {
            id: 'trip-2',
            title: 'Buenos Aires saindo de São Paulo',
            category: 'Cidade',
            price: 1200,
            days: 7,
            originCode: 'GRU',
            destinationCode: 'EZE',
            departureDate: '2026-11-01',
            returnDate: '2026-11-08',
            image: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=600&auto=format&fit=crop&q=80',
            badge: 'Mais Vendido'
        },
        {
            id: 'trip-3',
            title: 'Bariloche saindo de Buenos Aires',
            category: 'Natureza',
            price: 1800,
            days: 6,
            originCode: 'EZE',
            destinationCode: 'BRC',
            departureDate: '2026-12-05',
            returnDate: '2026-12-11',
            image: 'https://images.unsplash.com/photo-1544986581-efac024faf62?w=600&auto=format&fit=crop&q=80',
            badge: null
        },
        {
            id: 'trip-4',
            title: 'Miami saindo de São Paulo',
            category: 'Praia',
            price: 2850,
            days: 7,
            originCode: 'GRU',
            destinationCode: 'MIA',
            departureDate: '2026-11-10',
            returnDate: '2026-11-17',
            image: 'https://unsplash.com/es/fotos/fotografia-aerea-de-la-ciudad-durante-el-dia-mWN686Fsbgs',
            badge: 'Popular'
        },
        {
            id: 'trip-5',
            title: 'Roma saindo de São Paulo',
            category: 'Cidade',
            price: 3400,
            days: 8,
            originCode: 'GRU',
            destinationCode: 'FCO',
            departureDate: '2026-11-15',
            returnDate: '2026-11-23',
            image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&auto=format&fit=crop&q=80',
            badge: 'Destaque'
        },
        {
            id: 'trip-6',
            title: 'Cairo (Egito) saindo de São Paulo',
            category: 'Natureza',
            price: 4200,
            days: 10,
            originCode: 'GRU',
            destinationCode: 'CAI',
            departureDate: '2026-12-01',
            returnDate: '2026-12-11',
            image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=600&auto=format&fit=crop&q=80',
            badge: 'Exótico'
        }
    ],
    filteredTrips: [],
    favorites: JSON.parse(localStorage.getItem('freetravel_favorites') || '[]'),
    activeFilter: 'Todos',
    maxBudget: 5000,
    showOnlyFavorites: false,
    travelPayoutsMarker: '771005'
};

// Dicionário para relacionar os nomes de data-destination com os códigos IATA
const iataMap = {
    'Rio de Janeiro': 'GIG',
    'Buenos Aires': 'EZE',
    'Madrid': 'MAD',
    'Bariloche': 'BRC',
    'Paris': 'CDG'
};

// Mapeamento dos Elementos do DOM
function getElements() {
    return {
        searchForm: document.getElementById('searchForm'),
        originInput: document.getElementById('origin'),
        destinationInput: document.getElementById('destination'),
        departureInput: document.getElementById('departure'),
        returnInput: document.getElementById('return'),
        passengersSelect: document.getElementById('passengers'),
        returnField: document.getElementById('returnField'),
        typeRoundTrip: document.getElementById('typeRoundTrip'),
        typeOneWay: document.getElementById('typeOneWay'),
        tripGrid: document.getElementById('tripGrid'),
        resultCount: document.getElementById('resultCount'),
        budgetSlider: document.getElementById('budgetSlider'),
        budgetValue: document.getElementById('budgetValue'),
        favoriteCountBadge: document.querySelector('[data-favorite-count]'),
        favoritesButton: document.querySelector('[data-action="show-favorites"]')
    };
}

let elements = getElements();

// Utilitários de Formatação
function extractIataCode(inputString) {
    if (!inputString) return '';
    const match = inputString.match(/\b[A-Z]{3}\b/i);
    return match ? match[0].toUpperCase() : inputString.trim().substring(0, 3).toUpperCase();
}

function formatDateForUrl(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}${month}`;
}

// Gerador de URL de Afiliado (Travelpayouts / Aviasales)
function generateTravelpayoutsUrl(origin, destination, departureDate, returnDate, passengers = 1) {
    const originIata = extractIataCode(origin) || 'GRU';
    const destinationIata = extractIataCode(destination) || 'GIG';
    const formattedDep = departureDate ? formatDateForUrl(departureDate) : '';
    const formattedRet = returnDate ? formatDateForUrl(returnDate) : '';
    const isOneWay = elements.typeOneWay && elements.typeOneWay.checked;

    let routePath = `${originIata}${formattedDep}${destinationIata}`;
    
    if (formattedRet && !isOneWay) {
        routePath += `${formattedRet}`;
    }
    
    routePath += `${passengers}`;

    return `https://www.aviasales.com/search/${routePath}?marker=${state.travelPayoutsMarker}&currency=BRL`;
}

// Ação ao Clicar no Destino Inspiracional (Sobe a página e preenche o destino)
function selectDestinationInForm(destinationName, destinationIata) {
    elements = getElements();

    // 1. Preenche o input de destino
    if (elements.destinationInput) {
        elements.destinationInput.value = `${destinationName} (${destinationIata})`;
        elements.destinationInput.dispatchEvent(new Event('input', { bubbles: true }));
        elements.destinationInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // 2. Rola a página suavemente até o topo
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    // 3. Foca na data de partida após subir a rolagem
    setTimeout(() => {
        if (elements.departureInput) {
            elements.departureInput.focus();
        } else if (elements.destinationInput) {
            elements.destinationInput.focus();
        }
    }, 400);
}

// Configura os ouvintes de clique nos cards de destino baseados no atributo data-destination
function setupDestinationCards() {
    const destinationButtons = document.querySelectorAll('[data-destination]');
    
    destinationButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const cityName = button.getAttribute('data-destination');
            const iataCode = iataMap[cityName] || 'GIG';
            
            selectDestinationInForm(cityName, iataCode);
        });
    });
}

// Renderização dos Cards de Ofertas
function renderTrips() {
    elements = getElements();
    if (!elements.tripGrid) return;

    state.filteredTrips = state.allTrips.filter(trip => {
        const matchesCategory = state.activeFilter === 'Todos' || trip.category === state.activeFilter;
        const matchesBudget = trip.price <= state.maxBudget;
        const matchesFavorites = state.showOnlyFavorites ? state.favorites.includes(trip.id) : true;
        
        return matchesCategory && matchesBudget && matchesFavorites;
    });

    if (elements.resultCount) {
        elements.resultCount.textContent = `${state.filteredTrips.length} oferta(s) encontrada(s)`;
    }

    if (state.filteredTrips.length === 0) {
        elements.tripGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #666;">
                <p style="font-size: 1.2rem; margin-bottom: 10px;">Nenhuma oferta encontrada.</p>
                <small>Tente alterar os filtros de categoria ou ajustar o orçamento.</small>
            </div>
        `;
        return;
    }

    elements.tripGrid.innerHTML = state.filteredTrips.map(trip => {
        const isFav = state.favorites.includes(trip.id);
        const affiliateUrl = generateTravelpayoutsUrl(
            trip.originCode,
            trip.destinationCode,
            trip.departureDate,
            trip.returnDate
        );

        return `
            <article class="trip-card" data-id="${trip.id}" style="background: #ffffff; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.08); min-height: 380px;">
                <div style="position: relative; width: 100%; height: 200px; overflow: hidden; background-color: #e0e0e0; flex-shrink: 0;">
                    <img src="${trip.image}" alt="" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; display: block; border: 0;">
                    ${trip.badge ? `<span style="position: absolute; top: 12px; left: 12px; background: #111111; color: #ffffff; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; z-index: 2;">${trip.badge}</span>` : ''}
                    <button 
                        type="button" 
                        class="favorite-toggle-btn ${isFav ? 'active' : ''}" 
                        onclick="toggleFavorite('${trip.id}')"
                        style="position: absolute; top: 12px; right: 12px; background: #ffffff; border: none; border-radius: 50%; width: 34px; height: 34px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.2); font-size: 1.1rem; color: ${isFav ? '#e63946' : '#777777'}; z-index: 2;"
                        title="${isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}"
                    >
                        ${isFav ? '♥' : '♡'}
                    </button>
                </div>
                <div style="padding: 16px; background-color: #ffffff; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="font-size: 0.8rem; color: #d4a373; font-weight: bold; text-transform: uppercase;">${trip.category}</span>
                            <span style="font-size: 0.8rem; color: #777777;">${trip.days} dias</span>
                        </div>
                        <h3 style="color: #111111 !important; font-size: 1.05rem; font-weight: 700; margin: 0 0 16px 0; line-height: 1.3;">${trip.title}</h3>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 12px; border-top: 1px solid #f0f0f0;">
                        <div>
                            <small style="display: block; color: #777777; font-size: 0.75rem;">A partir de</small>
                            <strong style="font-size: 1.25rem; color: #000000; font-weight: 800;">R$ ${trip.price.toLocaleString('pt-BR')}</strong>
                        </div>
                        <a 
                            href="${affiliateUrl}" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style="background-color: #ffcc00; color: #111111; font-weight: 700; padding: 8px 14px; font-size: 0.85rem; text-decoration: none; border-radius: 6px; display: inline-block;"
                        >
                            Ver Oferta →
                        </a>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

// Gerenciamento de Favoritos
function toggleFavorite(tripId) {
    const index = state.favorites.indexOf(tripId);
    if (index === -1) {
        state.favorites.push(tripId);
    } else {
        state.favorites.splice(index, 1);
    }
    
    localStorage.setItem('freetravel_favorites', JSON.stringify(state.favorites));
    updateFavoriteBadge();
    renderTrips();
}

function updateFavoriteBadge() {
    elements = getElements();
    if (elements.favoriteCountBadge) {
        const count = state.favorites.length;
        elements.favoriteCountBadge.textContent = count;
        elements.favoriteCountBadge.hidden = count === 0;
    }
}

function filterFavorites() {
    if (state.favorites.length === 0 && !state.showOnlyFavorites) {
        alert('Você ainda não tem ofertas salvas nos favoritos!');
        return;
    }
    state.showOnlyFavorites = !state.showOnlyFavorites;
    
    if (elements.favoritesButton) {
        elements.favoritesButton.classList.toggle('active', state.showOnlyFavorites);
    }
    
    renderTrips();
}

// Inicialização de Eventos
function initEventListeners() {
    elements = getElements();

    if (elements.typeOneWay && elements.typeRoundTrip && elements.returnField) {
        elements.typeOneWay.addEventListener('change', () => {
            elements.returnField.style.display = 'none';
            if (elements.returnInput) elements.returnInput.required = false;
        });
        elements.typeRoundTrip.addEventListener('change', () => {
            elements.returnField.style.display = 'block';
            if (elements.returnInput) elements.returnInput.required = true;
        });
    }

    if (elements.searchForm) {
        elements.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const origin = elements.originInput ? elements.originInput.value : 'GRU';
            const destination = elements.destinationInput ? elements.destinationInput.value : '';
            const departure = elements.departureInput ? elements.departureInput.value : '';
            const returnDate = elements.returnInput ? elements.returnInput.value : '';
            const passengers = elements.passengersSelect ? elements.passengersSelect.value : 1;

            const url = generateTravelpayoutsUrl(origin, destination, departure, returnDate, passengers);
            window.open(url, '_blank');
        });
    }

    if (elements.budgetSlider && elements.budgetValue) {
        elements.budgetSlider.addEventListener('input', (e) => {
            state.maxBudget = Number(e.target.value);
            elements.budgetValue.textContent = `R$ ${state.maxBudget.toLocaleString('pt-BR')}`;
            renderTrips();
        });
    }

    document.querySelectorAll('[data-trip-type]').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('[data-trip-type]').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            state.activeFilter = e.target.getAttribute('data-trip-type');
            renderTrips();
        });
    });

    if (elements.favoritesButton) {
        elements.favoritesButton.addEventListener('click', filterFavorites);
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    elements = getElements();
    updateFavoriteBadge();
    initEventListeners();
    renderTrips();
    setupDestinationCards();
});
