const fs = require('fs');
const cheerio = require('cheerio'); // does the web-scraping
const got = require('got');  // does the http request
const csv = require('fast-csv');

const wpVersions = require('./wpVersions.js');
const bucketOfUrls = require('./bucketOfUrls.js');

const wpVersionsArray = Object.keys(wpVersions); //so I can sort/reverse/etc
const wpVersionsReverse = wpVersionsArray.reverse();

//TODO LIST: 
// 1. Put it in a json file or csv file. [DONE]
// 2. keep the URL
// 3. test with other wordpress sites
// 4. Maybe make it accurate by identifying all the wordpress versions? (https://codex.wordpress.org/WordPress_Versions)
// 5. Make it give you the root URL. 




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

            //check to see if there's more values in it or not.
            return link.attribs.src.includes(versionCheck);
        }
    }

}



// const noParens = (i, link) => {
//     const parensRegex = /^((?!\().)*$/;

//     return parensRegex.test(link.children[0].data);
// }


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



// Initial start code
function start() {

    // convertToCSV(dummyData, "imma-big-dummy");

    // declare the array to turninto csv
    const itsTheContent = [];

    bucketOfUrls.forEach(url =>
        got(url)
            .then(res => {
                console.log("📗 starting on: ", url);

                const $ = cheerio.load(res.body);

                // grab links if it includes /wp-includes/
                $('script')
                    .filter(isIncludes)
                    .filter(checkForVersionMatch)
                    .each((i, link) => {
                        const result = link.attribs.src;
                        console.log("*", result);
                        itsTheContent.push(result);
                    })
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

