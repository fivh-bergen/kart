# Tags

> This file is generated from source code. Do not edit it directly.

This is a list of tags that are used to provide information about the features in the map.
We don't mean to cover every possible tag in OpenStreetMap since there are [a lot of them](https://wiki.openstreetmap.org/wiki/Tags), but we try tro cover some useful basics.

Some of our tags correspond to multiple different tags in OSM,
since there are often many different ways to tag things in OSM.

| Our tag          | Corresponding OSM tag(s)                                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Kvinneklær       | clothes=women                                                                                                              |
| Herreklær        | clothes=men                                                                                                                |
| Barneklær        | clothes=children                                                                                                           |
| Sykkelreparasjon | shop=bicycle and repair=yes or service:bicycle:repair=yes                                                                  |
| Skomaker         | craft=shoemaker                                                                                                            |
| Bøker            | shop=books                                                                                                                 |
| Elektronikk      | shop=electronics_repair or craft=electronics_repair or computer:repair=yes or mobile_phone:repair=yes or camera:repair=yes |
| Gullsmed         | craft=goldsmith or craft=jeweller                                                                                          |
| Gitarmaker       | craft=luthier                                                                                                              |
| Sykkelutleie     | amenity=bicycle_rental                                                                                                     |

## Adding new tags

Expanding this list is quite straightforward,
just add a new tag to the `tags` array in [src/utils/tags.ts](../tags.ts) and run `pnpm fetch-nodes` to update the GeoJSON data and `pnpm generate` to update this table.
