// ===== SYSTÈME DE MISE À JOUR AUTOMATIQUE =====
if ('serviceWorker' in navigator) {
  // Écoute les messages du Service Worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
      showUpdateNotification();
    }
  });
  
  // Enregistre le Service Worker
  navigator.serviceWorker.register('service-worker.js').then(registration => {
    // Vérifie les mises à jour toutes les heures
    setInterval(() => {
      registration.update();
    }, 3600000);
  });
}

function showUpdateNotification() {
  const existingBanner = document.getElementById('update-banner');
  if (existingBanner) return; // Ne pas dupliquer la notification
  
  const banner = document.createElement('div');
  banner.id = 'update-banner';
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
    color: white;
    padding: 15px 20px;
    text-align: center;
    z-index: 10000;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    font-weight: bold;
    cursor: pointer;
    animation: slideDown 0.3s ease;
  `;
  banner.innerHTML = `
    🔄 <span style="font-size: 16px;">Nouvelle version disponible !</span><br>
    <span style="font-size: 13px;">Cliquez ici pour mettre à jour</span>
  `;
  
  banner.onclick = () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  };
  
  document.body.prepend(banner);
  
  // Animation CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown {
      from { transform: translateY(-100%); }
      to { transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

// ===== GESTION FAVORIS =====
function initFavorites() {
  const saved = localStorage.getItem('favorites');
  return saved ? JSON.parse(saved) : {};
}

let favorites = initFavorites();

function toggleFavorite(itemId) {
  if (favorites[itemId]) {
    delete favorites[itemId];
  } else {
    favorites[itemId] = {
      id: itemId,
      timestamp: new Date().toISOString()
    };
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
  updateFavoriteButtons();
  updateFavoritesButton();
}

function isFavorited(itemId) {
  return !!favorites[itemId];
}

function updateFavoriteButtons() {
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    const itemId = btn.dataset.itemId;
    if (isFavorited(itemId)) {
      btn.classList.add('favorited');
      btn.textContent = '⭐';
    } else {
      btn.classList.remove('favorited');
      btn.textContent = '☆';
    }
  });
}

function getFavoritesCount() {
  return Object.keys(favorites).length;
}

function updateFavoritesButton() {
  const count = getFavoritesCount();
  const btn = document.getElementById('favoritesCount');
  if (btn) {
    btn.textContent = count;
  }
}

function showFavorites() {
  const favoriteIds = Object.keys(favorites);
  
  if (favoriteIds.length === 0) {
    alert('Aucun favori sauvegardé. Utilisez le bouton ⭐ pour ajouter des articles à vos favoris.');
    return;
  }

  // Récupérer les articles favoris
  const favoriteItems = favoriteIds.map(id => {
    if (id.startsWith('natinf-')) {
      const numero = id.replace('natinf-', '');
      return natinfData.find(item => item.numero === numero);
    } else if (id.startsWith('code-')) {
      const parts = id.replace('code-', '').split('-');
      const code = parts[0];
      const numero = parts.slice(1).join('-');
      const codeObj = Object.values(codesData).flat().find(item => item && item.code === code && item.numero === numero);
      return codeObj;
    }
  }).filter(Boolean);

  let html = `
    <div class="results-container">
      <div class="results-section">
        <h2 class="section-header">⭐ Mes Favoris (${favoriteItems.length})</h2>
        <div class="section-content">
  `;

  favoriteItems.forEach(item => {
    if (item.numero && item.definiePar) {
      // C'est un NATINF
      html += `
        <div class="result-item natinf-result" onclick="toggleResultDetails(this)">
          <div class="result-header-line">
            <div class="result-left">
              <button class="favorite-btn favorited" onclick="event.stopPropagation(); toggleFavorite('natinf-${item.numero}'); location.reload();" title="Retirer des favoris">⭐</button>
              <span class="result-badge natinf-badge">NATINF ${item.numero}</span>
              <span class="result-nature-label">${item.nature}</span>
            </div>
            <span class="expand-icon">▼</span>
          </div>
          <div class="result-title">${item.qualification}</div>
          <div class="result-details" style="display: none;">
            <div class="detail-row"><strong>📖 Défini par:</strong> ${item.definiePar}</div>
            <div class="detail-row"><strong>⚖️ Réprimé par:</strong> ${item.reprimePar}</div>
          </div>
        </div>
      `;
    } else if (item.code) {
      // C'est un code
      const summary = item.texte.length > 200 ? item.texte.substring(0, 200) + '...' : item.texte;
      html += `
        <div class="result-item code-result" onclick="toggleResultDetails(this)">
          <div class="result-header-line">
            <div class="result-left">
              <button class="favorite-btn favorited" onclick="event.stopPropagation(); toggleFavorite('code-${item.code}-${item.numero}'); location.reload();" title="Retirer des favoris">⭐</button>
              <span class="result-badge code-badge">${item.code}</span>
              <span class="article-number">Article ${item.numero}</span>
            </div>
            <span class="expand-icon">▼</span>
          </div>
          <div class="article-summary">${summary}</div>
          <div class="result-details" style="display: none;">
            <div class="article-text">${item.texte}</div>
          </div>
        </div>
      `;
    }
  });

  html += `
        </div>
      </div>
    </div>
  `;

  document.getElementById('resultsContainer').innerHTML = html;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== GESTION MODE SOMBRE =====
function initDarkMode() {
  const savedMode = localStorage.getItem('darkMode');
  if (savedMode === 'true') {
    document.body.classList.add('dark-mode');
    updateDarkModeIcon(true);
  }
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', isDark);
  updateDarkModeIcon(isDark);
}

function updateDarkModeIcon(isDark) {
  const icon = document.getElementById('darkModeIcon');
  const btn = document.getElementById('darkModeBtn');
  if (isDark) {
    icon.textContent = '☀️';
    btn.title = 'Activer le mode clair';
  } else {
    icon.textContent = '🌙';
    btn.title = 'Activer le mode sombre';
  }
}

// ===== GESTION AFFICHAGE RÉSULTATS =====
let visibleSections = {
  'natinf-section': true,
  'codes-section': true,
  'procedures-section': true,
  'documents-section': true
};

// ===== DONNÉES NATINF =====
let natinfData = [];
let filteredData = [];

// ===== DONNÉES CODES JURIDIQUES =====
let codesData = {
  'LEGITEXT000006070719': null,  // Code pénal
  'LEGITEXT000006074228': null,  // Code de la route
  'LEGITEXT000006071154': null,  // Code de procédure pénale
  'CODE_VOIRIE': null,            // Code de la voirie routière
  'CODE_CGCT': null,              // Code général des collectivités territoriales
  'CODE_CSI': null                // Code de la sécurité intérieure
};

// ===== GESTION PROCEDURES ET DOCS =====
let proceduresData = [];
let documentsData = [];

// ===== GESTION SOURCES =====
let sourcesData = null;

// ===== GESTION ADMIN =====
let isAdminMode = false;
let procedures = [];
let documentations = [];
let searchStats = 0;

// Charger procedures.json
async function loadProceduresJSON() {
  try {
    const response = await fetch('procedures.json');
    const data = await response.json();
    proceduresData = data.procedures || [];
    documentsData = data.documents || [];
    console.log('Procédures chargées:', proceduresData.length);
    console.log('Documents chargés:', documentsData.length);
  } catch (error) {
    console.error('Erreur chargement procedures.json:', error);
    proceduresData = [];
    documentsData = [];
  }
}

// Charger sources.json
async function loadSourcesJSON() {
  try {
    const response = await fetch('sources.json');
    sourcesData = await response.json();
    console.log('Sources chargées:', sourcesData.version);
  } catch (error) {
    console.error('Erreur chargement sources.json:', error);
    sourcesData = null;
  }
}

// Charger les données depuis localStorage
function loadAdminData() {
  const savedProcedures = localStorage.getItem('lexparref_procedures');
  const savedDocs = localStorage.getItem('lexparref_docs');
  const savedStats = localStorage.getItem('lexparref_stats');
  
  if (savedProcedures) procedures = JSON.parse(savedProcedures);
  if (savedDocs) documentations = JSON.parse(savedDocs);
  if (savedStats) searchStats = parseInt(savedStats);
  
  // Procédure par défaut
  if (procedures.length === 0) {
    procedures.push({
      titre: "Fiche doctrine - engins à vitesse augmentée",
      fichier: "Fiche doctrine - engins à vitesse augmentée - septembre 2025.pdf",
      date: "Septembre 2025",
      mots_cles: "engins vitesse augmentée edpm trottinette"
    });
  }
}

function saveAdminData() {
  localStorage.setItem('lexparref_procedures', JSON.stringify(procedures));
  localStorage.setItem('lexparref_docs', JSON.stringify(documentations));
  localStorage.setItem('lexparref_stats', searchStats.toString());
}

// ===== AUTHENTIFICATION ADMIN =====
function toggleAdminLogin() {
  if (isAdminMode) {
    logoutAdmin();
  } else {
    document.getElementById('adminLoginModal').style.display = 'flex';
  }
}

function closeAdminLogin() {
  document.getElementById('adminLoginModal').style.display = 'none';
  document.getElementById('adminPassword').value = '';
}

function checkAdminPassword() {
  const password = document.getElementById('adminPassword').value;
  
  // Mot de passe par défaut (à changer en production)
  if (password === 'admin123') {
    isAdminMode = true;
    closeAdminLogin();
    showAdminPanel();
  } else {
    alert('❌ Mot de passe incorrect');
  }
}

function showAdminPanel() {
  document.getElementById('adminPanel').style.display = 'block';
  document.getElementById('adminBtn').innerHTML = '<span>🚪 Quitter Admin</span>';
  loadAdminProcedures();
  loadAdminDocs();
  updateAdminStats();
}

function logoutAdmin() {
  isAdminMode = false;
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('adminBtn').innerHTML = '<span id="adminBtnText">🔑 Admin</span>';
}

// ===== GESTION PROCÉDURES =====
function addProcedure() {
  const title = document.getElementById('procTitle').value.trim();
  const keywords = document.getElementById('procKeywords').value.trim();
  const file = document.getElementById('procFile').value.trim();
  const date = document.getElementById('procDate').value.trim();
  
  if (!title || !keywords || !file) {
    alert('❌ Veuillez remplir tous les champs');
    return;
  }
  
  procedures.push({
    titre: title,
    fichier: file,
    date: date || new Date().toLocaleDateString('fr-FR'),
    mots_cles: keywords
  });
  
  saveAdminData();
  loadAdminProcedures();
  updateAdminStats();
  
  // Réinitialiser le formulaire
  document.getElementById('procTitle').value = '';
  document.getElementById('procKeywords').value = '';
  document.getElementById('procFile').value = '';
  document.getElementById('procDate').value = '';
  
  alert('✅ Procédure ajoutée avec succès !');
}

function loadAdminProcedures() {
  const container = document.getElementById('proceduresList');
  container.innerHTML = procedures.map((proc, index) => `
    <div class="admin-item">
      <div class="item-info">
        <strong>${proc.titre}</strong>
        <div class="item-meta">📁 ${proc.fichier} • 📅 ${proc.date}</div>
        <div class="item-keywords">🏷️ ${proc.mots_cles}</div>
      </div>
      <button onclick="deleteProcedure(${index})" class="delete-btn">🗑️</button>
    </div>
  `).join('');
}

function deleteProcedure(index) {
  if (confirm('Supprimer cette procédure ?')) {
    procedures.splice(index, 1);
    saveAdminData();
    loadAdminProcedures();
    updateAdminStats();
  }
}

// ===== GESTION DOCUMENTATION =====
function addDocumentation() {
  const title = document.getElementById('docTitle').value.trim();
  const content = document.getElementById('docContent').value.trim();
  
  if (!title || !content) {
    alert('❌ Veuillez remplir tous les champs');
    return;
  }
  
  documentations.push({
    titre: title,
    contenu: content,
    date: new Date().toLocaleDateString('fr-FR')
  });
  
  saveAdminData();
  loadAdminDocs();
  
  document.getElementById('docTitle').value = '';
  document.getElementById('docContent').value = '';
  
  alert('✅ Documentation ajoutée avec succès !');
}

function loadAdminDocs() {
  const container = document.getElementById('docsList');
  container.innerHTML = documentations.map((doc, index) => `
    <div class="admin-item">
      <div class="item-info">
        <strong>${doc.titre}</strong>
        <div class="item-meta">📅 ${doc.date}</div>
        <div class="item-content">${doc.contenu.substring(0, 100)}...</div>
      </div>
      <button onclick="deleteDoc(${index})" class="delete-btn">🗑️</button>
    </div>
  `).join('');
}

function deleteDoc(index) {
  if (confirm('Supprimer cette documentation ?')) {
    documentations.splice(index, 1);
    saveAdminData();
    loadAdminDocs();
  }
}

// ===== STATISTIQUES =====
function updateAdminStats() {
  const totalSearchesEl = document.getElementById('totalSearches');
  const totalProceduresEl = document.getElementById('totalProcedures');
  
  if (totalSearchesEl) totalSearchesEl.textContent = searchStats;
  if (totalProceduresEl) totalProceduresEl.textContent = procedures.length;
}

function incrementSearchStats() {
  searchStats++;
  saveAdminData();
  if (isAdminMode) {
    updateAdminStats();
  }
}

// ===== CHARGEMENT DES DONNÉES =====
async function loadAllCodes() {
  const codes = [
    { id: 'LEGITEXT000006070719', file: 'code-penal.json', name: 'Code Pénal' },
    { id: 'LEGITEXT000006074228', file: 'code-route.json', name: 'Code de la Route' },
    { id: 'LEGITEXT000006071154', file: 'code-procedure-penale.json', name: 'CPP' },
    { id: 'CODE_VOIRIE', file: 'code-voirie.json', name: 'Code Voirie Routière' },
    { id: 'CODE_CGCT', file: 'code-cgct.json', name: 'CGCT' },
    { id: 'CODE_CSI', file: 'code-securite-interieure.json', name: 'CSI' }
  ];
  
  for (const code of codes) {
    try {
      const response = await fetch(code.file);
      codesData[code.id] = await response.json();
      console.log(`✅ ${code.name}: ${codesData[code.id].total_articles} articles`);
    } catch (error) {
      console.error(`Erreur chargement ${code.name}:`, error);
    }
  }
}

async function loadNatinfData() {
  try {
    const response = await fetch('liste-natinf-juillet-2025.csv');
    const csvText = await response.text();
    
    // Parser le CSV
    const lines = csvText.split('\n');
    const headers = lines[0].split(';');
    
    natinfData = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const values = lines[i].split(';');
      
      if (values.length >= 5) {
        natinfData.push({
          numero: values[0]?.trim() || '',
          nature: values[1]?.trim() || '',
          qualification: values[2]?.trim() || '',
          definiePar: values[3]?.trim() || '',
          reprimePar: values[4]?.trim() || ''
        });
      }
    }
    
    console.log('✅ NATINF chargés:', natinfData.length, 'codes');
    
  } catch (error) {
    console.error('❌ Erreur chargement NATINF:', error);
  }
}

// ===== VARIABLES GLOBALES FILTRES =====
let currentResults = { natinf: [], codes: [], procedures: [] };
let currentFilter = 'all';
let searchType = 'all'; // 'all', 'natinf', 'codes'

// ===== SÉLECTION TYPE DE RECHERCHE =====
function setSearchType(type) {
  console.log('setSearchType appelé avec:', type);
  searchType = type;
  document.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-type="${type}"]`).classList.add('active');
  
  // Mettre à jour le placeholder
  const input = document.getElementById('unifiedSearchInput');
  if (input) {
    if (type === 'natinf') {
      input.placeholder = '🔍 Rechercher dans les NATINF...';
    } else if (type === 'codes') {
      input.placeholder = '🔍 Rechercher dans les codes (numéro ou mots-clés)...';
    } else {
      input.placeholder = '🔍 Rechercher NATINF, article, procédure...';
    }
  }
}

