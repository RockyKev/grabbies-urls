require('dotenv').config();

const fs = require('fs');
const cheerio = require('cheerio'); // does the web-scraping
const got = require('got');  // does the http request
const csv = require('fast-csv');

const bucketOfUrls = require(process.env.URLARRAY);
const wpVersions = require('./wpVersions.js');


const wpVersionsArray = Object.keys(wpVersions); //so I can sort/reverse/etc
const wpVersionsReverse = wpVersionsArray.reverse();

//TODO LIST: 
// 1. Put it in a json file or csv file. [DONE]
// 2. keep the URL
// 3. test with other wordpress sites
// 4. Maybe make it accurate by identifying all the wordpress versions? (https://codex.wordpress.org/WordPress_Versions)
// 5. Make it give you the root URL. 
// 6.                     // grab links if it includes /wp-includes/


// FILTERS 
const isIncludes = (i, link) => {
    if (typeof link.attribs.src === 'undefined') {
        return false;
    }

    return link.attribs.src.includes('ver=');
}
const checkForVersionMatch = (i, link) => {

    if (typeof link.attribs.src === 'undefined') {
        return false;
    }

    for (const version of wpVersionsReverse) {
        const versionCheck = 'ver=' + version;

        if (link.attribs.src.includes(versionCheck)) {

            console.log("matching version", version);
            link.version = version;
            return link.attribs.src.includes(versionCheck);
        }
    }

}

// 1. Put it in a json file or csv file. 

// csv version using fast-csv 
// https://stackabuse.com/reading-and-writing-csv-files-with-node-js/

function convertToCSV(data, outputName) {

    const ws = fs.createWriteStream(outputName + ".csv");

    csv.write(data, { headers: true })
        .pipe(ws);

    console.log("Report Generated!");
}

const itsTheContent = [];

function addToCSVObject(array, object) {
    array.push(object);
    console.log("added to CSVObject");
}

// Initial start code
function start() {

    bucketOfUrls.forEach(url =>
        got(url)
            .then(res => {
                console.log("starting on: ", url);

                const $ = cheerio.load(res.body);

                $('script') // pulls all 'script' tags from res
                    .filter(isIncludes)
                    .filter(checkForVersionMatch)
                    .each((i, link) => {
                        let tempObject = new Object();

                        console.log("*", link.attribs.src);
                        console.log("link.version", link.version);
                        tempObject.site = url;
                        tempObject.version = link.version;
                        tempObject.link = link.attribs.src;
                        addToCSVObject(itsTheContent, tempObject);
                    })
            })
            .catch(err => {
                console.log(err);
            })
    )



    // After loop is finished - output it into a file. 
    console.log("finished");
    console.log(itsTheContent)

    // convertToCSV(dummyData, "imma-big-dummy");
    // console.log(wpVersions);
}


//initialize function 
start();

