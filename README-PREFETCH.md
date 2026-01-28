Prefetch addresses (SQLite)
===========================


Dette repoet inneholder et lite script som prefetcher adresser for features.json og lagrer dem i en enkel JSON‑fil.

Installasjon (lokalt utviklingsmiljø):

1. Installer avhengigheter

   pnpm install

2. Kjør prefetch‑scriptet

   pnpm prefetch-addresses

Hva scriptet gjør:
- Leser src/overpass/features.json
- Foretrekker eksisterende addr:*-felt i hvert feature (hvis tilstede)
- Ellers kjører reverse geocoding via Nominatim og bygger src/overpass/address-cache.json

Tips:
- Du kan regenerere cache når du oppdaterer features.json.
