# FIVH Bergen Kart

_View page: <https://fivh-bergen.github.io/kart/>_

This is a map of sustainable businesses in Bergen. It is made with Astro and Maplibre GL using map tiles from Maptiler, and is hosted on Github Pages.

## Where do we get data from?

The pins on the map come from the Overpass API, which is an API that retrieves data about features or POIs (points of interest) mapped by OpenStreetMap volunteers. This means that in order to update something on our map, you must update

The queries we use to retrieve data can be found in [`src/overpass/queries`](src/overpass/queries).

You can try them out in the [Overpass turbo sandbox](https://overpass-turbo.eu/) by copy pasting the entire contents of an .overpassql file.

## 🚀 Project Structure

To learn more about the folder structure of an Astro project, refer to [Astro's guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## Get started

This project requires [pnpm](https://pnpm.io/installation).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `pnpm install`         | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |
| `pnpm test`            | Run unit tests                                   |
| `pnpm test:spec`       | Run integration tests                            |
| `pnpm test:snapshot`   | Update test snapshots                            |
| `pnpm format`          | Format files with prettier                       |
| `pnpm format:check`    | Check files with prettier                        |
| `pnpm fetch-nodes`     | Fetch nodes from Overpass API, parse to GeoJSON  |
