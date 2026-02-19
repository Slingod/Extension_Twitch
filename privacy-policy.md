# Politique de confidentialité — Live Notifier (Modulable)

**Date d’entrée en vigueur :** 19/02/2026

Live Notifier (Modulable) est une extension de navigateur dont l’unique objectif est de notifier l’utilisateur lorsqu’un streamer Twitch configuré passe en direct.

---

## 1) Objectif unique

L’extension vérifie si la chaîne Twitch configurée est en live et :
- affiche un badge d’état (LIVE / OFF) sur l’icône de l’extension,
- affiche l’état dans la fenêtre (popup),
- envoie une notification uniquement lors du passage de **hors-ligne** à **en direct**.

---

## 2) Données collectées

**Aucune donnée personnelle n’est collectée.**  
L’extension ne crée pas de compte utilisateur, ne demande pas de connexion et ne collecte aucune information permettant d’identifier l’utilisateur (nom, e-mail, adresse, téléphone, etc.).

---

## 3) Stockage local (stockage du navigateur)

L’extension enregistre uniquement des informations techniques nécessaires à son fonctionnement, dans le stockage local du navigateur :

- état en ligne/hors ligne (`isLive`)
- titre du stream (`title`)
- jeu/catégorie si disponible (`game`)
- date/heure de début si disponible (`startedAt`)
- URL de la chaîne (`liveUrl`)
- horodatage du dernier contrôle (`lastCheckedAt`)

Ces informations sont stockées **localement** sur l’appareil de l’utilisateur et servent uniquement à :
- éviter les notifications répétées,
- mettre à jour l’interface du popup,
- afficher l’état correct.

---

## 4) Requêtes réseau

Pour déterminer si le streamer est en direct, l’extension appelle un endpoint dédié via **Cloudflare Worker**.

- Le Worker interroge ensuite l’**API Twitch** côté serveur avec des identifiants stockés de manière sécurisée sur le serveur.
- L’extension reçoit une réponse JSON minimale indiquant l’état du live et quelques informations basiques (titre, jeu, heure de début).

L’extension n’envoie **aucune donnée personnelle** vers cet endpoint.

---

## 5) Partage des données

- Aucune donnée n’est vendue.
- Aucune donnée n’est louée.
- Aucune donnée n’est partagée avec des tiers à des fins publicitaires, marketing ou de profilage.

---

## 6) Services tiers

Cette extension s’appuie sur :
- **Cloudflare Workers** (endpoint serveur pour obtenir l’état du live)
- **API Twitch** (interrogée par l’endpoint serveur)

---

## 7) Sécurité

Les identifiants d’accès à l’API Twitch (client secret, etc.) sont stockés côté serveur (Cloudflare) et ne sont pas intégrés à l’extension.  
Seules des informations de configuration non sensibles sont présentes dans le package.

---

## 8) Contact

Pour toute question concernant cette politique de confidentialité, veuillez utiliser l’adresse e-mail de contact indiquée sur la fiche Chrome Web Store de l’extension.

---




# Privacy Policy — Live Notifier (Modulable) Version in ENGLISH

**Effective date:** 2026-02-19

Live Notifier (Modulable) is a browser extension whose only purpose is to notify the user when a specific Twitch streamer goes live.

---

## 1) Purpose (Single Purpose)

The extension checks whether the configured Twitch channel is live and:
- shows a LIVE/OFF status badge on the extension icon,
- displays the current status in the popup,
- sends a notification only when the streamer transitions from OFFLINE to LIVE.

---

## 2) Data Collection

**No personal data is collected.**  
The extension does not create user accounts, does not request sign-in, and does not collect identifying information (name, email, address, phone number, etc.).

---

## 3) Local Storage (Browser Storage)

The extension stores only the technical information required for the feature to work properly, using the browser’s local storage:

- live/offline state (`isLive`)
- stream title (`title`)
- game/category name when available (`game`)
- stream start time when available (`startedAt`)
- channel URL (`liveUrl`)
- last check timestamp (`lastCheckedAt`)

This data is stored locally on the user’s device and is used only to:
- avoid repeating notifications,
- update the popup UI,
- display the correct state.

---

## 4) Network Requests

To determine whether the streamer is live, the extension sends a request to a dedicated **Cloudflare Worker** endpoint.

- The Worker queries the **Twitch API** server-side using credentials stored securely on the server.
- The extension receives a minimal JSON response describing the live status and basic stream metadata (title, game, started_at).

The extension does not send personal user data to the endpoint.

---

## 5) Data Sharing

- No data is sold.
- No data is rented.
- No data is shared with third parties for advertising, marketing, or profiling.

---

## 6) Third-Party Services

This extension relies on:
- **Cloudflare Workers** (as a server endpoint to fetch the live status)
- **Twitch API** (queried by the server endpoint)

---

## 7) Security

Twitch API credentials are stored on the server side (Cloudflare) and are not embedded in the extension.  
Only non-sensitive configuration information is present in the extension package.

---

## 8) Contact

For any questions or requests regarding this privacy policy, please use the contact email address listed on the Chrome Web Store product page.

---
