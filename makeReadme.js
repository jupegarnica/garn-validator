const fs = require('fs');


let readme = fs.readFileSync('./README.md','UTF-8');

const generate = name => `
#### ${name}

[${name}](https://github.com/jupegarnica/garn-validator/tree/master/tests/${name})

\`\`\`js
${fs.readFileSync(`tests/${name}`, 'UTF-8')}
\`\`\`
`

let test1 = generate('schema.test.js');
let test2 = generate('custom-validator.test.js');
let test3 = generate('errors.test.js');

readme = readme.replace(/(<!-- inject tests -->)(.|\s)*/, '$1' + test1 + test2 + test3);


fs.writeFileSync('./README.md', readme);
