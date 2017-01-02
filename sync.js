'use strict';

var spawn = require('child_process').spawn,
    fs = require('fs'),
    config = require('./env.js');

function exec(commandName, params, callback) {
    var command = spawn(commandName, params),
        hasError = false;

    command.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    command.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });

    command.on('close', (code) => {
        // console.log(`child process exited with code ${code}`);

        if (!hasError && typeof callback === 'function') {
            callback();
        }
    });
}

function removeFrontendCode() {
    return new Promise((resolve, reject) => {
        console.log('--- remove frontend ---');
        var path = config.codePath,
            pathExist = fs.existsSync(path);

        if (pathExist) {
            exec('rm', ['-rf', config.codePath], resolve);
        }else{
            resolve();
        }
    });
}

function getFrontendCode() {
   return new Promise((resolve, reject) => {
       console.log('--- get frontend code ---');
       removeFrontendCode().then(function() {
           try{
               exec('git', ['clone', 'https://github.com/enhuizhu/reactEs6.git', config.codePath], resolve);
           }catch(e) {
               reject(e);
           }
       });
   });
}


function createSymbolLink() {
    return new Promise((resolve, reject) => {
        try{
            exec('ln', ['-s', config.cmsPath, config.codePath + '/public/cms'], resolve);
        }catch(e) {
            reject(e);
        }
    });
}

function removeUnusedFiles(){
    fs.readdir(config.codePath, (err, files) => {
        files.forEach(file => {
            if (file !== 'public') {
                console.log('remove ' + file);
                exec('rm', ['-rf', config.codePath + '/' + file]);
                // fs.unlinkSync(config.codePath + "/" + file);
            }
        });
    });
}

getFrontendCode().then(() => {
    createSymbolLink().then(() => {
        removeUnusedFiles();
    }); 
});