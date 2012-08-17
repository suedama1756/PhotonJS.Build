var _build = require('../../node_modules/module-build/module-build.js'),
    _system = require('../../node_modules/system/system.js'),
    _os = require('os');

var basicModule = {
    name:'module',
    dependencies:{
        '$':{
            amd:'jquery',
            global:'jQuery'
        }
    }
};

var nestedNamespaceModule = {
    name:'nested.module',
    dependencies:{
        '$':{
            amd:'jquery',
            global:'jQuery'
        }
    }
}

var environmentModule = {
    name:'module',
    environment:{
        dependencies:[
            // Name of environmental variable
            'window',
            // Name of environmental variable using object notation
            {
                name : 'navigator'
            },
            // Name of environmental variable using an alias for referencing the variable within module scope
            {
                name : 'document', alias : 'doc'
            }
        ]
    }
}

var mixinModule = {
    name : 'module',
    dependencies : {
        '$' : {
            amd : ['jquery', 'jquery.ui.core'],
            global : 'jQuery'
        }
    }
}

var anonymousModule = {
    name : 'module',
    dependencies: {
        '<<anonymous>>' : {
            amd : ['jquery', 'jquery.ui.core']
        }
    }
}


var basicModuleContent = [
    'var data = "";',
    'module.getData = function() { return data; };',
    'module.setData = function(value) { data = value; };',
    'factoryParameters["$"] = $;'];

var environmentModuleContent = [
    'window.isAccessible = true;',
    'doc.isAccessible = true;',
    'navigator.isAccessible = true;'];

function generateModule(module, options, content) {
    var generator = new _build.ModuleWrapperGenerator(module, options),
        result = generator.generate(content);
    result = [
        result.header,
        _system.string.indent(content.join(_os.EOL), result.contentIndent, '    '),
        result.footer].join(_os.EOL);
    console.log(result + _os.EOL + _os.EOL);
    return result;
}

function generateAndEvaluateModule(module, options, content) {
    var moduleText = generateModule(module, options, content);
    eval(moduleText);
    return moduleText;
}

var define;
var defineDependencies;
var factoryParameters;
var defineLog;

// Define window so we can hang stuff off it using eval
var window, navigator, document;

function resolveDependencies(dependencies) {
    return dependencies.map(function (dependency) {
        if (dependency === 'exports') {
            return {};
        } else {
            return {
                name:dependency
            }
        }
    });
}

function mockAmd() {
    // define log
    defineLog = [];

    // define mapped dependencies (object that holds the dependencies as they are known by the internals of the module)
    factoryParameters = {};

    // mock define
    define = function (dependencies, factory) {
        defineLog.push(
            {
                dependencies:dependencies,
                factory:factory
            });
        factory.apply(null, defineDependencies = resolveDependencies(dependencies));
    };
    define.amd = {};
    return {
        close:function () {
            define = undefined;
            defineLog = undefined;
            defineDependencies = undefined;
        }
    }
}

function mockGlobal() {
    // define window
    window = {
        jQuery:{
            name:'jquery'
        }
    };

    navigator = {};

    document = {};

    // define mapped dependencies (object that holds the dependencies as they are known by the internals of the module)
    factoryParameters = {};

    return {
        close:function () {
            window = undefined;
            navigator = undefined;
            document = undefined;
        }
    }
}

function mockAmdAndGlobal() {
    var mockAmdHandle = mockAmd(), mockGlobalHandle = mockGlobal();
    return {
        close:function () {
            mockAmdHandle.close();
            mockGlobalHandle.close();
        }
    }
}

exports['When generating AMD'] = {
    setUp:function (callback) {
        this.mock_ = mockAmd();
        generateAndEvaluateModule(basicModule, { formats:['amd'] },
            basicModuleContent);
        callback();
    },
    tearDown:function (callback) {
        this.mock_.close();
        callback();
    },
    'Should invoke define with correct dependencies':function (test) {
        test.deepEqual(defineLog[0].dependencies,
            ['exports', 'jquery']);
        test.done();
    }
};

exports["When generating Global"] = {
    setUp:function (callback) {
        this.mock_ = mockGlobal();
        generateAndEvaluateModule(basicModule, { formats:['global'] },
            basicModuleContent);
        callback();
    },
    tearDown:function (callback) {
        this.mock_.close();
        callback();
    },
    "Should define global namespace":function (test) {
        test.ok(window.module,
            'Global module has not been defined.');
        test.done();
    },
    "Should name dependencies correctly in factory":function (test) {
        test.ok(factoryParameters['$'].name === 'jquery');
        test.done();
    },
    "Should correctly attach content to the global namespace":function (test) {
        window.module.setData(1);
        test.ok(window.module.getData() === 1,
            'Module content has not been defined correctly.');
        test.done();
    }
};

exports['When generating both AMD and Global'] = {
    setUp:function (callback) {
        this.mock_ = mockAmdAndGlobal();
        generateAndEvaluateModule(basicModule, { formats:['amd', 'global'] },
            basicModuleContent);
        callback();
    },
    tearDown:function (callback) {
        this.mock_.close();
        callback();
    },
    'Should prioritise AMD over Global':function (test) {
        // verify we prioritized AMD over Global
        test.ok(!window.module);
        test.deepEqual(defineLog[0].dependencies,
            ['exports', 'jquery']);
        test.done();
    }
};

