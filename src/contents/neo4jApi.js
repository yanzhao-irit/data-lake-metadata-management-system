let neo4j = require('neo4j-driver');
const fs = require('fs');


// console.log(`${__dirname}/../store-password.json`);

// let pwd = JSON.parse(fs.readFileSync(`${__dirname}/../store-password.json`));


module.exports.neo4j = neo4j;
module.exports.neo4j2 = neo4j;