var _system = require('system');

function parseSwitchParameters(commandSwitch, args, index, result, maxParameterCount) {
    var count = 0;
    if (index === args.length) {
        throw new Error("No value specified for command switch {0}.", commandSwitch);
    }

    while (index < args.length && args[index].substring(0, 2) != '--') {
        if (maxParameterCount && ++count > maxParameterCount) {
            throw new Error("Invalid number of parameters for command switch '{0}'.", commandSwitch);
        }
        result.push(args[index++]);
    }

    return index;
}

exports.parse = function () {
    var arguments = {
            modules:[],
            watch:false
        },
        argv = process.argv, i = 2, n = argv.length;

    while (i < n) {
        var commandSwitch = argv[i];
        switch (argv[i]) {
            case '--jsm':
                i = parseSwitchParameters('--jsm', argv, i + 1, arguments.modules);
                break;
            case '--formats':
                i = parseSwitchParameters('--formats', argv, i + 1, arguments.formats = []);
                break;
            case '--watch':
                watch = true;
                break;
            default:
                throw new Error(_system.format("Invalid command switch '{0}'.", commandSwitch))
        }
    }

    if (arguments.modules.length === 0) {
        throw new Error("No module files specified, use the --jsm switch to specify one or more module files.");
    }

    return arguments;
}
