/** @namespace module */
({
    name:'module',
    files:[
        'file01.js',
        'file02.js',
        '/Nested/test.js'
    ],
    dependencies:[
        {
            import : '$',
            source : {
                amd:[
                    'jquery',
                    'jquery.ui.core'
                ],
                global:'jQuery'
            }
        }
    ],
    environment : {
       dependencies : ['window', 'navigator']
    }
});

// There are multiple ways to import a dependency.
//
// Dependencies that add themselves to an existing namespace, e.g. jquery.ui.*. In this case we can either
// pull in just the jquery.ui dependency we are after (shim configuration will pull in jQuery), or we can
// pull in both the dependencies. Even if we pull in both the dependencies we will only want to include a
// single import. Dependencies that use duplicates
