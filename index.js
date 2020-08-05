require('dotenv').config();

const fs = require('fs');
const cheerio = require('cheerio'); // does the web-scraping
const got = require('got');  // does the http request
const csv = require('fast-csv');

const bucketOfUrls = require(process.env.URLARRAY);
const wpVersions = require('./wpVersions.js');


const wpVersionsArray = Object.keys(wpVersions); //so I can sort/reverse/etc
const wpVersionsReverse = wpVersionsArray.reverse();

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

// Put it in a json file or csv file. 
// csv version using fast-csv: https://stackabuse.com/reading-and-writing-csv-files-with-node-js/

function convertToCSV(data, outputName) {

    const ws = fs.createWriteStream(outputName + ".csv");

    csv.write(data, { headers: true })
        .pipe(ws);

    console.log("Report Generated!");
}

// Initial start code
function start() {

    // create a function that it's only goal is to get the url link and return it.
    // when the promise is finished, it spitsit outl.
    // this is redundant - https://codereview.stackexchange.com/questions/123577/using-fetch-and-a-new-promise-object-to-get-api-results

    function gotWithTimeout(url, timeout) {
        return new Promise((resolve, reject) => {
            let timer = setTimeout(
                () => reject(new Error('Request timed out')),
                timeout
            );

            got(url).then(
                response => resolve(response),
                err => reject(err)
            ).finally(() => clearTimeout(timer));
        })
    }


    const returnAllScriptsFromSite = (url) => {
        return new Promise((resolve, reject) => {
            gotWithTimeout(url, 5000).then(res => {

                console.log("starting on: ", url);
                const $ = cheerio.load(res.body);

                let linkContent = {};

                $('script') // pulls all 'script' tags from res
                    .filter(isIncludes)
                    .filter(checkForVersionMatch)
                    .each((i, link) => {

                        linkContent["site"] = url;
                        linkContent["version"] = link.version;
                        linkContent["link"] = link.attribs.src;

                        console.log(url);
                        console.log(link.version);
                        console.log(link.attribs.src);
                    })

                console.log("inside filter");
                console.log("linkContent", linkContent);

                setTimeout(() => {
                    resolve(linkContent);
                }, 1000)

            })
        })
    }

    const returnAllScriptsFromSiteV2 = (url) => {
        got(url).then(res => {

            if (res.ok) {
                console.log("starting on: ", url);
                const $ = cheerio.load(res.body);

                let linkContent = {};

                $('script') // pulls all 'script' tags from res
                    .filter(isIncludes)
                    .filter(checkForVersionMatch)
                    .each((i, link) => {

                        linkContent["site"] = url;
                        linkContent["version"] = link.version;
                        linkContent["link"] = link.attribs.src;

                        console.log(url);
                        console.log(link.version);
                        console.log(link.attribs.src);
                    })

                console.log("inside filter");
                console.log("linkContent", linkContent);

                setTimeout(() => {
                    return linkContent;
                }, 1000)

            }

            return Promise.reject(Error('error'))
        }).catch(error => {
            return Promise.reject(Error(error.message))
        })
    }




    Promise.all(bucketOfUrls
        .map(x => returnAllScriptsFromSite(x)))
        .then(result => {
            console.log("promise ->");
            console.log(result);
            convertToCSV(result, "results-11-35am");
        }).catch(error => {
            console.error(error.message)
        })



}


//initialize function 
start();

