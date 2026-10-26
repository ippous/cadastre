# Cadastre Web — Élevage de Brot

Application web responsive de gestion de projets de parcelles cadastrales.

**Réalisé par l'Élevage de Brot** — https://www.elevagedebrot.com

## Démarrage

```bash
npm install
npm run dev
```

Pour compiler : `npm run build`. Déploiement prévu sur Vercel : branche `main`, framework Vite, répertoire de sortie `dist`.

## Version 0.1.0
Prototype : carte OpenStreetMap (MapLibre), création de projets, import local GeoJSON, sélection de parcelles et cumul estimatif des surfaces, interface responsive, page À propos. Les données sont stockées dans le navigateur (`localStorage`).

**Non encore disponible** : authentification, base connectée, import départemental PCI/EDIGÉO, PWA et données cadastrales à jour chargées automatiquement.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Fonctionnalités](docs/FONCTIONNALITES.md)
- [Modèle de données](docs/MODELE_DONNEES.md)
- [Imports](docs/IMPORT_CADASTRE.md)
- [API](docs/API.md)
- [Interface mobile](docs/INTERFACE.md)
- [Déploiement](docs/DEPLOIEMENT.md)
- [Configuration](docs/CONFIGURATION.md)
- [Exploitation](docs/EXPLOITATION.md)
- [Roadmap](docs/ROADMAP.md)

Les superficies GeoJSON sont indicatives et ne remplacent pas une référence cadastrale officielle.
