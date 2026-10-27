# Spécifications fonctionnelles

## Version 0.1.0
- Créer, choisir et supprimer des projets.
- Importer localement des FeatureCollection GeoJSON composées de Polygon et MultiPolygon (sans limite fixe côté interface ; avertissement au-delà de 100 Mo, sous réserve de la mémoire disponible).
- Associer les parcelles au projet courant.
- Cliquer dans la liste ou sur la carte pour sélectionner/désélectionner.
- Afficher la superficie géométrique individuelle et cumulée en hectares.
- Zoomer, dézoomer, centrer le projet, activer/désactiver le fond OSM.
- Interface bureau/mobile avec liste et carte.
- Page « À propos » : attribution à l'Élevage de Brot.

## À venir
Authentification, multi-utilisateur, stockage PostGIS, chargement cadastral par département, fond IGN, recherche commune/section/numéro, export CSV/Excel/GeoJSON/PDF, PWA.

## Gestion des parcelles par projet (étape en cours)
Chaque projet associe des parcelles cadastrales sans modifier la donnée officielle. Chaque association reçoit un tableau de tags, une couleur de remplissage, une transparence, une couleur/épaisseur de contour et un état visible/masqué. Une sélection sur le plan ou dans la liste ouvre un panneau de propriétés. La version React actuelle permet de modifier ces propriétés sur les GeoJSON déjà importés localement ; le stockage distant est préparé en SQL (`supabase/project_styles.sql`) mais **non relié au frontend**. Pour charger un département depuis PostGIS, il reste à mettre en place une API de lecture cartographique paginée et la gestion de l'authentification.

## Sauvegarde des projets dans Supabase (2026-10-27)
Connexion par email/mot de passe Supabase Auth. Bouton « Enregistrer en base » sauvegardant les projets et leurs parcelles cadastrales avec tags, couleurs, transparences et visibilité ; « Recharger » restaure les projets et les géométries depuis PostGIS. Les tables ont des politiques RLS liées à `owner_id`; `get_my_project_parcels` ne renvoie que les données du propriétaire authentifié. Les projets locaux préexistants ne sont pas migrés automatiquement, les imports GeoJSON manuels sans identifiant cadastral officiel ne sont pas enregistrés en base, et l'interface demande pour l'instant une sauvegarde explicite.