// ===== AFFICHAGE DES RÉSULTATS UNIFIÉS =====
function displayUnifiedResults(natinfResults, codeResults, procedureResults, query) {
  const container = document.getElementById('searchResults');
  
  // Sauvegarder les résultats pour le filtrage
  currentResults = {
    natinf: natinfResults,
    codes: codeResults,
    procedures: procedureResults
  };
  
  const totalResults = natinfResults.length + codeResults.length + procedureResults.length;
  
  if (totalResults === 0) {
    const navBox = document.getElementById('resultsNavBox');
    if (navBox) navBox.style.display = 'none';
    
    container.innerHTML = `
      <div class="no-results">
        <h3>❌ Aucun résultat</h3>
        <p>Aucun résultat trouvé pour "<strong>${query}</strong>"</p>
        <p class="help-text">💡 Essayez avec d'autres mots-clés</p>
      </div>
    `;
    return;
  }
  
  // Réinitialiser l'état de visibilité pour les nouveaux résultats (tous masqués au démarrage)
  visibleSections = {
    'natinf-section': false,
    'codes-section': false,
    'procedures-section': false,
    'documents-section': false
  };
  
  // Créer les boutons de navigation toggle
  const navBox = document.getElementById('resultsNavBox');
  const navButtons = [];
  
  if (natinfResults.length > 0) {
    navButtons.push(`<button class="nav-result-btn" data-section="natinf-section" onclick="toggleSection('natinf-section')">📋 NATINF (${natinfResults.length})</button>`);
  }
  if (codeResults.length > 0) {
    navButtons.push(`<button class="nav-result-btn" data-section="codes-section" onclick="toggleSection('codes-section')">⚖️ Articles (${codeResults.length})</button>`);
  }
  if (procedureResults.length > 0) {
    const docCount = procedureResults.filter(p => p.type === 'document').length;
    const procCount = procedureResults.filter(p => p.type === 'doctrine' || !p.type).length;
    if (procCount > 0) navButtons.push(`<button class="nav-result-btn" data-section="procedures-section" onclick="toggleSection('procedures-section')">📄 Fiches doctrine (${procCount})</button>`);
    if (docCount > 0) navButtons.push(`<button class="nav-result-btn" data-section="documents-section" onclick="toggleSection('documents-section')">📑 Documents (${docCount})</button>`);
  }
  
  // Remplir la boîte de navigation
  navBox.innerHTML = navButtons.join(' • ');
  navBox.style.display = 'block';
  
  // Afficher et mettre à jour les filtres
  updateFilterCounts();
  const filtersEl = document.getElementById('filtersContainer');
  if (filtersEl) filtersEl.style.display = 'block';
  
  // Appliquer le filtre actuel
  applyCurrentFilter();
}

