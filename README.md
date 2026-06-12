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

## À savoir (test de boucle)

- **Pas de sauvegarde** : chaque rechargement repart à zéro — voulu pour tester
  la boucle de jeu.
- Les **crédits** (◆) sont un **achat simulé** : aucun paiement réel. Ne pas le
  présenter comme un vrai paiement.

## Prochaines vraies étapes

1. **Persistance** — sauvegarder la partie (localStorage, puis backend).
2. **Données réelles** — brancher Airtable pour les contenus / la progression.

## Structure

| Fichier | Rôle |
| --- | --- |
| `src/RockfelloGame.jsx` | Le jeu complet (OS téléphone, apps, boucle de deals) |
| `src/main.jsx` | Point d'entrée React |
| `src/styles.css` | Reset minimal (le jeu gère son style en inline) |
| `vite.config.js` | Config Vite + manifeste PWA |
| `scripts/gen-icons.mjs` | Génère les icônes PNG depuis le logo SVG |
