var _path = require('path'),
    _build = require('module-build'),
    _system = require('system'),
    _os = require('os'),
    _fwatch = require('fwatch'),
    _fs = require('fs');


var watchers = {

};

function containsNonOutputFile(files, outputs) {
    if (!files) {
        return false;
    }
    for (var i = 0, n = files.length; i < n; i++) {
        if (outputs.indexOf(files[i]) === -1)
        return true;
    }
    return false;
}

function buildModuleFiles(moduleFiles, options, callback) {
    var outstandingModuleCount = moduleFiles.length;

    var errors = [];
    moduleFiles.forEach(function (moduleFileName) {
        moduleFileName = _path.resolve(moduleFileName);

        var builder = new _build.ModuleBuilder(options), outputs;
        try {
            outputs = builder.buildFile(moduleFileName);
        }
        catch (e) {
            console.error(e);
        }


        if (options.monitor) {
            var moduleDirectory = _path.dirname(moduleFileName);
            var watcher = watchers[moduleFileName] = new _fwatch.DirectoryWatcher(moduleDirectory);

            _fs.watchFile(moduleDirectory, function() {
                 console.log('changed');
            });
            watcher.on('change', function (created, deleted, modified) {
                var outputFiles = [outputs.srcOutput, outputs.mapOutput];
                if (containsNonOutputFile(created, outputFiles) ||
                    containsNonOutputFile(deleted, outputFiles) ||
                    containsNonOutputFile(modified, outputFiles)) {
                    outputs = builder.buildFile(moduleFileName);
                }
            });
        }

        if (!--outstandingModuleCount) {
            _system.callback(callback, errors.length ? new Error(errors.join(_os.EOL)) : null);
        }
    });
}

var options = _build.options.parse();
buildModuleFiles(options.modules, options);

//var exampleFolder = _path.resolve('Examples\\Example1');
//var _fwatch = require('fwatch');

//var fileWatcher = new _fwatch.FileWatcher('D:\\PhotonJS\\Build\\Examples\\Example1');
//fileWatcher.watchFiles(['file01.js', 'file02.js', 'Nested\\Foo\\file01.js']);
//fileWatcher.on('change', function (files) {
//        console.log(files.join('\r\n'));
//    }
//);

//var directoryWatch = new _fwatch.DirectoryWatcher('D:\\Work\\PhotonJS\\Build\\Examples\\Example1');
//directoryWatch.on('change', function(created, deleted, modified) {
//    console.log('Created: ' + created.join('\n\n'));
//    console.log('Deleted: ' + deleted.join('\n\n'));
//    console.log('Modified: ' + modified.join('\n\n'));
//});

if (options.monitor) {
    var readLine = require('readline');

    var rl = readLine.createInterface({
        input:process.stdin,
        output:process.stdout
    });

    rl.on("line", function (text) {
        if (text.toLowerCase() === 'exit') {
            rl.close();
        }
    });
}