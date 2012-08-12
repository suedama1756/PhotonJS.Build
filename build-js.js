var _vm = require('vm'),
    _fs = require('fs'),
    _path = require('path'),
    _build = require('build'),
    _system = require('system'),
    _os = require('os');

function loadModuleFile(moduleFile, callback) {
    _fs.readFile(moduleFile, function (err, moduleContent) {
        var module = null;
        if (!err) {
            try {
                module = _vm.runInThisContext(String(moduleContent));
            }
            catch (e) {
                err = e;
            }
        }

        callback(err, module);
    });
}

function buildModuleFiles(moduleFiles, options, callback) {
    var outstandingModuleCount = moduleFiles.length;

    var errors = [];
    moduleFiles.forEach(function (moduleFileName) {
        moduleFileName = _path.resolve(moduleFileName);

        var builder = new _build.ModuleBuilder(options);
        try {
            builder.buildFile(moduleFileName);
        }
        catch (e) {
            console.error(e);
        }

        if (!--outstandingModuleCount) {
            _system.callback(callback, errors.length ? new Error(errors.join(_os.EOL)) : null);
        }
    });
}

var options = require('./build-js-arguments').parse();
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