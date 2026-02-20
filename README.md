# FIVH Bergen gjenbruksportal

_View page: <https://fivh-bergen.github.io/kart/>_

This is a map designed to help people find ways to reuse and repair in Bergen, Norway.

It is made with [Astro](https://astro.build/), [React](https://react.dev/) and [Maplibre](https://maplibre.org/maplibre-gl-js/docs/) using [OpenStreetMap](https://www.openstreetmap.org/) map data via [Maptiler](https://www.maptiler.com/) and [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API) and is hosted on [Github Pages](https://pages.github.com/).

## Contributing to the project

While initially developed with funding from [LNU](https://www.lnu.no/), this project is dependent on volunteers in order to remain up to date. You can help us out by updating information about second hand shops, rental places and repair shops.

If you have experience with programming, you can also help us develop new features.

### Updating the map

This project uses data from OpenStreetMap (OSM). OpenStreetMap is sort of like wikipedia in map form. The data is entered and maintained by volunteers, for the benefit of all.

In order to update the info in our map, the store/amenity in question must be updated in OpenStreetMap. This requires an OpenStreetMap account, which you can create here](<https://www.openstreetmap.org/user/new>). One you have an account, all you need to do is click on a pin in our map, and you will see a button to log in to the store/amenity in the info panel. This is a handy way to quickly make changes to an existing pin!

You can also add or edit shops on OpenStreetMap via [OpenStreetMap.org](https://openstreetmap.org/), which has a browser based map editor which is a more powerful editor than our editor, but has a bit of a learning curve. In addition to that there are mobile apps such as [EveryDoor](https://every-door.app/) and [StreetComplete](https://streetcomplete.app/), both of which are designed for mapping in the field.

#### Manually retrieving the latest data

Someone with the right permissions can fetch the latest data from OSM with the Github workflow found [here](https://github.com/fivh-bergen/kart/actions/workflows/fetch-features.yml) (click "Run workflow").

### Developing the application

This is an open source application written in JavaScript and TypeScript.

#### Project Structure

To learn more about the folder structure of an Astro project, refer to [Astro's guide on project structure](https://docs.astro.build/en/basics/project-structure/).

#### Get started

This project requires [pnpm](https://pnpm.io/installation).

When you have pnpm installed, simply run `pnpm install` from the project root.

#### Commands

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
| `pnpm format`          | Format files with prettier                       |
| `pnpm format:check`    | Check files with prettier                        |
| `pnpm fetch-nodes`     | Fetch nodes from Overpass API, parse to GeoJSON  |
| `pnpm generate`        | Generate documentation                           |

#### Map tiles

We retrieve vector map tiles from maptiler, using their free plan. We use a slightly modified version of their "Pastel" map. The source of the map tiles is specified in [src/config.ts](src/config.ts). Replacing the base map is simply a matter of creating an account with maptiler (or one of their competitors), creating or choosing a map style and updating the `style` URL in config.ts.

#### Data fetching from OSM

The pins on the map come from the Overpass API, which is an API that retrieves data about features or POIs (points of interest) mapped by OpenStreetMap volunteers.

The query we use to retrieve this data can be found here: [`src/overpass/query.overpassql`](src/overpass/query.overpassql).

You can try them out in the [Overpass turbo sandbox](https://overpass-turbo.eu/) by copy pasting the entire contents of an .overpassql file.

#### Tags in the info panel

This app displays some tags in the info panel to provide some useful information about shops/POIs. The tags that can appear here are a representation of certain tags found in OpenStreetMap. More information about these tags can be found [here](docs/tags.md)

#### HTTPS

You can run the dev server with HTTPS by creating a certificate called `localhost`, which will be recognised by our Vite config and used to runt the dev server with HTTPS.

OSM requires HTTPS for the login functionality.

On Mac OS, using homebrew:

```sh
brew install mkcert
mkcert -install
mkcert localhost
```
