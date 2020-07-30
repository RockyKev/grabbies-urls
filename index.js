const fs = require('fs');
const cheerio = require('cheerio'); // does the web-scraping
const got = require('got');  // does the http request
const csv = require('fast-csv');

const wpVersions = require('./wpVersions.js');

//TODO LIST: 
// 1. Put it in a json file or csv file. 
// 2. keep the URL
// 3. test with other wordpress sites
// 4. Maybe make it accurate by identifying all the wordpress versions? (https://codex.wordpress.org/WordPress_Versions)
// 5. Make it give you the root URL. 

const bucketOfUrls = [
    "https://bluetigerstudio.com/",
    "https://wsu.edu/",
    "https://www.houstonzoo.org/"
]


const isIncludes = (i, link) => {
    if (typeof link.attribs.src === 'undefined') {
        return false;
    }
    return link.attribs.src.includes('ver=5.4.2');
}

// const noParens = (i, link) => {
//     const parensRegex = /^((?!\().)*$/;

//     return parensRegex.test(link.children[0].data);
// }

const checkForVersionMatch = (i, link) => {

    if (typeof link.attribs.src === 'undefined') {
        return false;
    }

    for (const version in wpVersions) {
        const versionCheck = 'ver=' + version;

        if (link.attribs.src.includes(version)) {
            console.log("matching version", version);
            console.log("versionCheck", versionCheck);

        }
        return link.attribs.src.includes(version);

    }


}

// 1. Put it in a json file or csv file. 
// text version. 
function convertToText(result) {
    fs.writeFile('output.txt', results, function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("Report Generated!");
    });
}

// csv version using fast-csv 
// https://stackabuse.com/reading-and-writing-csv-files-with-node-js/


function convertToCSV(data, outputName) {

    const ws = fs.createWriteStream(outputName + ".csv");

    csv.write(data, { headers: true })
        .pipe(ws);

    console.log("Report Generated!");
}



// 2. keep the URL
// THis means I have to turn the results into it's own row



// 3. test with other wordpress sites


// 4. Maybe make it accurate by identifying all the wordpress versions? (https://codex.wordpress.org/WordPress_Versions)




// 5. Make it give you the root URL. 



// Initial start code
function start() {

    // convertToCSV(dummyData, "imma-big-dummy");

    // declare the array to turninto csv
    const itsTheContent = [];

    // loop that gets the URLs with a specific filter

    bucketOfUrls.forEach(url =>
        got(url)
            .then(res => {
                const $ = cheerio.load(res.body);

                // grab links if it includes /wp-includes/
                $('script')
                    .filter(isIncludes)
                    // .filter(checkForVersionMatch)
                    .each((i, link) => {
                        const result = link.attribs.src;
                        console.log("=========>", url);
                        console.log("*", result);
                        itsTheContent.push(result);
                    })
            })
            .then(() => {

            })
            .catch(err => {
                console.log(err);
            })
    )

    // output it into a file. 

    // convertToCSV(dummyData, "imma-big-dummy");
    // console.log(wpVersions);
}


//initialize function 
start();

