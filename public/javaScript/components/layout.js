import { updateHeader } from "../auth.js"; // On importe la logique de connexion

export function loadLayout() {
    // 1. Détection de la page active pour la navigation
    const path = window.location.pathname;

    // 2. Le HTML du Header (Topbar + Header + Nav)
    // Note: J'ai corrigé les chemins d'images vers "/img" (racine) pour que ça marche partout
    const headerHTML = `
    <header class="main-header">
        <div class="logo">
            <a href="/" style="text-decoration:none; display:flex; align-items:center; gap:8px;">
                <span class="logo-text"><b>Giga</b>bay</span>
            </a>
        </div>

        <div class="search-bar">
            <input type="text" placeholder="Rechercher..." />
            <button type="button">🔍</button>
        </div>

        <div class="header-actions">
            <div class="lang">Chargement...</div>
        </div>
    </header>

    <nav class="main-nav">
        <a href="/" class="nav-link ${path === '/' || path === '/index.html' ? 'active' : ''}">Enchères</a>
        <a href="/new-auction" class="nav-link ${path.includes('new-auction') ? 'active' : ''}">Mettre aux enchères</a>
    </nav>
    `;

    // 3. Injection dans le DOM
    // On insère tout ça au tout début du <body>
    document.body.insertAdjacentHTML("afterbegin", headerHTML);

    // 4. Une fois le HTML affiché, on lance la logique d'authentification
    // Cela permet de mettre à jour "Connexion" vs "Mon Profil"
    updateHeader();
}