// ===== TOGGLE SECTION (AFFICHER/MASQUER) =====
function toggleSection(sectionId) {
  const section = document.getElementById(sectionId);
  const button = document.querySelector(`[data-section="${sectionId}"]`);
  
  if (section && button) {
    // Basculer l'état de visibilité
    visibleSections[sectionId] = !visibleSections[sectionId];
    
    if (visibleSections[sectionId]) {
      // Afficher la section
      section.style.display = 'block';
      section.classList.add('section-appear');
      button.classList.add('active');
    } else {
      // Masquer la section
      section.classList.remove('section-appear');
      button.classList.remove('active');
      setTimeout(() => {
        section.style.display = 'none';
      }, 300);
    }
  }
}

// ===== MISE À JOUR DES COMPTEURS FILTRES =====
function updateFilterCounts() {
  const cpCount = currentResults.codes.filter(r => r.code === 'Code Pénal').length;
  const crCount = currentResults.codes.filter(r => r.code === 'Code de la Route').length;
  const cppCount = currentResults.codes.filter(r => r.code === 'Code de Procédure Pénale').length;
  const voirieCount = currentResults.codes.filter(r => r.code === 'Code de la Voirie Routière').length;
  const cgctCount = currentResults.codes.filter(r => r.code === 'CGCT').length;
  const csiCount = currentResults.codes.filter(r => r.code === 'CSI').length;
  
  const total = currentResults.natinf.length + currentResults.codes.length + currentResults.procedures.length;
  
  const elements = {
    countAll: total,
    countNatinf: currentResults.natinf.length,
    countCP: cpCount,
    countCR: crCount,
    countCPP: cppCount,
    countVoirie: voirieCount,
    countCGCT: cgctCount,
    countCSI: csiCount,
    countProc: currentResults.procedures.length
  };
  
  // Mettre à jour seulement les éléments qui existent
  for (const [id, value] of Object.entries(elements)) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }
}

