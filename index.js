'use strict';

const promisify = require('util').promisify;

const fs = require('fs');
require('log-timestamp');
const path = require('path');
const lockfile = require('proper-lockfile');

const CACHE_PATH =  process.argv[2] || '/data';

const LAST_CACHE_FILENAME = '.last';
const LOG_CACHE_FILENAME = 'lastLogFile';

const lastLogFile = path.join(CACHE_PATH, LAST_CACHE_FILENAME);

function touchSync2(path){
    if (fs.existsSync(path)) return;
    fs.closeSync(fs.openSync(path, 'a'));
}

((logPath)=>{
    if(fs.existsSync(logPath)) return;
    fs.mkdirSync(logPath);
})(CACHE_PATH)

function readLogLast() { ((cacheTo, cacheTo2) => {
    touchSync2(cacheTo);
    
    const rf = promisify(fs.readFile);
    const wf = promisify(fs.writeFile);

    function readLast2() { return rf(cacheTo2); }
    function writeLast2(msg){ return wf(cacheTo, msg, {
        flag: 'a'
    }) }
    
    const ret = true;
    console.log("cacheTo : ",cacheTo);
    console.log("cacheTo2 : ",cacheTo2);
 
    let last = null;
    let release = null;
    console.log("here0");
    return lockfile.lock(cacheTo).then((_release) => {
        release = _release;
        console.log("here1");
        return readLast2();
    }).then((lastMsg) => {
        last = lastMsg;
        console.log("lastMsg : ",lastMsg);
        console.log("last : ",last);
        return writeLast2(lastMsg+"\n");
    }).then(()=> {
        release();
        return (last + " " + ret);
    })


})( path.join(CACHE_PATH, LOG_CACHE_FILENAME),path.join(CACHE_PATH, LAST_CACHE_FILENAME) );
}

console.log(lastLogFile);

fs.watchFile(lastLogFile, (curr, prev) => {
  console.log(`${lastLogFile} file Changed`);
  readLogLast();
});