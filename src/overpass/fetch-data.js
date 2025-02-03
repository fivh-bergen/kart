import * as fs from 'fs/promises';
import * as path from 'path'

export async function getFetchUrl(category) {

    let filePath;

    if(category === 'repair') {
        filePath = path.resolve(path.dirname(''), "./src/overpass/queries/repair.overpassql");
    } else if (category === 'rental') {
        filePath = path.resolve(path.dirname(''), "./src/overpass/queries/rental.overpassql");
    } else {
        filePath = path.resolve(path.dirname(''), "./src/overpass/queries/second-hand.overpassql");
    }
    const data = await fs.readFile(filePath);
    const query =  Buffer.from(data);
    const urlFormatted = new URLSearchParams()
    urlFormatted.append("data", query.toString())

    const url= new URL("api/interpreter","https://overpass-api.de" )
    return url.href + "?" + urlFormatted.toString();
}


const categories = ['rental', 'repair', 'second-hand'];

categories.forEach(async category => {
    const url = await getFetchUrl(category);
    const response = await fetch(url);

    const output = await response.text()

    await fs.writeFile(path.resolve(path.dirname(''), `./src/overpass/data/${category}.osm`), output);
})
