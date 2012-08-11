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

        var _build = require('build');

        loadModuleFile(moduleFileName, function (err, module) {
            outstandingModuleCount--;
            if (err) {
                errors.push(_system.string.format("Failed to load module file '{0}', error: '{1}'.",
                    moduleFileName, err.message));
            }
            else {
                var generator = new _build.ModuleGenerator(options), basePath = _path.dirname(moduleFileName);
                var output = generator.generate(module, basePath);
                output.src += _system.string.format('{0}//@ sourceMappingURL={1}.js.map',
                    _os.EOL, module.name)
                _fs.writeFileSync(_path.join(basePath, module.name + '.js'), output.src);
                _fs.writeFileSync(_path.join(basePath, module.name + '.js.map'), output.map);
            }

            if (!outstandingModuleCount) {
                _system.callback(callback, errors.length ? new Error(errors.join(_os.EOL)) : null);
            }
        });
    });
}

var arguments = require('./build-js-arguments').parse();
buildModuleFiles(arguments.modules, {
    formats:arguments.formats,
    errorStrategy:_build.ModuleGenerator.ERROR_STRATEGY_TODO
});

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

if (arguments.watchFiles) {
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
