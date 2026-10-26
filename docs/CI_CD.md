# Compilation et déploiement Vercel

## Intégration continue
GitHub Actions construit la branche main et les pull requests avec Node.js 22, `npm install` et `npm run build`.
Une erreur TypeScript ou Vite fait échouer le workflow. Le dossier `dist/` est conservé temporairement comme artefact.

**À améliorer :** générer et committer un `package-lock.json` vérifié pour passer ensuite à `npm ci` et obtenir un build strictement reproductible.

## Paramètres Vercel
Repository : `ippous/cadastre`. Branch : `main`. Framework : Vite. Build : `npm run build`. Output : `dist`. Node : 22. Le fichier `vercel.json` prend en charge la SPA.

## Domaine Hostinger
Après un déploiement Vercel vérifié, ajouter `cadastre.jaume-eric.com` comme domaine personnalisé dans Vercel, puis utiliser dans Hostinger **la cible DNS exacte fournie par Vercel**. Ne pas modifier le domaine racine.

## État fonctionnel
Le frontend sauvegarde actuellement dans le localStorage. Le backend et l'import cadastral départemental ne sont pas encore implémentés.
