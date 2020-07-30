const fs = require('fs');
const cheerio = require('cheerio');
const got = require('got');


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
    // return link.attribs.src;

    // const pattern = ['/wp-includes/', '/wp-content/'];

    return link.attribs.src.includes('ver=');

}

const noParens = (i, link) => {
    const parensRegex = /^((?!\().)*$/;

    return parensRegex.test(link.children[0].data);
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


// 2. keep the URL
// 3. test with other wordpress sites


// 4. Maybe make it accurate by identifying all the wordpress versions? (https://codex.wordpress.org/WordPress_Versions)

const wpVersions = {
    '4': "September 4: 2014",
    '4.0.1': "November 20: 2014",
    '4.0.2': "April 21: 2015",
    '4.0.3': "April 23: 2015",
    '4.0.4': "April 27: 2015",
    '4.0.5': "May 7: 2015",
    '4.0.6': "July 23: 2015",
    '4.0.7': "August 4: 2015",
    '4.0.8': "September 15: 2015",
    '4.0.9': "January 6: 2016",
    '4.0.10': "February 2: 2016",
    '4.0.11': "May 6: 2016",
    '4.0.12': "June 21: 2016",
    '4.0.13': "September 7: 2016",
    '4.0.14': "January 11: 2017",
    '4.0.15': "January 26: 2017",
    '4.0.16': "March 6: 2017",
    '4.0.17': "April 20: 2017",
    '4.0.18': "May 16: 2017",
    '4.0.19': "September 19: 2017",
    '4.0.20': "October 31: 2017",
    '4.0.21': "November 29: 2017",
    '4.0.22': "January 16: 2018",
    '4.0.23': "April 3: 2018",
    '4.0.24': "July 5: 2018",
    '4.0.25': "December 12: 2018",
    '4.0.26': "March 13: 2019",
    '4.0.27': "September 4: 2019",
    '4.0.28': "October 14: 2019",
    '4.0.29': "December 12: 2019",
    '4.0.30': "April 29: 2020",
    '4.1': "December 17: 2014",
    '4.1.1': "February 18: 2015",
    '4.1.2': "April 21: 2015",
    '4.1.3': "April 23: 2015",
    '4.1.4': "April 27: 2015",
    '4.1.5': "May 7: 2015",
    '4.1.6': "July 23: 2015",
    '4.1.7': "August 4: 2015",
    '4.1.8': "September 15: 2015",
    '4.1.9': "January 6: 2016",
    '4.1.10': "February 2: 2016",
    '4.1.11': "May 6: 2016",
    '4.1.12': "June 21: 2016",
    '4.1.13': "September 7: 2016",
    '4.1.14': "January 11: 2017",
    '4.1.15': "January 26: 2017",
    '4.1.16': "March 6: 2017",
    '4.1.17': "April 20: 2017",
    '4.1.18': "May 16: 2017",
    '4.1.19': "September 19: 2017",
    '4.1.20': "October 31: 2017",
    '4.1.21': "November 29: 2017",
    '4.1.22': "January 16: 2018",
    '4.1.23': "April 3: 2018",
    '4.1.24': "July 5: 2018",
    '4.1.25': "December 12: 2018",
    '4.1.26': "March 13: 2019",
    '4.1.27': "September 4: 2019",
    '4.1.28': "October 14: 2019",
    '4.1.29': "December 12: 2019",
    '4.1.30': "April 29: 2020",
    '4.2': "April 23: 2015",
    '4.2.1': "April 27: 2015",
    '4.2.2': "May 7: 2015",
    '4.2.3': "July 23: 2015",
    '4.2.4': "August 4: 2015",
    '4.2.5': "September 15: 2015",
    '4.2.6': "January 6: 2016",
    '4.2.7': "February 2: 2016",
    '4.2.8': "May 6: 2016",
    '4.2.9': "June 21: 2016",
    '4.2.10': "September 7: 2016",
    '4.2.11': "January 11: 2017",
    '4.2.12': "January 26: 2017",
    '4.2.13': "March 6: 2017",
    '4.2.14': "April 20: 2017",
    '4.2.15': "May 16: 2017",
    '4.2.16': "September 19: 2017",
    '4.2.17': "October 31: 2017",
    '4.2.18': "November 29: 2017",
    '4.2.19': "January 16: 2018",
    '4.2.20': "April 3: 2018",
    '4.2.21': "July 5: 2018",
    '4.2.22': "December 12: 2018",
    '4.2.23': "March 13: 2019",
    '4.2.24': "September 4: 2019",
    '4.2.25': "October 14: 2019",
    '4.2.26': "December 12: 2019",
    '4.2.27': "April 29: 2020",
    '4.3': "August 18: 2015",
    '4.3.1': "September 15: 2015",
    '4.3.2': "January 6: 2016",
    '4.3.3': "February 2: 2016",
    '4.3.4': "May 6: 2016",
    '4.3.5': "June 21: 2016",
    '4.3.6': "September 7: 2016",
    '4.3.7': "January 11: 2017",
    '4.3.8': "January 26: 2017",
    '4.3.9': "March 6: 2017",
    '4.3.10': "April 20: 2017",
    '4.3.11': "May 16: 2017",
    '4.3.12': "September 19: 2017",
    '4.3.13': "October 31: 2017",
    '4.3.14': "November 29: 2017",
    '4.3.15': "January 16: 2018",
    '4.3.16': "April 3: 2018",
    '4.3.17': "July 5: 2018",
    '4.3.18': "December 12: 2018",
    '4.3.19': "March 13: 2019",
    '4.3.20': "September 4: 2019",
    '4.3.21': "October 14: 2019",
    '4.3.22': "December 12: 2019",
    '4.3.23': "April 29: 2020",
    '4.4': "December 8: 2015",
    '4.4.1': "January 6: 2016",
    '4.4.2': "February 2: 2016",
    '4.4.3': "May 6: 2016",
    '4.4.4': "June 21: 2016",
    '4.4.5': "September 7: 2016",
    '4.4.6': "January 11: 2017",
    '4.4.7': "January 26: 2017",
    '4.4.8': "March 6: 2017",
    '4.4.9': "April 20: 2017",
    '4.4.10': "May 16: 2017",
    '4.4.11': "September 19: 2017",
    '4.4.12': "October 31: 2017",
    '4.4.13': "November 29: 2017",
    '4.4.14': "January 16: 2018",
    '4.4.15': "April 3: 2018",
    '4.4.16': "July 5: 2018",
    '4.4.17': "December 12: 2018",
    '4.4.18': "March 13: 2019",
    '4.4.19': "September 4: 2019",
    '4.4.20': "October 14: 2019",
    '4.4.21': "December 12: 2019",
    '4.4.22': "April 29: 2020",
    '4.5': "April 12: 2016",
    '4.5.1': "April 26: 2016",
    '4.5.2': "May 6: 2016",
    '4.5.3': "June 21: 2016",
    '4.5.4': "September 7: 2016",
    '4.5.5': "January 11: 2017",
    '4.5.6': "January 26: 2017",
    '4.5.7': "March 6: 2017",
    '4.5.8': "April 20: 2017",
    '4.5.9': "May 16: 2017",
    '4.5.10': "September 19: 2017",
    '4.5.11': "October 31: 2017",
    '4.5.12': "November 29: 2017",
    '4.5.13': "January 16: 2018",
    '4.5.14': "April 3: 2018",
    '4.5.15': "July 5: 2018",
    '4.5.16': "December 12: 2018",
    '4.5.17': "March 13: 2019",
    '4.5.18': "September 4: 2019",
    '4.5.19': "October 14: 2019",
    '4.5.20': "December 12: 2019",
    '4.5.21': "April 29: 2020",
    '4.6': "August 16: 2016",
    '4.6.1': "September 7: 2016",
    '4.6.2': "January 11: 2017",
    '4.6.3': "January 26: 2017",
    '4.6.4': "March 6: 2017",
    '4.6.5': "April 20: 2017",
    '4.6.6': "May 16: 2017",
    '4.6.7': "September 19: 2017",
    '4.6.8': "October 31: 2017",
    '4.6.9': "November 29: 2017",
    '4.6.10': "January 16: 2018",
    '4.6.11': "April 3: 2018",
    '4.6.12': "July 5: 2018",
    '4.6.13': "December 12: 2018",
    '4.6.14': "March 13: 2019",
    '4.6.15': "September 4: 2019",
    '4.6.16': "October 14: 2019",
    '4.6.17': "December 12: 2019",
    '4.6.18': "April 29: 2020",
    '4.7': "December 6: 2016",
    '4.7.1': "January 11: 2017",
    '4.7.2': "January 26: 2017",
    '4.7.3': "March 6: 2017",
    '4.7.4': "April 20: 2017",
    '4.7.5': "May 16: 2017",
    '4.7.6': "September 19: 2017",
    '4.7.7': "October 31: 2017",
    '4.7.8': "November 29: 2017",
    '4.7.9': "January 16: 2018",
    '4.7.10': "April 3: 2018",
    '4.7.11': "July 5: 2018",
    '4.7.12': "December 12: 2018",
    '4.7.13': "March 13: 2019",
    '4.7.14': "September 4: 2019",
    '4.7.15': "October 14: 2019",
    '4.7.16': "December 12: 2019",
    '4.7.17': "April 29: 2020",
    '4.8': "June 8: 2017",
    '4.8.1': "August 2: 2017",
    '4.8.2': "September 19: 2017",
    '4.8.3': "October 31: 2017",
    '4.8.4': "November 29: 2017",
    '4.8.5': "January 16: 2018",
    '4.8.6': "April 3: 2018",
    '4.8.7': "July 5: 2018",
    '4.8.8': "December 12: 2018",
    '4.8.9': "March 13: 2019",
    '4.8.10': "September 4: 2019",
    '4.8.11': "October 14: 2019",
    '4.8.12': "December 12: 2019",
    '4.8.13': "April 29: 2020",
    '4.9': "November 15: 2017",
    '4.9.1': "November 29: 2017",
    '4.9.2': "January 16: 2018",
    '4.9.3': "February 5: 2018",
    '4.9.4': "February 6: 2018",
    '4.9.5': "April 3: 2018",
    '4.9.6': "May 17: 2018",
    '4.9.7': "July 5: 2018",
    '4.9.8': "August 2: 2018",
    '4.9.9': "December 12: 2018",
    '4.9.10': "March 13: 2019",
    '4.9.11': "September 4: 2019",
    '4.9.12': "October 14: 2019",
    '4.9.13': "December 12: 2019",
    '4.9.14': "April 29: 2020",
    '5': "December 6: 2018",
    '5.0.1': "December 12: 2018",
    '5.0.2': "December 19: 2018",
    '5.0.3': "January 9: 2019",
    '5.0.4': "May 21: 2019",
    '5.0.6': "September 4: 2019",
    '5.0.7': "October 14: 2019",
    '5.0.8': "December 12: 2019",
    '5.0.9': "April 29: 2020",
    '5.1': "February 21: 2019",
    '5.1.1': "March 13: 2019",
    '5.1.2': "September 4: 2019",
    '5.1.3': "October 14: 2019",
    '5.1.4': "December 12: 2019",
    '5.1.5': "April 29: 2020",
    '5.2': "May 7: 2019",
    '5.2.1': "May 21: 2019",
    '5.2.2': "June 18: 2019",
    '5.2.3': "September 4: 2019",
    '5.2.4': "October 14: 2019",
    '5.2.5': "December 12: 2019",
    '5.2.6': "April 29: 2020",
    '5.3': "November 12: 2019",
    '5.3.1': "December 12: 2019",
    '5.3.2': "December 18: 2019",
    '5.3.3': "April 29: 2020",
    '5.4': "March 31: 2020",
    '5.4.1': "April 29: 2020",
}



// 5. Make it give you the root URL. 



// Initial start code
function start() {
    //grab links if it includes /wp-includes/

    // bucketOfUrls.forEach(url =>

    //     got(url).then(res => {
    //         const $ = cheerio.load(res.body);

    //         $('script').filter(isIncludes).each((i, link) => {
    //             const result = link.attribs.src;
    //             console.log(result);
    //         })

    //     }).catch(err => {
    //         console.log(err);
    //     })
    // )
}


//initialize function 
start();