// ===== FILTRAGE DES RÉSULTATS =====
function filterResults(filterType) {
  currentFilter = filterType;
  
  // Mettre à jour les boutons actifs
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.classList.remove('active');
  });
  document.querySelector(`[data-filter="${filterType}"]`).classList.add('active');
  
  applyCurrentFilter();
}

// ===== APPLICATION DU FILTRE =====
function applyCurrentFilter() {
  const container = document.getElementById('searchResults');
  
  let natinfToShow = currentResults.natinf;
  let codesToShow = currentResults.codes;
  let proceduresToShow = currentResults.procedures;
  
  // Appliquer le filtre
  if (currentFilter === 'natinf') {
    codesToShow = [];
    proceduresToShow = [];
  } else if (currentFilter === 'procedures') {
    natinfToShow = [];
    codesToShow = [];
  } else if (currentFilter !== 'all') {
    natinfToShow = [];
    proceduresToShow = [];
    
    const codeMap = {
      'cp': 'Code Pénal',
      'cr': 'Code de la Route',
      'cpp': 'Code de Procédure Pénale',
      'voirie': 'Code de la Voirie Routière',
      'cgct': 'CGCT',
      'csi': 'CSI'
    };
    
    codesToShow = currentResults.codes.filter(r => r.code === codeMap[currentFilter]);
  }
  
  let html = ``;
  
  // NATINF
  if (natinfToShow.length > 0) {
    const display = visibleSections['natinf-section'] ? 'block' : 'none';
    html += `
      <div class="results-section" id="natinf-section" style="display: ${display};">
        <h3 class="section-header collapsible-header" onclick="toggleSectionContent(this)">
          <span>📋 Codes NATINF (${natinfToShow.length})</span>
          <span class="section-icon">▼</span>
        </h3>
        <div class="section-content">
          ${natinfToShow.map(item => `
            <div class="result-item natinf-result" onclick="toggleResultDetails(this)">
              <div class="result-header-line">
                <div class="result-left">
                  <button class="favorite-btn" data-item-id="natinf-${item.numero}" onclick="event.stopPropagation(); toggleFavorite('natinf-${item.numero}');" title="Ajouter aux favoris">
                    ${isFavorited('natinf-' + item.numero) ? '⭐' : '☆'}
                  </button>
                  <span class="result-badge natinf-badge">NATINF ${item.numero}</span>
                  <span class="result-nature-label">${item.nature}</span>
                </div>
                <span class="expand-icon">▼</span>
              </div>
              <div class="result-title">${item.qualification}</div>
              <div class="result-details" style="display: none;">
                <div class="detail-row"><strong>📖 Défini par:</strong> ${item.definiePar}</div>
                <div class="detail-row"><strong>⚖️ Réprimé par:</strong> ${item.reprimePar}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  // CODES JURIDIQUES
  if (codesToShow.length > 0) {
    const display = visibleSections['codes-section'] ? 'block' : 'none';
    html += `
      <div class="results-section" id="codes-section" style="display: ${display};">
        <h3 class="section-header collapsible-header" onclick="toggleSectionContent(this)">
          <span>📕 Articles de loi (${codesToShow.length})</span>
          <span class="section-icon">▼</span>
        </h3>
        <div class="section-content">
          ${codesToShow.map(item => {
            // Créer un résumé court (premiers 200 caractères + ...)
            const summary = item.texte.length > 200 ? item.texte.substring(0, 200) + '...' : item.texte;
            return `
              <div class="result-item code-result" onclick="toggleResultDetails(this)">
                <div class="result-header-line">
                  <div class="result-left">
                    <button class="favorite-btn" data-item-id="code-${item.code}-${item.numero}" onclick="event.stopPropagation(); toggleFavorite('code-${item.code}-${item.numero}');" title="Ajouter aux favoris">
                      ${isFavorited('code-' + item.code + '-' + item.numero) ? '⭐' : '☆'}
                    </button>
                    <span class="result-badge code-badge">${item.code}</span>
                    <span class="article-number">Article ${item.numero}</span>
                  </div>
                  <span class="expand-icon">▼</span>
                </div>
                <div class="article-summary">${summary}</div>
                <div class="result-details" style="display: none;">
                  <div class="article-text">${item.texte}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }
  
  // PROCÉDURES ET DOCUMENTS
  if (proceduresToShow.length > 0) {
    // Séparer procédures et documents
    const procs = proceduresToShow.filter(item => item.type === 'doctrine' || !item.type);
    const docs = proceduresToShow.filter(item => item.type === 'document');
    
    // Afficher les procédures doctrine
    if (procs.length > 0) {
      const display = visibleSections['procedures-section'] ? 'block' : 'none';
      html += `
        <div class="results-section" id="procedures-section" style="display: ${display};">
          <h3 class="section-header collapsible-header" onclick="toggleSectionContent(this)">
            <span>📄 Fiches doctrine (${procs.length})</span>
            <span class="section-icon">▼</span>
          </h3>
          <div class="section-content">
            ${procs.map(item => `
              <a href="${item.fichier}" target="_blank" class="result-item procedure-result">
                <div class="result-header-line">
                  <div class="result-left">
                    <span class="result-badge procedure-badge">PDF</span>
                  </div>
                </div>
                <div class="result-title">${item.titre}</div>
                ${item.resume ? `<div class="result-summary">${item.resume}</div>` : ''}
                <div class="result-subtitle">${item.date}</div>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    // Afficher les documents
    if (docs.length > 0) {
      const display = visibleSections['documents-section'] ? 'block' : 'none';
      html += `
        <div class="results-section" id="documents-section" style="display: ${display};">
          <h3 class="section-header collapsible-header" onclick="toggleSectionContent(this)">
            <span>📑 Documents (${docs.length})</span>
            <span class="section-icon">▼</span>
          </h3>
          <div class="section-content">
            ${docs.map(item => `
              <a href="${item.fichier}" target="_blank" class="result-item procedure-result">
                <div class="result-header-line">
                  <div class="result-left">
                    <span class="result-badge procedure-badge">PDF</span>
                  </div>
                </div>
                <div class="result-title">${item.titre}</div>
                ${item.resume ? `<div class="result-summary">${item.resume}</div>` : ''}
                <div class="result-subtitle">
                  ${item.date}${item.source ? ` • Source: ${item.source}` : ''}
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }
  }
  
  container.innerHTML = html;
}

// ===== TOGGLE DÉTAILS =====
function toggleResultDetails(element) {
  const details = element.querySelector('.result-details');
  const summary = element.querySelector('.article-summary');
  const icon = element.querySelector('.expand-icon');
  
  if (details.style.display === 'none') {
    details.style.display = 'block';
    if (summary) summary.style.display = 'none';
    icon.textContent = '▲';
    element.classList.add('expanded');
  } else {
    details.style.display = 'none';
    if (summary) summary.style.display = 'block';
    icon.textContent = '▼';
    element.classList.remove('expanded');
  }
}

// ===== TOGGLE SECTION =====
function toggleSectionContent(header) {
  const section = header.nextElementSibling;
  const icon = header.querySelector('.section-icon');
  
  if (section.style.display === 'none') {
    section.style.display = 'block';
    icon.textContent = '▼';
  } else {
    section.style.display = 'none';
    icon.textContent = '▶';
  }
}

// ===== RECHERCHE UNIFIÉE =====
function unifiedSearch() {
  console.log('unifiedSearch appelée');
  const query = document.getElementById('unifiedSearchInput').value.trim();
  console.log('Query:', query, 'Type:', searchType);
  
  if (!query || query.length < 2) {
    alert('Veuillez entrer au moins 2 caractères');
    return;
  }
  
  // Incrémenter les statistiques
  if (typeof incrementSearchStats === 'function') {
    incrementSearchStats();
  }
  
  const resultsContainer = document.getElementById('searchResults');
  resultsContainer.innerHTML = '<div class="loading">🔍 Recherche en cours...</div>';
  
  // Lancer les recherches selon le type sélectionné
  let natinfResults = [];
  let codeResults = [];
  let procedureResults = [];
  
  if (searchType === 'all' || searchType === 'natinf') {
    natinfResults = searchInNatinf(query);
    console.log('Résultats NATINF:', natinfResults.length);
  }
  
  if (searchType === 'all' || searchType === 'codes') {
    codeResults = searchInCodes(query);
    procedureResults = searchInProcedures(query);
    console.log('Résultats Codes:', codeResults.length, 'Procédures:', procedureResults.length);
  }
  
  // Afficher les résultats
  displayUnifiedResults(natinfResults, codeResults, procedureResults, query);
  
  // Mettre à jour le compteur
  const total = natinfResults.length + codeResults.length + procedureResults.length;
  const countElement = document.getElementById('resultCount');
  if (countElement) {
    countElement.textContent = total;
  }
}

// ===== RECHERCHE DANS NATINF =====
function searchInNatinf(query) {
  const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 0);
  
  const results = natinfData.filter(item => {
    const searchableText = `${item.numero} ${item.qualification} ${item.nature} ${item.definiePar} ${item.reprimePar}`.toLowerCase();
    return keywords.every(keyword => searchableText.includes(keyword));
  });
  
  // Fonction de priorité pour le tri
  function getPriority(item) {
    const nature = item.nature.toLowerCase();
    const definiePar = item.definiePar.toLowerCase();
    const reprimePar = item.reprimePar.toLowerCase();
    const allText = `${definiePar} ${reprimePar}`;
    
    // Priorité par type d'infraction (0 = plus prioritaire)
    let typePriority = 100;
    if (nature.includes('contravention de 1')) typePriority = 0;
    else if (nature.includes('contravention de 2')) typePriority = 1;
    else if (nature.includes('contravention de 3')) typePriority = 2;
    else if (nature.includes('contravention de 4')) typePriority = 3;
    else if (nature.includes('contravention de 5')) typePriority = 4;
    else if (nature.includes('délit')) typePriority = 5;
    else if (nature.includes('crime')) typePriority = 6;
    
    // Priorité par code (0 = plus prioritaire)
    let codePriority = 10;
    if (allText.includes('c.route') || allText.includes('code de la route')) codePriority = 0;
    else if (allText.includes('c.penal') || allText.includes('code pénal') || allText.includes('c.pén')) codePriority = 1;
    else codePriority = 2;
    
    // Combinaison : type d'abord, puis code
    return typePriority * 10 + codePriority;
  }
  
  // Trier les résultats selon la priorité
  results.sort((a, b) => getPriority(a) - getPriority(b));
  
  return results.slice(0, 20);
}

// ===== RECHERCHE DANS LES CODES =====
function searchInCodes(query) {
  const cleanInput = query.replace(/^ART\.?\s*/i, '').replace(/\s+/g, '').toUpperCase();
  const isArticleNumber = /^([LRD])?\d+(-\d+)?$/i.test(cleanInput);
  
  let allResults = [];
  
  if (isArticleNumber) {
    // Recherche par numéro d'article
    for (const id in codesData) {
      const codeData = codesData[id];
      if (!codeData) continue;
      
      const article = codeData.articles[cleanInput];
      if (article) {
        allResults.push({
          numero: article.numero,
          texte: article.texte,
          code: codeData.code
        });
      }
    }
  } else {
    // Recherche par mots-clés (minimum 2 caractères)
    const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length >= 2);
    
    if (keywords.length === 0) return [];
    
    for (const id in codesData) {
      const codeData = codesData[id];
      if (!codeData) continue;
      
      // Parcourir les articles et s'arrêter dès qu'on a 20 résultats
      for (const artNum in codeData.articles) {
        if (allResults.length >= 20) break;
        
        const article = codeData.articles[artNum];
        const searchText = `${article.numero} ${article.texte}`.toLowerCase();
        
        if (keywords.every(keyword => searchText.includes(keyword))) {
          allResults.push({
            numero: article.numero,
            texte: article.texte,
            code: codeData.code
          });
        }
      }
      
      if (allResults.length >= 20) break;
    }
  }
  
  return allResults.slice(0, 20);
}

