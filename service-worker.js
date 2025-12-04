const CACHE_NAME = 'lexparref-v21';
const urlsToCache = [
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  'police-logo.jpg',
  'liste-natinf-juillet-2025.csv',
  'procedures.json',
  'sources.json',
  'code-penal.json',
  'code-route.json',
  'code-procedure-penale.json',
  'code-voirie.json',
  'code-cgct.json',
  'code-securite-interieure.json',
  'Reglement_Parcs_Jardins.pdf',
  'Code_Sanitaire_Paris.pdf',
  'Chiens_categorie_regles.pdf',
  'Fiche doctrine - engins à vitesse augmentée - septembre 2025.pdf',
  'Permis moto : permis A1 ou permis 125 (moto légère.pdf',
  'Permis moto A2 (moto de puissance intermédiaire).pdf',
  'Permis moto A.pdf',
  'Permis B : voiture ou camionnette.pdf',
  'Assurance lorsqu\'on circule à vélo ou en trottinette électrique .pdf',
  'Comment prouver qu\'un véhicule est assuré .pdf',
  'Brevet de sécurité routière (BSR), catégorie AM du permis de conduire.pdf',
  'DPMP_velos_voles_fev_2024.pdf',
  'Fiche_Doctrine_DPMP_depots_irreguliers_version_finale_oct_2022.pdf',
  'note_et_fiche_EM_Tuk_tuks_21_dec_2022.pdf',
  'Fiche doctrine - Vente à la sauvette Vdef - mars 2022.pdf',
  'Fiche doctrine - Terrasses Vdef - juin 2022.pdf',
  'Fiche doctrine - Contrôle et verbalisation des nuisances sonores liées à un chantier Vdef - juin 2023.pdf',
  'Fiche doctrine - boites à clés sur le domaine public - avril 2025.pdf',
  "Fiche doctrine - Plaques d'immatriculation illisibles Vdef - mars 2025.pdf",
  'Fiche doctrine - Prise en charge personnes transgenres Vdef - juin 2022.pdf',
  'fiche doctrine - EDPM - juillet 2025.pdf',
  'Fiche doctrine - Contrôle et verbalisation des infractions sur un chantier hors nuisances sonores Vdef - mars 2023.pdf'
];

// Installation : mise en cache
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force l'activation immédiate
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Notifie tous les clients qu'une mise à jour est disponible
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'UPDATE_AVAILABLE',
            version: CACHE_NAME
          });
        });
      });
    })
  );
  return self.clients.claim();
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          // Clone la réponse car elle ne peut être consommée qu'une fois
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      })
  );
});

// Message pour forcer la mise à jour
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
