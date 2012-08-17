PhotonJS.Build
==============

NodeJS based build tools developed for [PhotonJS](https://github.com/suedama1756/PhotonJS)

There are currently a few different JavaScript module formats out in the wild, and it's true to say that there are
mixed opinions on the various approaches. In addition to this, it now seems that ECMA (Harmony) support for modules
will be postponed till a future version.

Personally, I believe that the module patterns shown in many examples confuse dependency injection concepts with
packaging, and do not address the needs of modern large scale enterprise applications
(hopefully I'll have time to elaborate on this in a blog sometime).

Regardless of these facts/opinions the following statements are probably true:

* We don't want to tie ourselves too tightly to a specific module format.
* We don't want to write more dependency management code per file than functional code.
* We want a fluent development experience that does not discourage refactoring.
* We want to easily support ECMA/future modules formats without too much effort.

PhotonJS.Build hopes to address these issues.

Module Builder
--------------

The PhotonJS.Build module builder can be used to build module files supporting multiple module formats, including
'amd' and 'global'. Module packaging information is maintained in a JavaScript Module (.jsm) file. By placing module
packaging information in a separate file developers do not have to pollute their source code with module specific
semantics, they can focus on writing clear maintainable code which can be deployed easily to a variety of module formats.

Example module file:

```javascript
({
    name:'photon.examples.module',
    /**
     * Module version number.
     */
    version:'0.7.0.2',
    /**
     * An ordered list of the files that make up the module.
     */
    files:[
        'file01.js',
        'file02.js'
    ],
    /**
     * Module dependencies
     */
    dependencies:{
        /**
         * '$' The variable that will be used to reference the dependency
         */
        '$':{
            /**
             * The AMD dependency
             */
            amd:'jquery',
            /**
             * The global dependency, resolved as window.jQuery
             */
            global:'jQuery'
        }
    },
    environment:{
        /**
         * Optional environment dependencies
         */
        dependencies:[
            /**
             * Reference window using a parameter named 'window'
             */
            'window',
            /**
             * Reference document using a parameter named 'doc'.
             */
            {
                alias:'doc',
                name:'document'
            }]
    },
    /**
     * Configuration information
     */
    configuration:{
        debug:{
            srcOutput:'../output/%module%-debug.js',
            mapOutput:'../output/%module%-debug.js.map'
        }
    }
});
```

Building via the command line:

    node build-js.js --jsm Examples/Example1/module.jsm --add-source-map-directive
        --configuration debug

Output:

```javascript
(function(window, doc){
    (function(factory) {
        if (typeof define === 'function' && define.amd]) {
            define(['exports', 'jquery'], factory);
        } else if (window) {
            var nsi = 'photon.examples.module'.split('.'), ns = window;
            for (var i= 0, n=nsi.length; i<n; i++) {
                ns = ns[nsi[i]] = ns[nsi[i]] || {};
            }
            factory(ns, window.jQuery);
        }
    })(function(module, $) {
        /**
         * Gets a message from file 1
         * @return {String}
         */
        module.getMessage1 = function () {
            return "Message from file 1.";
        }
        /**
         * Gets a message from file 2
         * @return {String}
         */
        module.getMessage2 = function() {
            return "Message from file 2.";
        }
    });
})(window, document);
//@ sourceMappingURL=photon.examples.module-debug.js.map
```

Source Maps
-----------

Source maps are automatically created for the module. Source maps allow you to debug the module as
if you had deployed the individual files it is comprised of (currently only supported in chrome). For more
information on source maps including how to enable them,
check out http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/

File Monitoring
---------------

When developing it can be useful to have you modules rebuilt automatically whenever you change any of its files. To
enable this, simply specify the --monitor option.

Example:

    node build-js.js --jsm Examples/Example1/module.jsm --add-source-map-directive
        --configuration debug --monitor

Error Strategies
----------------

During development files may get renamed, deleted, etc. because of this it may be useful to specify how missing module
files should be handled. There are three different options:

* IGNORE: Ignore errors
* THROW:  An exception it thrown
* TODO:   A '// TODO: ' comment is output in the module file which provides details of the missing file.

Example:

    node build-js.js --jsm Examples/Example1/module.jsm --add-source-map-directive
        --configuration debug --monitor --error-strategy TODO

Output Formats
--------------

By default, the module produced will support all available formats (current 'amd' & 'global'). To manually specify
which formats the module should support use the --formats command line option.

Example:

    node build-js.js --jsm Examples/Example1/module.jsm --add-source-map-directive
        --configuration debug --formats amd

Versioning
----------

Modules can be versioned by specifying a version property in the '.jsm' file, or using the '--version' command line
switch. If both are specified the command line '--version' wins.

Example:

    node build-js.js --jsm Examples/Example1/module.jsm --add-source-map-directive
        --configuration debug --formats global --version 0.7.0.2

```javascript
({
    name : 'myModule',
    version: 0.7.0.1
})
```

Generates:

```javascript
(function(factory) {
    if (window) {
        var ns = window.myModule = window.myModule || {};
        factory(ns);
    }
})(function(myModule) {
    myModule.version = '0.7.0.2';
});
```

Advanced AMD RequireJS Options
----------------------------

In AMD shims can be used to import modules that add themselves to existing global namespaces. For example,
jquery.ui.core does not directly export anything, it simply adds itself to jquery/$. The 'amd' dependencies
section supports this mechanism in two ways.

```javascript
dependencies : {
    '$' : {
        // multiple dependencies are pulled in and exposed via the '$' factory parameter.
        amd : ['jquery', 'jquery.ui.core']
    }
}
```

```javascript
dependencies: {
    //  define dependency without exposing it as a factory parameter.
    '<<anonymous>>' : {
        amd : ['jquery', 'jquery.ui.core']
    }
}
```

Grunt Support
-------------

[Grunt](https://github.com/cowboy) support is provided via the 'module' task. The example below demonstrates how
to configure the grunt.js file to build a module. It also shows how the 'watch' task
can be used to trigger builds automatically whenever a file changes.

```javascript
/*global module:false*/
module.exports = function (grunt) {
    grunt.initConfig({
        module:{
            photon:{
                jsm:'../source/core/photon.jsm',
                options:{
                    configuration:'debug',
                    version:'0.7.0.1'
                }
            }
        },
        watch: {
           module : {
               files: ['../source/core/**/*.js', '../source/core/**/*.jsm'],
               tasks: 'module'
           }
        },
        lint: {
            files: ['grunt.js', '../output/photon-debug.js']
        }
    });

    // default task.
    grunt.registerTask('default', 'module lint');

    // load module-grunt tasks
    grunt.loadTasks('../../Build/node_modules/module-grunt');
};
```

Example:

    node ./grunt/grunt/bin/grunt module watch:module

Grunt Closure Compiler Support
------------------------------

[Grunt](https://github.com/cowboy) support the Google [Closure Compiler](https://developers.google.com/closure/compiler/)
 is supported via the 'closureCompiler' task.

The snippet below shows how to configure the 'closureCompiler' task.

```javascript
closureCompiler: {
    photon : {
        js : ['../output/photon-debug.js'],
        jsOutputFile : '../output/photon-min.js',
        closurePath : './tools/Closure',
        options: {
            'compilation_level' : 'SIMPLE_OPTIMIZATIONS'
        }
    }
}
```