# Rockfello — Bâtis ton empire

Jeu de _tycoon_ immobilier façon **OS de téléphone** (monochrome, arrondi).
Tu pars de zéro, tu déniches des dossiers en difficulté (saisies, faillites,
préavis d'exercice), tu **négocies au slider** avec le courtier, tu montes ton
financement, tu gères le dossier (travaux, assurance, vérif diligente), puis tu
**flippes ou tu closes**. Tu débloques des apps (RockMail, Dossiers, Carte du
Québec, QuickRock, ChatRock, InstaRock) avec tes gains.

Jouable au navigateur et **installable comme une app** (PWA).

- **Stack** : Vite + React 18 + `vite-plugin-pwa`
- **Mobile-first**, plein écran, installable (« Ajouter à l'écran d'accueil »)
- **Aucune dépendance réseau** au runtime (police Google chargée si dispo, sinon
  police système en repli)

## Démarrer en local

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build de production → dist/
npm run preview    # sert le build localement
```

## Déployer sur Vercel

**Interface web** : pousse ce dossier sur GitHub, puis sur
[vercel.com](https://vercel.com) → _Add New… → Project_ → importe le repo.
Vercel détecte Vite tout seul (build `npm run build`, sortie `dist`). _Deploy_.

**CLI** :

```bash
npx vercel          # questions, accepte les défauts
npx vercel --prod   # met en production, donne l'URL finale
```

**Netlify (alternative)** : `npm run build` puis glisse `dist/` sur
[app.netlify.com/drop](https://app.netlify.com/drop).

## Icônes

Les PNG PWA monochromes sont déjà dans `public/`. Pour les régénérer à partir du
logo SVG :

```bash
npm i -D sharp
npm run icons
```

## Sauvegarde

- **Sauvegarde automatique locale** (`localStorage`, clé `rockfello_save_v1`) :
  la partie est restaurée au rechargement. Toujours active, hors ligne incluse.
- Bouton **« Nouvelle partie »** (écran d'accueil) pour effacer la sauvegarde.
- **Sauvegarde cloud (optionnelle)** : si Supabase est configuré (voir ci-dessous),
  un encart « ☁ Sauvegarde cloud » apparaît sur l'accueil. Connecté, la partie
  se synchronise entre appareils. **Sans configuration, rien ne change** — le jeu
  reste 100 % local.

## Sauvegarde cloud (Supabase) — activation

Tout le code est déjà en place. Pour l'allumer, 3 actions côté Supabase + Vercel :

1. **Créer un projet** sur [supabase.com](https://supabase.com) (gratuit).
2. **Créer la table** : Dashboard → _SQL Editor_ → coller le contenu de
   [`supabase/schema.sql`](supabase/schema.sql) → _Run_. (Table `saves` + RLS :
   chaque joueur ne voit que sa ligne.)
3. **Auth e-mail + mot de passe** : _Authentication → Providers → Email_ est
   activé par défaut. Le joueur **crée un compte** (e-mail + mot de passe) puis
   **se connecte** depuis l'encart « ☁ Sauvegarde cloud » de l'accueil.
   - **Pour des tests sans friction** : _Authentication → Providers → Email_ →
     désactiver **« Confirm email »**. Le compte est actif immédiatement, sans
     courriel de confirmation. (Si activé, le joueur doit cliquer un lien reçu
     par courriel avant de pouvoir se connecter.)
4. **Clés** : _Project Settings → API_ → copier `Project URL` et la clé `anon`.
   - **En local** : `cp .env.example .env.local` puis remplir les deux valeurs.
   - **Sur Vercel** : _Settings → Environment Variables_ → ajouter
     `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`, puis redéployer.

> Reset de mot de passe oublié : possible plus tard (Supabase envoie un lien de
> réinitialisation par courriel) — pas encore branché dans l'UI du jeu.

## À savoir

- Les **crédits** (◆) sont un **achat simulé** : aucun paiement réel. Ne pas le
  présenter comme un vrai paiement.

## Feuille de route (upgrades futurs)

État actuel = **v1** : jeu jouable, PWA installable, sauvegarde locale
(`localStorage`). Volontairement 100 % front-end, sans backend. Les étapes
ci-dessous sont l'évolution décidée, dans l'ordre — chacune est indépendante et
peut être faite plus tard sans refonte.

1. ✅ **Sauvegarde serveur (Supabase)** — _implémenté, à activer_ (voir
   « Sauvegarde cloud » ci-dessus). `localStorage` comme cache instantané +
   sync Supabase en arrière-plan, compte e-mail + mot de passe. La partie suit le
   joueur entre appareils.

2. **ChatRock via Claude** — remplacer le stub `dealAdvice()` par de vrais
   conseils générés par Claude (`claude-haiku-4-5` pour des conseils courts/peu
   coûteux, `claude-opus-4-8` pour le meilleur raisonnement).
   ⚠️ **Nécessite une fonction serverless** (Vercel Functions ou Supabase Edge
   Functions) qui détient la clé API — **ne jamais appeler Claude depuis le
   navigateur** (la clé serait exposée). C'est l'étape où le projet cesse d'être
   purement statique. Idée : 1 conseil = 1 crédit ◆ = 1 appel (garde-fou de coût).

3. **Contenus éditables (Airtable)** — villes, types de dossiers, textes
   d'événements, lus **au build** ou via une fonction serverless mise en cache
   (pas à chaque partie — quotas). L'état du joueur reste dans Supabase.

4. **ChatRock + RAG (optionnel)** — seulement si on a une vraie base de
   connaissances à indexer : embeddings **Voyage AI** → **Pinecone** → Claude.
   À ne pas faire tant qu'il n'y a pas de doc à indexer.

## Structure

| Fichier | Rôle |
| --- | --- |
| `src/RockfelloGame.jsx` | Le jeu complet (OS téléphone, apps, boucle de deals) |
| `src/supabaseClient.js` | Client Supabase (inactif sans clés) |
| `src/cloudSave.js` | Lecture/écriture de la sauvegarde cloud |
| `supabase/schema.sql` | Table `saves` + sécurité (à exécuter dans Supabase) |
| `.env.example` | Modèle des variables Supabase |
| `src/main.jsx` | Point d'entrée React |
| `src/styles.css` | Reset minimal (le jeu gère son style en inline) |
| `vite.config.js` | Config Vite + manifeste PWA |
| `scripts/gen-icons.mjs` | Génère les icônes PNG depuis le logo SVG |
