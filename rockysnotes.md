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