# Live Notifier — Template “1 streamer = 1 extension publique” (Twitch + Cloudflare + Chrome Web Store)

Objectif :
- **Tes viewers** installent **ton extension** (Chrome/Brave) → badge **LIVE/OFF** + **notification** quand tu passes live.
- **Un autre streamer** peut **reprendre ce projet**, changer **ses propres paramètres** (pseudo, images, Worker, secrets Twitch), puis **publier sa propre extension**.
- **Sécurité** : chaque streamer garde **ses secrets** (Client Secret) chez lui (Cloudflare), personne d’autre les voit.

✅ Architecture recommandée (publique & sûre) :  
**Extension (publique) → Cloudflare Worker (privé, secrets) → Twitch API**

➡️ Le **Client Secret** ne doit **JAMAIS** être dans l’extension (sinon tout le monde peut le récupérer).

---

## Contenu du projet (fichiers)
- `manifest.json`
- `background.js` (service worker)
- `popup.html` + `popup.js`
- `config.json` ✅ (le fichier “à modifier” par chaque streamer)
- `icons/` (16/48/128)
- `assets/` (backgrounds / images)

> Conseil : pour rendre le projet simple à “rebrander”, on centralise tout dans **config.json**.

---

## Ce que doit faire un streamer qui veut sa propre extension

### Étape A — Créer une app Twitch (Client ID + Client Secret)
1) Va sur : https://dev.twitch.tv/console
2) **Applications** → **Enregistrer votre application**
3) Remplis :
- **Nom** : ex `Mon Extension Live`
- **OAuth Redirect URL** : `http://localhost` ✅ (OK même si l’extension est publique)
- **Catégorie** : `Browser Extension` (ou `Other`)
- **Type de client** : **Confidentiel**
4) Clique **Créer**
5) Récupère :
- **Client ID**
- **Client Secret**

⚠️ Important : le **Client Secret** ne va jamais dans l’extension.

---

### Étape B — Déployer TON Cloudflare Worker (proxy Twitch)
Le Worker sert à appeler Twitch **avec ton secret** et renvoyer un JSON simple à l’extension.

#### B1) Créer le Worker
1) Cloudflare : https://dash.cloudflare.com/
2) Menu : **Compute → Workers & Pages**
3) **Create** → **Start with Hello World**
4) Donne un nom (ex: `mon-live-proxy`)
5) **Deploy**
6) Ensuite **Edit code** (ou **Quick edit**) et colle le code Worker du projet.

#### B2) Ajouter tes secrets dans Cloudflare
Dans ton Worker :
1) Onglet **Settings**
2) Section **Variables and Secrets**
3) Ajoute **Secrets** (pas des “Variables” en clair) :
- `TWITCH_CLIENT_ID` = ton Client ID
- `TWITCH_CLIENT_SECRET` = ton Client Secret

#### B3) Option anti-abus (recommandé) : PUBLIC_KEY
Toujours dans **Settings → Variables and Secrets** :
- Ajoute un **Secret** :
    - `PUBLIC_KEY` = une clé au choix (ex: `monext_7f3a9c...`)

Cette clé sera incluse dans les requêtes de l’extension :
`...?login=tonpseudo&key=TA_CLE`

➡️ Ça évite que n’importe qui spam ton Worker facilement.

#### B4) Tester ton Worker
Dans ton navigateur, teste :
```
https://TON_WORKER.workers.dev/?login=tonpseudo&key=TA_CLE
```
Tu dois obtenir :
- OFF :
```json
{"results":{"tonpseudo":{"isLive":false,...}}}
```
- LIVE :
```json
{"results":{"tonpseudo":{"isLive":true,"title":"...","game":"...","liveUrl":"https://www.twitch.tv/tonpseudo"}}}
```

---

### Étape C — Personnaliser l’extension (UNE SEULE FOIS) via `config.json`
Chaque streamer doit éditer **config.json** (pas besoin de toucher au code).

Exemple `config.json` :
```json
{
  "checkEveryMinutes": 1,
  "worker": {
    "baseUrl": "https://TON_WORKER.workers.dev/",
    "publicKey": "TA_CLE_PUBLIC_KEY"
  },
  "streamer": {
    "id": "tonpseudo",
    "login": "tonpseudo",
    "displayName": "TonPseudo",
    "liveUrl": "https://www.twitch.tv/tonpseudo",
    "iconUrl": "icons/icon128.png"
  },
  "popup": {
    "bgOffline": "assets/bg_off.png",
    "bgLive": "assets/bg_live.png"
  }
}
```

