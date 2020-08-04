let firstObject = { apple: "a" };
let secondObject = { lemon: "l"};
let thirdObject = { pickle: "p"};

let wrapObjects = [firstObject, secondObject]; 

wrapObjects.push(thirdObject);

for (const fruit of wrapObjects) {
  if ( fruit.hasOwnProperty('apple') ) {
    console.log("there are apples");
  } else {
    console.log("fail");
  }
}



// let newObject = Object.entries(wrapObjects).forEach([key, value]) => {
console.log(wrapObjects);



```
  // promise callback chain
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
    function asyncFunction(item, cb) {
        setTimeout(() => {
            got(item)
                .then(res => {
                    console.log("starting on: ", item);

                    const $ = cheerio.load(res.body);
                    $('script')
                        .filter(isIncludes)
                        .filter(checkForVersionMatch)
                        .each((i, link) => {
                            let tempObject = new Object();

                            //const result = link.attribs.src;
                            console.log("*", link.attribs.src);


                            console.log("link.version", link.version);
                            tempObject.site = item;
                            tempObject.version = link.version;
                            tempObject.link = link.attribs.src;
                            addToCSVObject(itsTheContent, tempObject);
                        })
                })
                .catch(err => {
                    console.log(err);
                })

            console.log('done with', item);
            cb();
        }, 100);
    }

    // var theArray = [1, 2, 3, 4, 5];

    let requests = bucketOfUrls.reduce((promiseChain, item) => {
        return promiseChain.then(() => new Promise((resolve) => {
            asyncFunction(item, resolve);
        }));
    }, Promise.resolve());

    requests.then(() => {
        console.log("done");
        console.log(itsTheContent);
    });
```



## New test that works

```

    // create a function that it's only goal is to get the url link and return it.
    // when the promise is finished, it spitsit outl.

    const returnTitleFromSite = (url) => {
        return new Promise((resolve, reject) => {
            got(url).then(res => {
                console.log("starting on: ", url);
                const $ = cheerio.load(res.body);

                const title = $('title');
                resolve(title.text());

            })
        })
    }

    arrayOfPromises = [
        returnTitleFromSite("https://www.processagent.com/"),
        returnTitleFromSite("https://www.texasregisteredagents.com/")
    ]
    // returnTitleFromSite("https://www.processagent.com/").then(result => {
    //     console.log("promise ->");
    //     console.log(result);
    // });

    Promise.all(arrayOfPromises).then(result => {
        console.log("promise ->");
        console.log(result);
    });


```