'use strict';

const promisify = require('util').promisify;

const fs = require('fs');
require('log-timestamp');
const path = require('path');
const lockfile = require('proper-lockfile');

const CACHE_PATH =  process.argv[2] || '/data';

const LAST_CACHE_FILENAME = '.last';
const LOG_CACHE_FILENAME = 'lastLogFile';

const LAST_LOG_PATH_FILE = path.join(CACHE_PATH, LAST_CACHE_FILENAME);

function matchSync2(path){
    if (fs.existsSync(path)) return;
    fs.closeSync(fs.openSync(path, 'a'));
}

((LOG_PATH)=>{
    if(fs.existsSync(LOG_PATH)) return;
    fs.mkdirSync(LOG_PATH);
})(CACHE_PATH)

function readLogLast() { ((cacheTo, cacheTo2) => {
    matchSync2(cacheTo);
    
    const rf = promisify(fs.readFile);
    const wf = promisify(fs.writeFile);

    function readLast() { return rf(cacheTo2); }
    function writeLast(message){ return wf(cacheTo, message, {flag: 'a'}) }
    
    const ret = true;
 
    let last = null;
    let release = null;
    return lockfile.lock(cacheTo).then((_release) => {
        release = _release;
        return readLast();
    }).then((lastMsg) => {
        last = lastMsg;
        return writeLast(lastMsg+"\n");
    }).then(()=> {
        release();
        return (last + " " + ret);
    })


})( path.join(CACHE_PATH, LOG_CACHE_FILENAME),path.join(CACHE_PATH, LAST_CACHE_FILENAME) );
}

console.log(LAST_LOG_PATH_FILE);

fs.watchFile(LAST_LOG_PATH_FILE, (curr, prev) => {
  console.log(`${LAST_LOG_PATH_FILE} file Changed`);
  readLogLast();
});