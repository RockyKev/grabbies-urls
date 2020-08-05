require('dotenv').config();

const fs = require('fs');
const cheerio = require('cheerio'); // does the web-scraping
// const got = require('got');  // does the http request 
const fetch = require('node-fetch');

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


    // create delay
    const delay = t => new Promise(resolve => setTimeout(resolve, t));

    // create a function that it's only goal is to get the url link and return it.
    // when the promise is finished, it spitsit outl.
    // this is redundant - https://codereview.stackexchange.com/questions/123577/using-fetch-and-a-new-promise-object-to-get-api-results
    const returnAllScriptsFromSite = (url) => {
        return new Promise((resolve, reject) => {
            fetch(url)
                .then(res => res.json())
                .then(data => {

                    console.log("starting on: ", url);
                    const $ = cheerio.load(data.body);

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




    Promise
        .all(bucketOfUrls.map(x => returnAllScriptsFromSite(x)))
        .then(result => {
            console.log("promise ->");
            console.log(result);
            convertToCSV(result, "results-1-47pm");
        }).catch(error => {
            console.error(error.message)
        })


    // function fetchWithTimeout(url, timeout) {
    //     return new Promise((resolve, reject) => {
    //         let timer = setTimeout(
    //             () => reject(new Error('Request timed out')),
    //             timeout
    //         );

    //         fetch(url).then(
    //             response => resolve(response),
    //             err => reject(err)
    //         ).finally(() => clearTimeout(timer));
    //     })
    // }


    // // let urlArray = ["https://www.freecodecamp.org", "https://www.yahoo.com/", "https://dev.to/"];
    // let urlArray = ["https://www.freecodecamp.org"];


    // let array = new Array;

    // function get(url) {
    //     return new Promise((resolve, reject) => {
    //         fetchWithTimeout(url, 5000)
    //             //.then(res => { return res.text(); })
    //             .then(res => {

    //                 //console.log(res.body);
    //                 const $ = cheerio.load(res.body);
    //                 const title = $("title").text();
    //                 //let reg = /\<meta name="description" content\=\"(.+?)\"/;
    //                 //let reg = /ab+c/;
    //                 // let reg = /<title[^>]*>(.*?)<\/title>/;
    //                 // res = res.match(reg);
    //                 console.log("title", title);
    //                 resolve(title);
    //                 //console.log(res);
    //             }
    //             )
    //             .catch(err => { reject(err) })
    //     });
    // }

    // async function result() {
    //     for (url of urlArray) {

    //         //console.log(url);
    //         // }
    //         // for (let i = 0; i < url.length; i++) {

    //         const value = await get(url);
    //         array.push(value)

    //     }

    //     console.log(array);
    // }


    // result();



    //end 
}



//initialize function 
start();

