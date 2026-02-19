# Aide Chrome Web Store — Publication de TON extension

Ce document te guide, onglet par onglet, dans le **Chrome Web Store Developer Dashboard** pour publier ton extension.

---

## 0) Avant de commencer (check rapide)

### 0.1 Ce que tu dois mettre dans le ZIP (obligatoire)
Dans ton fichier `.zip`, **à la racine**, tu dois voir directement :

- `manifest.json`
- `background.js`
- `popup.html`
- `popup.js`
- `icons/`
- `assets/` (ex: `assets/bglive.png`)

À éviter dans ton ZIP (recommandé) :
- `.git/`, `.idea/`
- fichiers de dev inutiles (`node_modules`, scripts, notes, etc.)

### 0.2 Vérification rapide
Avant d’uploader :
- Ton extension fonctionne en local (popup, badge LIVE/OFF, notification OFF→LIVE).
- Ton `host_permissions` est strict :
    - Exemple : `https://TON-WORKER.workers.dev/*`
    - Évite : `https://*.workers.dev/*` (trop large, risque de refus)
- Tu as bien tes icônes 16/48/128 dans `icons/`.

---

## 1) Onglet **Compte**
Objectif : débloquer la soumission à l'examen.

Tu dois :
- renseigner une **adresse e-mail de contact**
- **vérifier** cette adresse (tu reçois un mail et tu confirmes)

Sans e-mail vérifié, “Envoyer pour examen” peut rester bloqué.

---

## 2) Onglet **Package**
Objectif : uploader ton extension.

Tu dois :
- uploader ton fichier **.zip** (recommandé)
- vérifier que le dashboard indique que le package est validé

Important :
- Si tu modifies ton code, tu dois :
    1) incrémenter la version dans `manifest.json`
    2) refaire le `.zip`
    3) re-uploader le nouveau `.zip`

---

## 3) Onglet **Fiche (Play Store / Store Listing)**
Objectif : remplir la page publique de ton extension.

### 3.1 Informations principales
Tu dois remplir :
- **Nom** : le nom public de ton extension
- **Langue** : Français (si ton extension est en français)
- **Catégorie** : Divertissement ou Outils (choisis ce qui correspond le mieux)
- **Résumé court** (si demandé)  
  Exemple :
  > Extension qui notifie lorsque Slingo__ passe en live sur Twitch.
- **Description longue** : colle ta description “pro” (sans emojis)

### 3.2 Les images à fournir (très important)
Le dashboard te demande :
- **Captures d’écran** (obligatoire)
- parfois **Petite image promotionnelle**
- parfois **Bannière / image en haut de page**

#### A) Captures d’écran (Screenshots) — ce que tu dois prendre en photo
Tu dois uploader des images montrant **l’extension en action**.
Idées de captures recommandées (2 à 5 images) :
1) Le popup en état **OFF** (hors live)
2) Le popup en état **LIVE** (avec le titre du live affiché)
3) Une notification système “X est en LIVE” (si possible)
4) Le badge “LIVE” sur l’icône d’extension (si possible)
5) La page Twitch ouverte après clic sur “Rejoindre le live” (optionnel)

Formats acceptés : **PNG ou JPEG** ( demander : **24 bits, sans alpha / sans transparence**).  
Le dashboard indique les tailles acceptées : respecte exactement ce qu’il demande.

Ta vie est plus simple si tu fais :
- des captures au format **1280×800** (format très courant et accepté)
- et si le dashboard demande du **640×400**, tu fournis aussi ce format.

#### B) Petite image promotionnelle (si demandée)
C’est une image “marketing” (pas une capture brute).
Souvent demandé : **440×280** (ça peut varier selon le dashboard).

Tu peux mettre :
- ton logo
- le nom de ton extension
- une phrase courte (facultatif, lisible)

Format : PNG/JPEG (souvent 24 bits, sans alpha).

#### C) Image promotionnelle en haut de page / bannière (si demandée)
C’est un bandeau “header”.
Souvent demandé : **1400×560** (ça peut varier selon le dashboard).

Tu peux mettre :
- ton logo + le nom de l’extension
- un visuel de fond (ex: ton background)
- éventuellement une petite capture du popup (facultatif)

Si ce champ est **optionnel** dans ton interface, tu peux parfois le laisser vide.
Si le dashboard le marque comme requis, tu dois uploader un bandeau respectant le format demandé.

### 3.3 Liens (si champs présents)
Tu peux remplir :
- **Site web** : ton Twitch ou ton GitHub
- **Support** : ton GitHub Issues (recommandé)
- **Politique de confidentialité** : URL directe vers ton fichier `privacy-policy.md`

---

## 4) Onglet **Confidentialité**
Objectif : déclarer clairement ce que fait l’extension et comment elle utilise les données.

