# FIVH Bergen Kart

_View page: <https://fivh-bergen.github.io/kart/>_

This is a map of sustainable businesses in Bergen. It is made with Astro and Maplibre GL using map tiles from Maptiler, and is hosted on Github Pages.

## Where do we get data from?

The pins on the map come from the Overpass API, which is an API that retrieves data about features or POIs (points of interest) mapped by OpenStreetMap volunteers. This means that in order to update something on our map, you must update

The query we use to retrieve data can be found in [`src/data/query.overpassql`](src/data/query.overpassql).

You can try it out in the [Overpass API sandbox](https://overpass-turbo.eu/).

## 🚀 Project Structure

To learn more about the folder structure of an Astro project, refer to [Astro's guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [Astro's documentation](https://docs.astro.build) or jump into their [Discord server](https://astro.build/chat).
