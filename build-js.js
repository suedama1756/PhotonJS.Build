var _vm = require('vm'),
    _fs = require('fs'),
    _path = require('path'),
    _build = require('build'),
    _system = require('system');


function parseSwitchParameters(cmdSwitch, args, index, result, maxParameterCount) {
    var count = 0;
    while (index < args.length && args[index].substring(0, 1) != '--') {
        if (maxParameterCount && ++count > maxParameterCount) {
            throw new Error("Invalid number of parameters for command switch '{0}'.", cmdSwitch);
        }
        result.push(args[index++]);
    }

    return index;
}

var moduleFiles = [], args = process.argv, i = 2, n = args.length;
while (i < n) {
    var cmdSwitch = args[i];
    switch (args[i]) {
        case '--jsm':
            i = parseSwitchParameters('--jsm', args, i + 1, moduleFiles);
            break;
        default:
            throw new Error(_system.format("Invalid command switch '{0}'.", cmdSwitch))
    }
}

if (moduleFiles.length === 0) {
    throw new Error("No module files specified, user hte --jsm switch to specify one or more module files.");
}


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

function buildModuleFiles(moduleFiles, callback) {
    var outstandingModuleCount = moduleFiles.length;

    var errors = [];
    moduleFiles.forEach(function (moduleFileName) {
        moduleFileName = _path.resolve(moduleFileName);
        loadModuleFile(moduleFileName, function (err, module) {
            outstandingModuleCount--;
            if (err) {
                errors.push(_system.string.format("Failed to load module file '{0}', error: '{1}'.",
                    moduleFileName, err.message));
            }
            else {
                var generator = new _build.ModuleWrapperGenerator(module, {});
                console.log(generator.generate());
            }

            if (!outstandingModuleCount) {
                _system.callback(callback, errors.length ? new Error(errors.join('\r\n')) : null);
            }
        });
    });
}

buildModuleFiles(moduleFiles);

//process.stdin.resume();
//process.stdin.setEncoding('utf8');
//process.stdin.on('data', function (chunk) {
//    if (chunk && chunk.toLowerCase() === 'exit') {
//        process.exit(0);
//    }
//});
//