// ===== RECHERCHE DANS LES PROCÉDURES =====
function searchInProcedures(query) {
  const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length >= 2);
  if (keywords.length === 0) return [];
  
  const results = [];
  
  // Recherche dans les procédures JSON
  for (const proc of proceduresData) {
    const searchableText = `${proc.titre} ${proc.mots_cles.join(' ')}`.toLowerCase();
    const matchCount = keywords.filter(kw => searchableText.includes(kw)).length;
    
    if (matchCount > 0) {
      results.push({
        ...proc,
        matchScore: matchCount
      });
    }
  }
  
  // Recherche dans les documents JSON
  for (const doc of documentsData) {
    const searchableText = `${doc.titre} ${doc.mots_cles.join(' ')}`.toLowerCase();
    const matchCount = keywords.filter(kw => searchableText.includes(kw)).length;
    
    if (matchCount > 0) {
      results.push({
        ...doc,
        matchScore: matchCount
      });
    }
  }
  
  // Trier par score de correspondance (plus de mots-clés = meilleur score)
  results.sort((a, b) => b.matchScore - a.matchScore);
  
  return results.slice(0, 10); // Max 10 résultats
}

// ===== MISE À JOUR DES STATS =====
function updateStats() {
  document.getElementById('totalNatinf').textContent = natinfData.length;
  document.getElementById('resultCount').textContent = filteredData.length;
}

