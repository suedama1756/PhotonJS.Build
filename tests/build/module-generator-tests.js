var _build = require('../../node_modules/module-build/module-build.js'),
    _system = require('../../node_modules/system/system.js'),
    _os = require('os');

function generateModule(module, options) {
    var generator = new _build.ModuleGenerator(options),
        result = generator.generate(module);
    return result.src;
}

function generateAndEvaluateModule(module, options) {
    var moduleText = generateModule(module, options);
    console.log(moduleText);
    eval(moduleText);
    return moduleText;
}

var dynamicVariable = 0;
var window = {};

exports['When generating with dynamic files'] = {
    setUp:function (callback) {
        this.moduleText_ = generateAndEvaluateModule({
                name : 'module',
                files : [
                    function(writer) {
                        writer.writeln('(function() {');
                        writer.increaseIndent();
                        writer.writeln('dynamicVariable = 2;');
                        writer.decreaseIndent();
                        writer.writeln('})();');
                    }
                ]
            },
            {
                formats:['global'],
                version:'0.1.2.3'
            });
        callback();
    },
    tearDown : function(callback) {
        callback();
    },
    'Should generate factory call correctly' : function(test) {
        test.ok(dynamicVariable === 2);
        test.done();
    }
}
