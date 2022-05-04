a = [1, -2, 3, -4, 5];

// let b = a.find((item) => {
//   return item === 1;
// });

// console.log(b);

// let c = a.filter((item) => item >= 2);

// console.log(c);

// const test = {
//   q: 1,
//   w: 2,
//   e: 3,
// };

// let test2 = { ...test };

// console.log(test2);

let d = a.map((items) => ({
  value: items,
}));

// In JS if you return an object you have to wrap it in ()
console.log(d);

const data = require("./src/translations/en");
console.log(data);
