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
	const text = csvText.replace(/\r/g, '').trim();
	if (!text) return [];

	const lines = text.split('\n');
	if (lines.length < 2) return [];

	// Détection du séparateur (CSV français = ;)
	const firstLine = lines[0];
	const delimiter = firstLine.includes(';') ? ';' : ',';

	function parseLine(line) {
		const result = [];
		let current = '';
		let inQuotes = false;

		for (let i = 0; i < line.length; i++) {
			const char = line[i];

			if (char === '"') {
				inQuotes = !inQuotes;
				continue;
			}

			if (char === delimiter && !inQuotes) {
				result.push(current);
				current = '';
			} else {
				current += char;
			}
		}

		result.push(current);
		return result.map(v => v.trim());
	}

	const headers = parseLine(lines[0]);

	return lines.slice(1).map(line => {
		const values = parseLine(line);
		const row = {};

		headers.forEach((h, i) => {
			row[h] = values[i] ?? '';
		});

		return {
			id: row.id || row.ID || '',
			nom_enseigne: row.nom_enseigne || row.nom || row['Nom de l\'enseigne'] || '',
			numero_voie: row.numero_voie || row['Numéro'] || '',
			voie: row.voie || row['Voie'] || '',
			arrondissement: row.arrondissement || row['Arrondissement'] || '',
			geo_point_2d: row.geo_point_2d || row['geo_point_2d'] || row['Geo Point'] || row['geo_point'] || '',
			latitude: parseFloat(String(row.latitude || '').replace(',', '.')),
			longitude: parseFloat(String(row.longitude || '').replace(',', '.'))
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
	   5. NORMALISATION COORDONNÉES
	   ================================ */
	function toFloat(value) {
		if (value === null || value === undefined) return NaN;
		if (typeof value === 'number') return value;
		const s = String(value).trim();
		if (!s) return NaN;
		// accepte virgule décimale
		const normalized = s.replace(',', '.');
		const n = parseFloat(normalized);
		return Number.isFinite(n) ? n : NaN;
	}

	function extractLatLonFromGeoPoint(value) {
		// Supporte: "48.85523,2.35741" | "[48.85523, 2.35741]" | "48.85523 2.35741"
		if (value === null || value === undefined) return { lat: NaN, lon: NaN };
		const s = String(value);
		const matches = s.match(/-?\d+(?:[\.,]\d+)?/g);
		if (!matches || matches.length < 2) return { lat: NaN, lon: NaN };
		const lat = toFloat(matches[0]);
		const lon = toFloat(matches[1]);
		return { lat, lon };
	}

	/* ================================
	   6. FILTRAGE DES TERRASSES À PROXIMITÉ
	   ================================ */
	function getTerrassesNearby(lat, lon, radiusMeters = 20) {
		const base = Array.isArray(terrassesData) ? terrassesData : [];
		const lat0 = toFloat(lat);
		const lon0 = toFloat(lon);
		if (!Number.isFinite(lat0) || !Number.isFinite(lon0)) return [];

		const results = [];

		for (const t of base) {
			// Certains CSV n'ont pas latitude/longitude séparées -> fallback sur geo_point_2d
			let tLat = toFloat(t.latitude);
			let tLon = toFloat(t.longitude);

			if (!Number.isFinite(tLat) || !Number.isFinite(tLon)) {
				const gp = t.geo_point_2d || t.geo_point2d || t.geo_point || t.geo || '';
				const parsed = extractLatLonFromGeoPoint(gp);
				tLat = parsed.lat;
				tLon = parsed.lon;
			}

			if (!Number.isFinite(tLat) || !Number.isFinite(tLon)) continue;

			const d = computeDistanceMeters(lat0, lon0, tLat, tLon);
			if (d <= radiusMeters) {
				results.push({
					...t,
					latitude: tLat,
					longitude: tLon,
					distanceMeters: Math.round(d)
				});
			}
		}

		results.sort((a, b) => a.distanceMeters - b.distanceMeters);
		return results;
	}

	// Exposition contrôlée
	window.getTerrassesNearby = getTerrassesNearby;

	/* ================================
	   5. LANCEMENT AUTOMATIQUE
	   ================================ */
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', loadTerrassesCSV);
	} else {
		loadTerrassesCSV();
	}

})();