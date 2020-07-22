const fs = require('fs');


let readme = fs.readFileSync('./README.md','UTF-8');
let test = fs.readFileSync('tests/use.test.js', 'UTF-8');

// console.log(readme.match(/(All\sit\scan\sdo(.|\s)*```js)/))
readme = readme.replace(/(All\sit\scan\sdo[\s]*```js)(.|\s)*(```)/m, '$1\n' + test +'$3');


fs.writeFileSync('./README.md', readme);