// ===== GESTION DES ONGLETS =====
function switchTab(tabName) {
  // Désactiver tous les onglets
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  // Activer l'onglet sélectionné
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`${tabName}-content`).classList.add('active');
}

// ===== RECHERCHE D'ARTICLE =====
function searchArticle() {
  const input = document.getElementById('articleInput').value.trim();
  const codeSelect = document.getElementById('codeSelect').value;
  
  if (!input) {
    alert('Veuillez entrer une recherche');
    return;
  }
  
  // Vérifier si le code sélectionné est disponible localement
  const hasLocalData = codeSelect === '' || codesData[codeSelect];
  
  if (hasLocalData && Object.values(codesData).some(c => c !== null)) {
    searchCodesLocal(input, codeSelect);
  } else {
    // Fallback vers Légifrance si pas de données locales
    searchLegifrance(input, codeSelect);
  }
}

// ===== RECHERCHE LOCALE DANS LES CODES =====
function searchCodesLocal(input, codeId) {
  // Nettoyer l'input
  const cleanInput = input.replace(/^ART\.?\s*/i, '').replace(/\s+/g, '').toUpperCase();
  
  // Détecter si c'est un numéro d'article (ex: 222-19, L234-1, R625-1)
  const isArticleNumber = /^([LRD])?\d+(-\d+)?$/i.test(cleanInput);
  
  let allResults = [];
  
  // Déterminer quels codes chercher
  const codesToSearch = codeId && codeId !== '' 
    ? [codeId] 
    : Object.keys(codesData).filter(id => codesData[id] !== null);
  
  if (isArticleNumber) {
    // RECHERCHE PAR NUMÉRO D'ARTICLE
    for (const id of codesToSearch) {
      const codeData = codesData[id];
      if (!codeData) continue;
      
      const article = codeData.articles[cleanInput];
      if (article) {
        allResults.push({
          ...article,
          code: codeData.code
        });
      }
    }
  } else {
    // RECHERCHE PAR MOTS-CLÉS
    const keywords = input.toLowerCase().split(/\s+/).filter(k => k.length > 2);
    
    for (const id of codesToSearch) {
      const codeData = codesData[id];
      if (!codeData) continue;
      
      const codeResults = Object.values(codeData.articles).filter(article => {
        const searchText = `${article.numero} ${article.texte}`.toLowerCase();
        return keywords.every(keyword => searchText.includes(keyword));
      });
      
      // Ajouter le nom du code à chaque résultat
      codeResults.forEach(r => {
        allResults.push({
          ...r,
          code: codeData.code
        });
      });
    }
    
    // Limiter à 50 résultats
    allResults = allResults.slice(0, 50);
  }
  
  // Afficher les résultats
  displayCodeResults(allResults, input);
}

