/** @namespace module */
({
    name : 'module',
    files : [
        'file1.js',
        'file2.js'
    ],
    dependencies : [
        {
            name : '$',
            module : {
                amd: 'jquery',
                global : 'jQuery'
            }
        }
    ]
});