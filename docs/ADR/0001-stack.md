# ADR 0001 — Choix de la pile

**Décision** : React + Vite + TypeScript + MapLibre ; Vercel pour le frontend ; Supabase/PostGIS comme persistance cible ; VPS Hostinger pour les traitements géographiques lourds. Cette architecture minimise la maintenance frontend tout en permettant les traitements volumineux hors des limites serverless.
