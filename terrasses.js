/*********************************************
 * LEXPARREF — MODULE TERRASSES (LOADER SEUL)
 * Étape 2 : chargement CSV, aucun affichage
 *********************************************/

(function () {
	'use strict';

	// Stockage mémoire
	let terrassesData = [];

	// Chargement CSV
	async function loadTerrassesCSV() {
		try {
			const res = await fetch('./terrasses.csv');
			if (!res.ok) throw new Error('terrasses.csv introuvable');

			const text = await res.text();
			terrassesData = parseTerrassesCSV(text);

			// Exposition contrôlée (lecture seule)
			window.terrassesData = terrassesData;
		} catch (e) {
			console.error('[LexParRef][Terrasses] Erreur chargement CSV', e);
			terrassesData = [];
			window.terrassesData = [];
		}
	}

	// Parser CSV simple (virgule)
	function parseTerrassesCSV(csvText) {
		const lines = csvText.replace(/\r/g, '').split('\n').filter(Boolean);
		if (lines.length < 2) return [];

		const headers = lines[0].split(',').map(h => h.trim());

		return lines.slice(1).map(line => {
			const values = line.split(',');
			const row = {};
			headers.forEach((h, i) => {
				row[h] = (values[i] || '').trim();
			});

			return {
				id: row.id || '',
				nom_enseigne: row.nom_enseigne || '',
				numero_voie: row.numero_voie || '',
				voie: row.voie || '',
				arrondissement: row.arrondissement || '',
				latitude: parseFloat(row.latitude),
				longitude: parseFloat(row.longitude)
			};
		});
	}

	// Lancement automatique
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', loadTerrassesCSV);
	} else {
		loadTerrassesCSV();
	}
})();