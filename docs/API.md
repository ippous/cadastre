# API de rendu cadastral

Endpoint : `POST https://cadastre.jaume-eric.com/api/render`.

Authentification : `Authorization: Bearer ACCESS_TOKEN` où ACCESS_TOKEN est le jeton d'accès Supabase Auth d'un compte Cadastre Web. Le serveur valide le jeton via Supabase Auth. Pour un projet, le propriétaire doit être le compte connecté. La méthode OAuth/OIDC de tiers (authorization code PKCE ou client credentials) reste à configurer ; cette V1 propose **l'authentification par compte existant**.

Corps JSON : fournir **soit** `parcelIds`, liste de 1 à 50 identifiants cadastraux, **soit** `projectId`, UUID du projet.

Options : `format` (png par défaut, pdf, svg), `width` (1000 par défaut), `height` (750 par défaut), `labels` (true par défaut). Dimensions 300–2000 pixels, maximum 3 millions de pixels. Projets limités à 50 parcelles visibles.

Exemple PNG :
```bash
curl -X POST "https://cadastre.jaume-eric.com/api/render" \
 -H "Authorization: Bearer $ACCESS_TOKEN" \
 -H "Content-Type: application/json" \
 --data '{"parcelIds":["89352000MD0281","89352000ME0115"],"format":"png","width":1200,"height":900}' \
 --output parcelles.png
```

Exemple PDF :
```bash
curl -X POST "https://cadastre.jaume-eric.com/api/render" \
 -H "Authorization: Bearer $ACCESS_TOKEN" \
 -H "Content-Type: application/json" \
 --data '{"projectId":"UUID-DU-PROJET","format":"pdf"}' \
 --output projet.pdf
```

Pour demander un jeton via un **client de confiance** : API Supabase `POST https://wswxxpkiwgktinmafjaj.supabase.co/auth/v1/token?grant_type=password` avec `apikey: <clé publique>`, JSON email/mot de passe. Ne transmettez jamais un mot de passe, access token ou refresh token en paramètre URL ; protégez les jetons. Les applications tierces publiques devraient utiliser un flux OAuth/OIDC PKCE une fois configuré plutôt que collecter le mot de passe.

La V1 produit les contours vectoriels, le remplissage du projet et les numéros sur **fond neutre**, sans orthophoto IGN. Réponses binaires directes, pas de stockage public des rendus. Codes : 400 (requête invalide), 401 (non authentifié), 403 (accès interdit), 404 (aucune parcelle), 413 (limite dépassée), 503 (configuration). Limitation de débit par compte et OAuth M2M restent à développer avant un usage massif.