// ===== AFFICHAGE DES RÉSULTATS =====
function displayCodeResults(results, query) {
  const modal = document.createElement('div');
  modal.className = 'code-penal-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>🔍 Résultats: "${query}"</h3>
        <button onclick="this.closest('.code-penal-modal').remove()" class="close-btn">✕</button>
      </div>
      <div class="modal-body">
        ${results.length === 0 ? 
          '<div class="no-results">❌ Aucun article trouvé</div>' :
          `<div class="results-count">📚 ${results.length} article(s) trouvé(s)</div>` +
          results.map(art => `
            <div class="article-result">
              <div class="article-code-badge">${art.code}</div>
              <div class="article-numero">Article ${art.numero}</div>
              <div class="article-texte">${art.texte}</div>
            </div>
          `).join('')
        }
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Fermer en cliquant à l'extérieur
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

// ===== RECHERCHE LÉGIFRANCE (AUTRES CODES) =====
function searchLegifrance(input, codeId) {
  // Détecter le type de recherche
  const isArticleFormat = /^([LRD])?\d+(-\d+)?$/i.test(input.replace(/\s+/g, ''));
  
  let searchUrl;
  
  if (isArticleFormat) {
    const article = input
      .replace(/^ART\.?\s*/i, '')
      .replace(/\s+/g, '')
      .replace(/[°º]/g, '')
      .toUpperCase();
    
    const searchQuery = `"Article ${article}"`;
    searchUrl = `https://www.legifrance.gouv.fr/search/code?tab_selection=code&searchField=ALL&query=${encodeURIComponent(searchQuery)}&page=1&init=true&sortValue=PERTINENCE${codeId ? '&code=' + codeId : ''}`;
  } else {
    const keywords = input.split(/\s+/).filter(k => k.length > 0);
    const searchQuery = keywords.join(' ');
    searchUrl = `https://www.legifrance.gouv.fr/search/code?tab_selection=code&searchField=ALL&query=${encodeURIComponent(searchQuery)}&page=1&init=true&sortValue=PERTINENCE${codeId ? '&code=' + codeId : ''}`;
  }
  
  window.open(searchUrl, '_blank');
}

// ===== ÉVÉNEMENTS =====
document.addEventListener('DOMContentLoaded', () => {
  loadNatinfData();
  loadAllCodes();
  loadProceduresJSON();
  loadSourcesJSON();
  loadAdminData();
  
  // Recherche avec Entrée
  const searchInput = document.getElementById('unifiedSearchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        unifiedSearch();
      }
    });
  }
  
  // Entrée dans le mot de passe admin
  const adminPassword = document.getElementById('adminPassword');
  if (adminPassword) {
    adminPassword.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        checkAdminPassword();
      }
    });
  }
  
  // Entrée dans la recherche d'article Légifrance
  const articleInput = document.getElementById('articleInput');
  if (articleInput) {
    articleInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchArticle();
      }
    });
  }
});

