const fs = require('fs');


let readme = fs.readFileSync('./README.md','UTF-8');
let test = fs.readFileSync('tests/examples.test.js', 'UTF-8');

readme = readme.replace(/(All\sit\scan\sdo[\s]*```js)(.|\s)*(```)/m, '$1\n' + test +'$3');


fs.writeFileSync('./README.md', readme);
