PhotonJS.Build
==============

NodeJS based build tools developed for [PhotonJS](https://github.com/suedama1756/PhotonJS)

Module Builder
--------------

The PhotonJS.Build module builder can be used to build module files supporting multiple module formats, including
'AMD' and 'Global'. Module packaging information is maintained in a JavaScript Module (.jsm) file. By placing module
packaging information in a separate file developers do not have to pollute their source code with module specific
semantics, they can focus on writing clear maintainable code which can be deployed easily to a variety of module formats.

## Example Module File:

    /** @namespace module */
    ({
        name:'module',
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
             * Environment dependencies
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