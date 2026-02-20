# Tags

> This file is generated from source code. Do not edit it directly.

In this project, we want to visualise data from OSM in a user friendly way.
OpenStreetMap data is tagged with key-value pairs, but there are often many different ways to tag the same thing,
and the tag data itself is not very pleasing to the eye.

An example would be the tag _clothes=women_, which is not very appealing to read and is not localised.
Therefore, we want to show this as "Kvinneklær" instead, which is more user friendly.
We call this a _designation_.
Since there are often many different ways to tag the same thing in OSM,
we need to map multiple different OSM tags to the same designation.
Therefore we have multiple definitions that satisfy a single designation.
A definition can consist of multiple tags, such as _shop=bicycle_ **AND** _repair=yes_,
which together indicate that this is a place that repairs bicycles.

This is a list of designations that are used in the map.
We don't mean to cover every possible tag in OpenStreetMap since there are [a lot of them](https://wiki.openstreetmap.org/wiki/Tags),
but we try to cover some useful basics.

Some of our tags correspond to multiple different tags in OSM,
since there are often many different ways to tag things in OSM.

| Our designation       | Corresponding OSM tag(s)                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Bruktbutikk           | (shop=second_hand) or (shop=charity)                                                                                                 |
| Bruktklær/vintage     | (shop=clothes and second_hand=only) or (shop=clothes and second_hand=yes)                                                            |
| Kvinneklær            | (clothes=women)                                                                                                                      |
| Herreklær             | (clothes=men)                                                                                                                        |
| Barneklær             | (clothes=children)                                                                                                                   |
| Leketøy               | (sells=toys)                                                                                                                         |
| Sykler                | (shop=bicycle and repair=yes) or (service:bicycle:repair=yes)                                                                        |
| Mobiltelefoner        | (mobile_phone:repair=yes)                                                                                                            |
| Sko                   | (craft=shoemaker)                                                                                                                    |
| Bøker                 | (sells=books)                                                                                                                        |
| Elektronikkreparasjon | (shop=electronics_repair) or (craft=electronics_repair) or (computer:repair=yes) or (mobile_phone:repair=yes) or (camera:repair=yes) |
| Gullsmed              | (craft=goldsmith) or (craft=jeweller)                                                                                                |
| Gitarmaker            | (craft=luthier)                                                                                                                      |
| Sykkelutleie          | (amenity=bicycle_rental)                                                                                                             |

## Adding new designations

Expanding this list is quite straightforward,
just add a new designation to the `designations` array in [src/utils/designation.ts](../src/utils/designation.ts) and run `pnpm fetch-nodes` to update the GeoJSON data and `pnpm generate` to update this table.
