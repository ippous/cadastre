# Cadastre Web — Élevage de Brot

Application web responsive pour gérer des projets composés de parcelles cadastrales, les visualiser et cumuler leurs surfaces.

**Réalisé par l'Élevage de Brot** — https://www.elevagedebrot.com

## Version 0.1.0
Prototype React, TypeScript, Vite et MapLibre GL JS. Import manuel GeoJSON, carte OSM, sélection de parcelles, surfaces estimées et projets sauvegardés localement dans le navigateur.

## Démarrer

```bash
npm install
npm run dev
```

## Déployer sur Vercel
Framework Vite ; commande `npm run build` ; dossier `dist`. Cible : `cadastre.jaume-eric.com` après connexion Vercel et configuration DNS Hostinger.

## Documentation
Voir `docs/ARCHITECTURE.md`, `docs/FONCTIONNALITES.md`, `docs/IMPORT_CADASTRE.md`, `docs/DEPLOIEMENT.md` et les autres fichiers de `docs/`.

## Limites
Cette version ne contient pas encore le backend Supabase, l'authentification ni les imports complets par département. Les surfaces calculées depuis GeoJSON sont indicatives et ne remplacent pas une contenance cadastrale officielle.
