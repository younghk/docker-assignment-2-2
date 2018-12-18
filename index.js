'use strict';

const promisify = require('util').promisify;

const fs = require('fs');
require('log-timestamp');
const path = require('path');

const CACHE_PATH =  process.argv[2] || '/data';

const LOG_CACHE_FILENAME = 'lastLogFile';

function touchSync2(path){
    if (fs.existsSync(path)) return;
    fs.closeSync(fs.openSync(path, 'a'));
}

((logPath)=>{
    if(fs.existsSync(logPath)) return;
    fs.mkdirSync(logPath);
})(CACHE_PATH)

const readLogLast = ((cacheTo) => {
    touchSync2(cacheTo);
    
    const rf = promisify(fs.readFile);
    const wf = promisify(fs.writeFile);

    function readLast2() { return rf(cacheTo); }
    function writeLast2(msg){ return wf(cacheTo, msg, {
        flag: 'a'
    }) }
    
    const msg = readLast2();

    return writeLast2(msg);

})( path.join(CACHE_PATH, LOG_CACHE_FILENAME) );

fs.watchFile(lastLogFile, (curr, prev) => {
  console.log(`${lastLogFile} file Changed`);
  readLogLast().then(() => {
    console.log('done');
  });
});