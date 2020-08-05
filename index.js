require('dotenv').config();

const fs = require('fs');
const cheerio = require('cheerio'); // does the web-scraping
const got = require('got');  // does the http request
const csv = require('fast-csv');
const fetch = require('node-fetch');

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
function start_V1() {

    // create a function that it's only goal is to get the url link and return it.
    // when the promise is finished, it spitsit outl.
    // this is redundant - https://codereview.stackexchange.com/questions/123577/using-fetch-and-a-new-promise-object-to-get-api-results

    function gotWithTimeout(url, timeout) {
        return new Promise((resolve, reject) => {
            let timer = setTimeout(
                () => reject(new Error('Request timed out')),
                timeout
            );

            console.log("wait this amount of time:", timeout);

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

                        // console.log(url);
                        // console.log(link.version);
                        console.log(link.attribs.src);
                    })

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



    // I want the following to happen

    // 1. fetch the first url. 
    // 2. once it's finish, return a true. 
    // 3. then move to the next item. 

    // THE LOOP 
    // starts at 0 - the counter
    // create a blank variable
    // creates the promise.
    // the promise resolves into the blank variable
    // async? if statement if the variable contains anything -- counter++ 




    Promise.all(bucketOfUrls
        .map(x => returnAllScriptsFromSite(x)))
        .then(result => {
            console.log("promise ->");
            console.log(result);
            convertToCSV(result, "results-7-44pm");
        }).catch(error => {
            console.error(error.message)
        })



}


function start_V2() {

    let counter = 0;
    let counterTotal = bucketOfUrls.length;
    let finalContent = [];

    function gotWithTimeout(url, timeout) {
        return new Promise((resolve, reject) => {
            let timer = setTimeout(
                () => reject(new Error('Request timed out')),
                timeout
            );

            console.log("wait this amount of time:", timeout);

            got(url).then(
                response => resolve(response),
                err => reject(err)
            ).finally(() => clearTimeout(timer));
        })
    }


    let grabTheUrl = function (url) {
        return new Promise(function (resolve, reject) {
            gotWithTimeout(url, 5000)
                .then(res => {

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

                            //console.log(url);
                            //console.log(link.version);
                            //console.log(link.attribs.src);
                        })

                    resolve(linkContent);

                })
                .then((final) => {
                    return final;
                });
        });
    }


    async function loopThroughEachUrl(finalArray) {

        while (counter < counterTotal) {
            let result = await grabTheUrl(bucketOfUrls[counter]);
            finalArray.push(result);
            counter++;
        }
    }

    loopThroughEachUrl(finalContent)
        .then(() => {
            console.log("finalContent:", finalContent);
        });


}

function start() {


    async function fetchHTML(url) {
        const data = await got(url);
        return cheerio.load(data.body);
    };

    async function getTitle(url) {
        const $ = await fetchHTML(url)
        const title = $('title');
        console.log("title:", title.text());
        return title.text();
    }

    // const getTitle = (url) => {
    //     return fetch(url)
    //         // .then((response) => response.text())
    //         .then((response) => {
    //             // const doc = new DOMParser().parseFromString(html, "text/html");
    //             // const title = doc.querySelectorAll('title')[0];
    //             const $ = cheerio.load(response);
    //             const title = $('title');

    //             return title;
    //         });
    // };


    var urls = [
        'https://medium.com/',
        'https://frontendnewsletter.com/',
        'https://groups.google.com/',
        'https://www.youtube.com/watch?v=9kJVYpOqcVU',
    ]

    // This one keeps the order the same as the URL list.
    Promise.all(
        urls.map((url) => getTitle(url))
    ).then((titles) => {
        console.log(titles);
    });
}
//initialize function 
start();

