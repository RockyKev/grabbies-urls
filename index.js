const fs = require('fs');
const cheerio = require('cheerio');
const got = require('got');

//TODO LIST: 
// Put it in a json file or csv file. 
// keep the URL
// test with other wordpress sites
// Maybe make it accurate by identifying all the wordpress versions? (https://codex.wordpress.org/WordPress_Versions)
// Make it give you the root URL. 

const bucketOfUrls = [
    "https://bluetigerstudio.com/",
    "https://wsu.edu/",
    "https://www.houstonzoo.org/"

]

//grab links if it includes /wp-includes/

bucketOfUrls.forEach(url =>

    got(url).then(res => {
        const $ = cheerio.load(res.body);

        $('script').filter(isIncludes).each((i, link) => {
            const result = link.attribs.src;
            console.log(result);
        })

    }).catch(err => {
        console.log(err);
    })

)

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

// function whatWeWant(content) {

//     content('script').each((i, link) => {
//         const href = link.attribs.src;
//         console.log(href);

//     })

//     // console.log(content);
// }