### 4.1 Objectif unique (Single purpose) — texte à coller
> Notifier l’utilisateur lorsque la chaîne Twitch configurée passe en direct, afficher l’état LIVE/OFF dans le popup et permettre d’ouvrir la chaîne Twitch en un clic.

### 4.2 Justification des autorisations — textes à coller

**Justification de “storage”**
> L’autorisation “storage” est utilisée pour enregistrer localement l’état du live (en ligne/hors ligne), le titre, l’URL de la chaîne et l’horodatage du dernier contrôle afin d’afficher ces informations dans le popup et d’éviter les notifications répétées. Aucune donnée personnelle n’est collectée.

**Justification de “alarms”**
> L’autorisation “alarms” est utilisée pour planifier des vérifications périodiques en arrière-plan afin de détecter automatiquement le passage hors ligne → en direct.

**Justification de “notifications”**
> L’autorisation “notifications” est utilisée pour afficher une notification système uniquement lorsque la chaîne passe de hors-ligne à en direct.

**Justification de “host permissions” (ton Worker Cloudflare)**
> L’extension effectue une requête HTTP GET vers un endpoint Cloudflare Worker dédié afin de récupérer le statut LIVE/OFF au format JSON. L’extension n’accède à aucun autre site, ne lit pas le contenu des pages visitées et n’injecte aucun script.

### 4.3 “Code distant” (Remote code)
Tu dois sélectionner : **Non**  
Tu n’exécutes pas de code JavaScript téléchargé depuis Internet.  
Tu fais uniquement une requête réseau (`fetch`) pour obtenir un JSON.

### 4.4 Données collectées / vendues / partagées
Tu dois indiquer :
- **Aucune donnée personnelle collectée**
- **Pas de vente de données**
- **Pas de partage à des fins publicitaires**

Coche les certifications (si le dashboard te les propose), du type :
- Je ne vends ni ne transfère…
- Je n’utilise pas à des fins sans rapport…
- Je n’utilise pas pour solvabilité/prêt…

### 4.5 URL des règles de confidentialité (obligatoire)
Tu dois fournir une URL publique vers ta politique de confidentialité.
Le plus sûr est un lien direct vers ton fichier GitHub :

Exemple :
- `https://github.com/TON_PSEUDO/TON_REPO/blob/main/privacy-policy.md`

Important :
- évite de mettre seulement la racine du repo si la politique n’est pas visible immédiatement
- le reviewer doit accéder facilement au texte

---

## 5) Onglet **Distribution**
Objectif : choisir qui peut installer ton extension.

Tu dois choisir :
- **Prix** : Sans frais (gratuit)
- **Visibilité** :
    - **Public** : tout le monde peut la trouver et l’installer
    - **Non répertoriée** : installable via lien mais pas visible en recherche (pratique pour test)
- **Pays / Régions** :
    - France uniquement si tu veux cibler FR
    - Toutes les régions si tu veux ouvrir plus large

Recommandation :
- Pour tester avant publication : “Non répertoriée”
- Pour grand public : “Public”

---

## 6) Onglet **Instructions de test** (si présent)
Objectif : aider le reviewer à tester rapidement.

Texte simple à coller :
> Installer l’extension, ouvrir le popup pour afficher l’état LIVE/OFF. Lorsque la chaîne Twitch configurée passe en live, l’extension affiche le badge LIVE et envoie une notification (transition OFF→LIVE). Le bouton “Rejoindre le live” ouvre la page Twitch.

---

## 7) Dernière étape : “Envoyer pour examen”
Pour activer le bouton, tu dois :
1) enregistrer toutes les sections (bouton “Enregistrer le brouillon”)
2) vérifier qu’il ne reste aucun champ requis en rouge
3) vérifier que ton e-mail (onglet Compte) est bien validé
4) retourner sur la page principale et cliquer **“Envoyer pour examen”**

---

## 8) Problèmes fréquents
- **Bouton “Envoyer pour examen” grisé**
    - e-mail pas vérifié
    - section Confidentialité incomplète
    - manque une capture d’écran

- **Refus pour permissions trop larges**
    - tu dois limiter `host_permissions` à ton worker exact :
      `https://TON-WORKER.workers.dev/*`

- **Refus “remote code”**
    - tu dois répondre “Non” si tu ne charges pas de JS externe à exécuter

---

## 9) Rappel pour rendre le projet modulable (pour un autre streamer)
Si tu veux qu’un autre streamer réutilise ton projet proprement :
- tu dois lui expliquer qu’il doit créer son **propre** Worker Cloudflare
- il doit mettre **ses propres** secrets Twitch dans Cloudflare
- il doit modifier la config de l’extension (login Twitch, nom, URL, images)
- il doit publier **son propre** package sur le Store avec sa policy

---
