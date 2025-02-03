import * as fs from 'fs/promises';
import * as path from 'path'

export async function getFetchUrl() {
    const file = path.resolve(path.dirname(''), "./src/data/query.overpassql");
    const data = await fs.readFile(file);
    const query =  Buffer.from(data);
    const urlFormatted = new URLSearchParams()
    urlFormatted.append("data", query.toString())

    const url= new URL("api/interpreter","https://overpass-api.de" )
    return url.href + "?" + urlFormatted.toString();
}

const url = await getFetchUrl();

const response = await fetch(url);

const json = await response.json()

// write to file
await fs.writeFile(path.resolve(path.dirname(''), "./src/data/features.json"), JSON.stringify(json, null, 2));