// ===== MODAL SOURCES =====
function openSourcesModal() {
  const modal = document.getElementById('sourcesModal');
  const content = document.getElementById('sourcesContent');
  
  if (!sourcesData) {
    content.innerHTML = '<p class="error-message">⚠️ Impossible de charger les informations de sources.</p>';
    modal.style.display = 'flex';
    return;
  }
  
  content.innerHTML = `
    <div class="sources-info">
      <div class="info-section">
        <h4>📅 Version et mise à jour</h4>
        <p><strong>Version :</strong> ${sourcesData.version}</p>
        <p><strong>Dernière mise à jour :</strong> ${sourcesData.derniere_maj}</p>
      </div>
      
      <div class="info-section">
        <h4>📋 ${sourcesData.sources.natinf.nom}</h4>
        <p><strong>Date :</strong> ${sourcesData.sources.natinf.date}</p>
        <p><strong>Origine :</strong> ${sourcesData.sources.natinf.origine}</p>
        <p><strong>Nombre d'entrées :</strong> ${sourcesData.sources.natinf.nb_entrees.toLocaleString('fr-FR')}</p>
      </div>
      
      <div class="info-section">
        <h4>📕 ${sourcesData.sources.codes.nom}</h4>
        <p><strong>Date :</strong> ${sourcesData.sources.codes.date}</p>
        <p><strong>Origine :</strong> ${sourcesData.sources.codes.origine}</p>
        <ul class="codes-list">
          ${sourcesData.sources.codes.liste.map(code => `<li>${code}</li>`).join('')}
        </ul>
      </div>
      
      <div class="info-section">
        <h4>📄 ${sourcesData.sources.procedures.nom}</h4>
        <p><strong>Date :</strong> ${sourcesData.sources.procedures.date}</p>
        <p><strong>Origine :</strong> ${sourcesData.sources.procedures.origine}</p>
      </div>
      
      <div class="info-section credits">
        <h4>👨‍💻 Crédits</h4>
        <p>${sourcesData.credits}</p>
        ${sourcesData.contact ? `<p><strong>Contact :</strong> ${sourcesData.contact}</p>` : ''}
      </div>
    </div>
  `;
  
  modal.style.display = 'flex';
}

function closeSourcesModal() {
  const modal = document.getElementById('sourcesModal');
  modal.style.display = 'none';
}

// ===== INITIALISATION =====
function setupSearchListener() {
  const searchInput = document.getElementById('unifiedSearchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        unifiedSearch();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  initDarkMode();
  updateFavoritesButton();
  loadProceduresJSON();
  loadAllData();
  setupSearchListener();
});
