/** @namespace module */
({
    name:'module',
    files:[
        'file01.js',
        'file02.js',
        '/Nested/test.js'
    ],
    dependencies:{
        '$':{
            amd:[
                'jquery',
                'jquery.ui.core'
            ],
            global:'jQuery'
        },
        '<<anonymous>>':{
            amd:[]
        }
    },
    environment:{
        dependencies:['window', 'navigator']
    },
    configuration : {
        debug : {
            srcOutput : '%module%-debug.js',
            mapOutput : '../output/%module%-debug.js.map'
        }
    }
});