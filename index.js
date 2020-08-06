require('dotenv').config();

const fs = require('fs');
const cheerio = require('cheerio'); // does the web-scraping
const csv = require('fast-csv');

const fetch = require('node-fetch');
const Promise = require("bluebird");

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

async function fetchHTML(url) {

    const response = await fetch(url)
        .catch(function (error) {
            console.log("ITS BROKEN:", error.code);
        });

    if (!response) {
        return false;
    }

    const data = await response.text();
    return cheerio.load(data);
};

async function getTitle(url) {
    const $ = await fetchHTML(url);

    if ($) {
        const title = $('title');
        console.log("title:", title.text());
        return title.text();
    }

}

async function getScripts(url) {
    const $ = await fetchHTML(url);

    if ($) {
        console.log("starting on: ", url);

        let linkContent = {};

        $('script') // pulls all 'script' tags from res
            .filter(isIncludes)
            .filter(checkForVersionMatch)
            .each((i, link) => {

                linkContent["site"] = url;
                linkContent["version"] = link.version;
                linkContent["link"] = link.attribs.src;

            })

        // check if it's empty
        // Object.keys(obj).length === 0 && obj.constructor === Object
        if (Object.keys(linkContent).length === 0 && linkContent.constructor === Object) {
            linkContent["site"] = url;
            linkContent["version"] = "Bruh no idea";
            linkContent["link"] = "no link";
        }

        console.log("linkContent", linkContent);

        return linkContent;

    } else {
        console.log("an error in getScripts on: ", url);

    }

}

function getDate() {

    let twoChars = (i) => {
        return (`0${i}`).slice(-2);
    }

    let date_ob = new Date();

    let day = twoChars(date_ob.getDate());
    let month = twoChars(date_ob.getMonth() + 1);
    let year = date_ob.getFullYear();
    let hours = twoChars(date_ob.getHours());
    let minutes = twoChars(date_ob.getMinutes());
    let seconds = twoChars(date_ob.getSeconds());

    return `${year}-${month}-${day}-${hours}${minutes}`;

}

async function start() {

    const urls = bucketOfUrls.map(url => `${url}/wp-admin`);

    // Using bluebird Promises Async to avoid break
    const numbers = [];

    for (var i = 0; i < urls.length; i++) {
        numbers.push(i);
        console.log(numbers)
    }

    const results = await Promise.map(numbers, number => getScripts(urls[number]),
        { concurrency: 2 }
    )

    //let date = getDate();
    const csvFilename = "results-" + String(getDate());

    // console.log(results);
    convertToCSV(results, csvFilename);

}


//initialize function 
start();

