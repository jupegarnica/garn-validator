const fs = require('fs');


let readme = fs.readFileSync('./README.raw.md','UTF-8');
let test = fs.readFileSync('src/use.test.js', 'UTF-8');

readme = readme.replace('// import(use.test.js)', test);


fs.writeFileSync('./README.md', readme);
