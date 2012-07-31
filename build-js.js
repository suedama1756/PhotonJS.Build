var _vm = require('vm'),
    _fs = require('fs'),
    _path = require('path'),
    _build = require('build'),
    _system = require('system');

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

        var _build = require('build');

        loadModuleFile(moduleFileName, function (err, module) {
            outstandingModuleCount--;
            if (err) {
                errors.push(_system.string.format("Failed to load module file '{0}', error: '{1}'.",
                    moduleFileName, err.message));
            }
            else {
                var generator = new _build.ModuleWrapperGenerator(module, options);
                console.log(generator.generate());
            }

            if (!outstandingModuleCount) {
                _system.callback(callback, errors.length ? new Error(errors.join(_os.EOL)) : null);
            }
        });
    });
}

var arguments = require('./build-js-arguments').parse();
//buildModuleFiles(arguments.modules, {
//    formats:arguments.formats
//});

var exampleFolder = _path.resolve('Examples\\Example1');
var _directory = require('directory')
var watcher = new _directory.Watcher(exampleFolder);
watcher.addFiles(['file1.js', 'file2.js', 'module.jsm']);
watcher.on('change', function (files) {
        console.log(files.join('\r\n'));
    }
);


if (arguments.watch) {
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
