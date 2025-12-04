# 📚 LexParRef - Référence Juridique Police Municipale

<div align="center">

![Police Municipale DT Centre](police-logo.jpg)

**Application PWA de référence juridique pour la Police Municipale de Paris - Direction Territoriale Centre**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/christophe-dubois/lexparref)
[![PWA](https://img.shields.io/badge/PWA-ready-green.svg)](https://web.dev/progressive-web-apps/)
[![Offline](https://img.shields.io/badge/offline-capable-orange.svg)](https://developers.google.com/web/fundamentals/primers/service-workers)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)

[Installation](#-installation) • [Fonctionnalités](#-fonctionnalités) • [Utilisation](#-utilisation) • [Technologies](#-technologies)

</div>

---

## 📱 Description

**LexParRef** est une Progressive Web App (PWA) développée spécifiquement pour les agents de la Police Municipale de Paris - Direction Territoriale Centre. Elle offre un accès rapide et hors ligne à l'ensemble des références juridiques nécessaires sur le terrain.

### 🎯 Objectif

Fournir aux agents un outil professionnel, rapide et fiable pour consulter :
- Les codes NATINF
- Les articles de loi
- Les fiches doctrine
- Les documents réglementaires

**100% accessible hors ligne** pour garantir la disponibilité même sans connexion réseau.

---

## ✨ Fonctionnalités

### 🔍 Recherche Unifiée
- Recherche simultanée dans toutes les bases de données
- Système de mots-clés intelligent
- Filtrage par type (NATINF, Codes, Fiches, Documents)
- Résultats instantanés

### 📚 Base de Données Complète
- **17 008 codes NATINF** (juillet 2025)
- **16 977 articles de loi** répartis sur 6 codes :
  - Code Pénal
  - Code de la Route
  - Code de Procédure Pénale
  - Code de la Voirie Routière
  - Code Général des Collectivités Territoriales (CGCT)
  - Code de la Sécurité Intérieure (CSI)
- **11 fiches doctrine DPMP** :
  - Véhicules (EDPM, plaques, engins à vitesse augmentée)
  - Espaces publics (terrasses, dépôts irréguliers, boîtes à clés)
  - Chantiers (nuisances sonores, infractions générales)
  - Divers (vélos volés, vente à la sauvette, tuk-tuks, personnes transgenres)
- **11 documents réglementaires** :
  - Permis (moto, voiture, BSR)
  - Assurances véhicules
  - Règlement Parcs et Jardins de Paris
  - Code Sanitaire de Paris
  - Chiens de catégorie

### 🎨 Interface Moderne
- Design aux couleurs de la Police Municipale (bleu marine & or)
- Logo officiel DT Centre
- Navigation intuitive par catégories
- Sections repliables pour une meilleure lisibilité
- Responsive (mobile, tablette, desktop)

### 📱 PWA Features
- **Installation** : Ajout à l'écran d'accueil (iOS/Android)
- **Offline** : Fonctionne sans connexion Internet
- **Rapide** : Cache intelligent pour performances optimales
- **Léger** : Chargement instantané

### 🔐 Sécurité
- Pas de collecte de données personnelles
- Stockage local uniquement
- Pas de trackers

---

## 🚀 Installation

### Sur Mobile (iOS/Android)

#### iPhone / iPad
1. Ouvrir **Safari** et accéder à l'URL de l'application
2. Appuyer sur le bouton **Partager** 📤
3. Sélectionner **"Sur l'écran d'accueil"**
4. Confirmer → L'icône apparaît sur l'écran d'accueil

#### Android
1. Ouvrir **Chrome** et accéder à l'URL de l'application
2. Appuyer sur le menu **⋮** (3 points)
3. Sélectionner **"Installer l'application"** ou **"Ajouter à l'écran d'accueil"**
4. Confirmer → L'icône apparaît sur l'écran d'accueil

### Sur Desktop

#### Chrome / Edge / Brave
1. Ouvrir l'application dans le navigateur
2. Cliquer sur l'icône **+** dans la barre d'adresse
3. Ou **Menu → Installer LexParRef**

#### Safari (macOS)
1. Ajouter aux favoris ou utiliser en tant que web app

---

## 📖 Utilisation

### Recherche Rapide

1. **Saisir** un mot-clé dans la barre de recherche
   - Exemple : `stationnement`, `ivresse`, `L224-16`, `R417-10`

2. **Consulter** les résultats classés par catégorie :
   - 🔢 NATINF
   - 📕 Codes
   - 📋 Fiches Doctrine
   - 📄 Documents

3. **Cliquer** sur une catégorie pour afficher/masquer les résultats

4. **Développer** un article pour voir le détail complet

### Navigation

- **Sections repliables** : Cliquer sur l'en-tête pour ouvrir/fermer
- **Badges** : Indiquent le code d'origine de chaque article
- **Sources** : Liens vers Légifrance et sources officielles
- **PDFs** : Ouverture directe des documents

### Astuces

- 💡 **Recherche multiple** : `chien catégorie` (recherche avec plusieurs mots)
- 💡 **Code exact** : `L224-16` (trouve l'article précis)
- 💡 **Thématique** : `stationnement gênant` (tous les articles liés)

---

## 🛠 Technologies

### Frontend
- **HTML5** : Structure sémantique
- **CSS3** : Design moderne avec gradients et animations
- **JavaScript (Vanilla)** : Logique applicative, 0 dépendance

### PWA
- **Service Worker** : Cache et offline
- **Manifest.json** : Configuration PWA
- **Cache API** : Stockage local des ressources

### Data
- **JSON** : Codes et procédures structurés
- **CSV** : Base NATINF (17k entrées)
- **PDF** : Documents officiels

### Build & Deploy
- **Git** : Versioning
- **GitHub** : Hébergement du code
- **GitHub Pages** : Hébergement de l'application (à venir)

---

## 📊 Statistiques

- **48 fichiers** dans le projet
- **369 071 lignes** de données
- **Taille totale** : ~80 MB (dont ~70 MB de PDFs)
- **Taille cache** : Optimisée pour mobile
- **Performance** : Chargement < 2 secondes

---

## 🗺 Roadmap

Consultez [ROADMAP.md](ROADMAP.md) pour voir les fonctionnalités prévues :

### Version 1.1 (Semaine prochaine)
- 🌙 Mode sombre
- ⭐ Système de favoris
- 📋 Historique de recherche

### Version 1.2 (Dans 2 semaines)
- 🔐 Authentification utilisateurs
- 📊 Dashboard admin
- 🔄 Système de mise à jour automatique

### Version 2.0 (Dans 3 mois)
- 🔔 Notifications push
- 📱 Application mobile native
- 🤖 Assistant IA

---

## 👥 Équipe

**Développement** : Christophe Dubois - Police Municipale DT Centre  
**Contact** : christophe.dubois@paris.fr

**Pour** : Direction de la Prévention, de la Sécurité et de la Protection (DPSP)  
**Service** : Police Municipale - Direction Territoriale Centre

---

## 📄 License

© 2025 Ville de Paris - Police Municipale DT Centre  
Usage interne uniquement - Tous droits réservés

---

## 🙏 Remerciements

- **Légifrance** : Source des codes et textes législatifs
- **Service Public** : Documentation officielle
- **DPMP** : Fiches doctrine et ressources

---

## 📝 Notes de Version

### v1.0.0 - 4 décembre 2025
- ✅ Version initiale
- ✅ 17 008 codes NATINF
- ✅ 16 977 articles de loi
- ✅ 11 fiches doctrine
- ✅ 11 documents réglementaires
- ✅ Recherche unifiée
- ✅ Navigation par toggle
- ✅ Design Police Municipale
- ✅ PWA complète avec offline

---

<div align="center">

**Fait avec ❤️ pour la Police Municipale de Paris**

[⬆ Retour en haut](#-lexparref---référence-juridique-police-municipale)

</div>
