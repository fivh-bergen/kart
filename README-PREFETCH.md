Prefetch addresses (SQLite)
===========================

Dette repoet inneholder et lite script som prefetcher adresser for features.json og lagrer dem i en SQLite‑database.

Installasjon (lokalt utviklingsmiljø):

1. Installer avhengigheter

   pnpm install

2. Kjør prefetch‑scriptet

   pnpm prefetch-addresses

Hva scriptet gjør:
- Leser src/overpass/features.json
- Fyller data/address-cache.db (SQLite) med adresseinformasjon. Hvis feature allerede har addr:*-felter bruker scriptet disse. Ellers gjøres reverse geocoding via Nominatim.
- Eksporterer en JSON‑fil src/overpass/address-cache.json som brukes av frontend ved bygg eller kjøres sammen med fetch‑flow.

Tips:
- Du kan regenerere cache når du oppdaterer features.json.
- Legg data/address-cache.db til .gitignore hvis du ikke ønsker å sjekke DB‑filen inn i repo.
