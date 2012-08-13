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