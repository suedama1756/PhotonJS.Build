/** @namespace module */
({
    name:'module',
    files:[
        'file01.js',
        'file02.js'
    ],
    dependencies:{
        '$':{
            amd:'jquery',
            global:'jQuery'
        }
    },
    environment : {
       dependencies : ['window', 'navigator']
    }
});