exports['When generating Global with nested namespace'] = {
    setUp:function (callback) {
        this.mock_ = mockGlobal();
        generateAndEvaluateModule(nestedNamespaceModule, { formats:['global'] },
            basicModuleContent);
        callback();
    },
    tearDown:function (callback) {
        this.mock_.close();
        callback();
    },
    "Should define global namespace":function (test) {
        test.ok(window.nested.module,
            'Global module has not been defined.');
        test.done();
    },
    "Should correctly attach content to the global namespace":function (test) {
        window.nested.module.setData(1);
        test.ok(window.nested.module.getData() === 1,
            'Module content has not been defined correctly.');
        test.done();
    }
}


exports['When generating with environmental dependencies'] = {
    setUp:function (callback) {
        this.mock_ = mockGlobal();
        generateAndEvaluateModule(environmentModule, { formats:['global'] },
            environmentModuleContent);
        callback();
    },
    tearDown:function (callback) {
        this.mock_.close();
        callback();
    },
    "Should wrap with environmental access function":function (test) {
        test.ok(navigator.isAccessible);
        test.ok(document.isAccessible);
        test.ok(window.isAccessible);
        test.done();
    }
}

exports['When generating with amd mixin'] = {
    setUp:function (callback) {
        this.mock_ = mockAmd();
        this.moduleText_ = generateAndEvaluateModule(mixinModule,
            {
                formats:['amd']
            }, []);
        callback();
    },
    tearDown : function(callback) {
        this.mock_.close();
        callback();
    },
    'Should invoke define with correct dependencies':function (test) {
        test.deepEqual(defineLog[0].dependencies,
            ['exports', 'jquery', 'jquery.ui.core']);
        test.done();
    },
    'Should create factory with correct number of arguments':function (test) {
        test.ok(/function\(module, \$\)/gi.test(this.moduleText_));
        test.done();
    }
}

exports['When generating with amd anonymous'] = {
    setUp:function (callback) {
        this.mock_ = mockAmd();
        this.moduleText_ = generateAndEvaluateModule(anonymousModule,
            {
                formats:['amd']
            }, []);
        callback();
    },
    tearDown : function(callback) {
        this.mock_.close();
        callback();
    },
    'Should invoke define with correct dependencies':function (test) {
        test.deepEqual(defineLog[0].dependencies,
            ['exports', 'jquery', 'jquery.ui.core']);
        test.done();
    },
    'Should create factory with correct number of arguments':function (test) {
        test.ok(/function\(module\)/gi.test(this.moduleText_));
        test.done();
    }
}

exports['When generating with global anonymous'] = {
    setUp:function (callback) {
        this.mock_ = mockGlobal();
        this.moduleText_ = generateAndEvaluateModule(anonymousModule,
            {
                formats:['global']
            }, []);
        callback();
    },
    tearDown : function(callback) {
        this.mock_.close();
        callback();
    },
    'Should create factory call with correct number of arguments' : function(test) {
        test.ok(/factory\(ns\);/gi.test(this.moduleText_));
        test.done();
    },
    'Should create factory with correct number of arguments':function (test) {
        test.ok(/function\(module\)/gi.test(this.moduleText_));
        test.done();
    }
}

exports['When generating with version specified in options'] = {
    setUp:function (callback) {
        this.mock_ = mockGlobal();
        this.moduleText_ = generateAndEvaluateModule(basicModule,
            {
                formats:['global'],
                version:'0.1.2.3'
            }, ['module.isInitialized = true;']);
        callback();
    },
    tearDown : function(callback) {
        this.mock_.close();
        callback();
    },
    'Should apply version' : function(test) {
        test.ok(window.module.version === '0.1.2.3');
        test.done();
    }
}

exports['When generating with version specified in module'] = {
    setUp:function (callback) {
        this.mock_ = mockGlobal();
        this.moduleText_ = generateAndEvaluateModule({ name : 'module', version : '1.2.3.4'},
            {
                formats:['global']
            }, []);
        callback();
    },
    tearDown : function(callback) {
        this.mock_.close();
        callback();
    },
    'Should apply version' : function(test) {
        test.ok(window.module.version === '1.2.3.4');
        test.done();
    }
}

exports['When generating with version specified in module and options'] = {
    setUp:function (callback) {
        this.mock_ = mockGlobal();
        this.moduleText_ = generateAndEvaluateModule({ name : 'module', version : '1.2.3.4'},
            {
                formats:['global'],
                version:'0.1.2.3'
            }, []);
        callback();
    },
    tearDown : function(callback) {
        this.mock_.close();
        callback();
    },
    'Should apply version from options' : function(test) {
        test.ok(window.module.version === '0.1.2.3');
        test.done();
    }
}

exports['When generating amd with no dependencies'] = {
    setUp:function (callback) {
        this.mock_ = mockAmd();
        this.moduleText_ = generateAndEvaluateModule({ name : 'module' },
            {
                formats:['amd'],
                version:'0.1.2.3'
            }, []);
        callback();
    },
    tearDown : function(callback) {
        this.mock_.close();
        callback();
    },
    'Should generate factory call correctly' : function(test) {
        test.ok(window.module.version === '0.1.2.3');
        test.done();
    }
}