**À modifier obligatoirement :**
- `worker.baseUrl` → URL de TON Worker Cloudflare
- `worker.publicKey` → la même clé que dans Cloudflare (`PUBLIC_KEY`)
- `streamer.login` → ton login Twitch
- `streamer.displayName` → le texte affiché
- `popup.bgOffline` / `popup.bgLive` → tes images (facultatif)

---

### Étape D — Changer les images (branding)
- Icônes :
    - `icons/icon16.png`
    - `icons/icon48.png`
    - `icons/icon128.png`
- Background popup :
    - `assets/bg_off.png`
    - `assets/bg_live.png`

Tu peux utiliser n’importe quel PNG/JPG (même taille conseillée que ton design).

---

### Étape E — Personnaliser `manifest.json` (nom, version, description)
Avant publication :
- `"name"` : ex `TonPseudo Live`
- `"description"` : ex `Notification quand TonPseudo est en live`
- `"version"` : incrémente à chaque update (ex: `0.3.0`)

---

## Tester l’extension en local (avant publication)
1) Brave : `brave://extensions` (Chrome : `chrome://extensions`)
2) Active **Mode développeur**
3) **Charger l’extension non empaquetée**
4) Sélectionne le dossier du projet (celui avec `manifest.json`)
5) Clique l’icône de l’extension :
- badge **OFF** si tu n’es pas live
- badge **LIVE** si tu es live
- popup affiche l’état
- notification sur transition OFF → LIVE

📌 Après chaque modification de fichier : sur la page extensions → **Recharger**.

---

## Publier l’extension (téléchargeable par tout le monde)

### Option 1 — Chrome Web Store (recommandé)
1) Crée un compte développeur Chrome Web Store (il y a des frais uniques côté Google)
2) Prépare un **ZIP** contenant **le contenu** du dossier (pas le dossier parent) :
- `manifest.json`
- `background.js`
- `popup.html`
- `popup.js`
- `config.json`
- `icons/`
- `assets/`

3) Sur le dashboard développeur :
- Upload le ZIP
- Ajoute :
    - 1–5 screenshots (popup, badge LIVE)
    - icônes
    - description courte + longue
- Publie

✅ Avantages : install 1 clic + mises à jour automatiques.

---

## Privacy Policy (souvent demandée)
Tu peux publier ce texte sur un lien public (GitHub Pages / Notion / Google Sites).

### Privacy Policy (FR)
- Cette extension ne collecte aucune donnée personnelle.
- Elle vérifie uniquement l’état LIVE/OFF via un endpoint Cloudflare Worker configuré par le streamer.
- Le Worker interroge l’API Twitch pour récupérer le statut de stream.
- Aucun tracking, aucune publicité, aucune revente de données.
- L’extension stocke uniquement un état technique local (LIVE/OFF + date du dernier check) pour afficher le statut et éviter les notifications doublons.

### Privacy Policy (EN)
- This extension does not collect personal data.
- It only checks live status via a streamer-configured Cloudflare Worker endpoint.
- The Worker queries Twitch API to retrieve stream status.
- No tracking, no ads, no data selling.
- The extension stores only local technical state (LIVE/OFF + last check timestamp) to display status and avoid duplicate notifications.

---

## FAQ

### “Pourquoi `http://localhost` dans OAuth Redirect URL ?”
Parce que dans cette architecture, l’extension **ne fait pas** de login utilisateur OAuth.  
Le Worker utilise un **App Token** côté serveur. Donc l’URL de redirection n’est pas utilisée ici.  
Tu peux laisser `http://localhost` sans problème, même en public.

### “Pourquoi chaque streamer doit déployer son Worker ?”
Parce que chaque streamer a ses **secrets Twitch** :
- Client ID
- Client Secret  
  On ne veut pas qu’ils soient partagés, donc chaque streamer garde ses secrets chez lui.

### “Est-ce que ça scale si j’ai beaucoup de viewers ?”
Oui. L’extension appelle ton Worker périodiquement (ex: 1 minute).  
Tu peux ajuster la fréquence dans `config.json` et/ou mettre des protections supplémentaires côté Worker si besoin.

---

## Checklist rapide (pour un streamer)
- [ ] Créer l’app Twitch (Client ID + Secret)
- [ ] Déployer le Worker Cloudflare
- [ ] Ajouter secrets : `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET`
- [ ] Ajouter secret : `PUBLIC_KEY`
- [ ] Modifier `config.json` (baseUrl, publicKey, login, displayName)
- [ ] Remplacer icônes + backgrounds
- [ ] Modifier `manifest.json` (name/description/version)
- [ ] Tester en local (`brave://extensions`)
- [ ] Zipper & publier sur Chrome Web Store

---

Bon build 🔥
