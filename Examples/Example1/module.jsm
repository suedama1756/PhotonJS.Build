/** @namespace module */
({
    name:'module',
    files:[
        'Nested\\Foo\\file01.js',
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