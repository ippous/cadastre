# Déploiement

Vercel : importer le dépôt `ippous/cadastre`, framework Vite, commande `npm run build`, sortie `dist`, branche de production `main`. Ajouter ensuite `cadastre.jaume-eric.com` dans Vercel. Configurer sur Hostinger l'enregistrement DNS exactement indiqué par Vercel. Ne pas changer le domaine racine.

Prévoir ultérieurement les variables publiques `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`. Les clés sensibles restent dans l'environnement serveur, jamais en `VITE_*`. Les jobs lourds seront exécutés sur le VPS et non dans les fonctions frontend.
