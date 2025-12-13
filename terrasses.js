/*********************************************
 * LEXPARREF — MODULE TERRASSES
 * Étape 2 : chargement CSV (sans affichage)
 * Étape 3 : utilitaire distance (Haversine)
 *********************************************/

(function () {
	'use strict';

	/* ================================
	   1. STOCKAGE MÉMOIRE
	   ================================ */
	let terrassesData = [];

	/* ================================
	   2. CHARGEMENT CSV
	   ================================ */
	async function loadTerrassesCSV() {
		try {
			const res = await fetch('./terrasses.csv');
			if (!res.ok) {
				throw new Error('terrasses.csv introuvable');
			}

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

	/* ================================
	   3. PARSER CSV (simple, robuste)
	   ================================ */
	function parseTerrassesCSV(csvText) {
		const lines = csvText
			.replace(/\r/g, '')
			.split('\n')
			.filter(Boolean);

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

	/* ================================
	   4. UTILITAIRE DISTANCE (HAVERSINE)
	   ================================ */
	function computeDistanceMeters(lat1, lon1, lat2, lon2) {
		const R = 6371000; // mètres
		const toRad = deg => deg * Math.PI / 180;

		const φ1 = toRad(lat1);
		const φ2 = toRad(lat2);
		const Δφ = toRad(lat2 - lat1);
		const Δλ = toRad(lon2 - lon1);

		const a =
			Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
			Math.cos(φ1) * Math.cos(φ2) *
			Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	}

	// Exposition volontaire et maîtrisée
	window.computeDistanceMeters = computeDistanceMeters;

	/* ================================
	   5. LANCEMENT AUTOMATIQUE
	   ================================ */
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', loadTerrassesCSV);
	} else {
		loadTerrassesCSV();
	}

})();