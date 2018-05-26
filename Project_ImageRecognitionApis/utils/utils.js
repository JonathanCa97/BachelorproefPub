const json2csv = require('json2csv').parse;
const { promisify } = require('util');
const fs = require('fs');
const writeFile = promisify(fs.writeFile);
const types = [
  'NORMAL',
  'ATTRIBUTES',
  'DARKER',
  'DISTANCE',
  'SIDE',
  'TIME',
  'ATTRIBUTES2',
];
const TYPESCOUNT = 8;

const wait = ms => {
  console.log('waiting ' + ms + ' ms');
  let start = new Date().getTime();
  let end = start;
  while (end < start + ms) {
    end = new Date().getTime();
  }
};

const writingResultsToCSV = async (jsonResults, name, type) => {
  // Prepare csv
  const fields = [
    'id',
    'url1',
    'url2',
    'confidence',
    'recognized',
    'responseTime',
    'detectedUrl1',
    'detectedUrl2',
  ];
  const csv = json2csv(jsonResults, fields);
  // Add to a csv
  console.log(name + 'TYPE' + type + ':: writing results to csv');
  await writeFile(name + '/' + name + '_TYPE' + type + '_RESULTS2.csv', csv);
  console.log(name + ':: saved file ' + name + '_TYPE' + type + '_RESULTS2');
};

module.exports = {
  wait,
  writingResultsToCSV,
  types,
  TYPESCOUNT,
};
