var _build = require('../../node_modules/build/build.js');

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
    name : 'nested.module',
    dependencies:{
        '$' : {
            amd:'jquery',
            global:'jQuery'
        }
    }
}

var basicModuleContent = [
    'var data = "";',
    'module.getData = function() { return data; };',
    'module.setData = function(value) { data = value; };',
    'factoryParameters["$"] = $;'];

function generateModule(module, options, content) {
    var generator = new _build.ModuleWrapperGenerator(module, options),
        result = generator.generate(content);
    console.log(result);
    return result;
}

function generateAndEvaluateModule(module, options, content) {
    var moduleText = generateModule(module, options, content);
    eval(moduleText);
}

var define;
var defineDependencies;
var factoryParameters;
var defineLog;

// Define window so we can hang stuff off it using eval
var window;

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

    // define mapped dependencies (object that holds the dependencies as they are known by the internals of the module)
    factoryParameters = {};

    return {
        close:function () {
            window = null;
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
    tearDown : function(callback) {
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
