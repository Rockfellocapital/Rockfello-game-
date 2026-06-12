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

- **Sauvegarde automatique** dans le navigateur (`localStorage`, clé
  `rockfello_save_v1`) : la partie est restaurée au rechargement.
- Bouton **« Nouvelle partie »** (écran d'accueil) pour effacer la sauvegarde et
  repartir de zéro.
- La sauvegarde est **locale à l'appareil/navigateur** : elle ne se synchronise
  pas entre appareils (ça, c'est l'étape backend ci-dessous).

## À savoir

- Les **crédits** (◆) sont un **achat simulé** : aucun paiement réel. Ne pas le
  présenter comme un vrai paiement.

## Feuille de route (upgrades futurs)

État actuel = **v1** : jeu jouable, PWA installable, sauvegarde locale
(`localStorage`). Volontairement 100 % front-end, sans backend. Les étapes
ci-dessous sont l'évolution décidée, dans l'ordre — chacune est indépendante et
peut être faite plus tard sans refonte.

1. **Sauvegarde serveur (Supabase)** — table `saves` avec une ligne par joueur
   (`user_id`, `data jsonb`, `updated_at`). On garde le `localStorage` comme
   cache instantané et on synchronise vers Supabase en arrière-plan. Implique
   une **notion de compte** (Supabase Auth). But : la partie suit le joueur
   entre appareils et ne se perd plus.

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
| `src/main.jsx` | Point d'entrée React |
| `src/styles.css` | Reset minimal (le jeu gère son style en inline) |
| `vite.config.js` | Config Vite + manifeste PWA |
| `scripts/gen-icons.mjs` | Génère les icônes PNG depuis le logo SVG |
