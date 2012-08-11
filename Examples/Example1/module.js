(function(window, navigator){
    (function(factory) {
        if (typeof define === 'function' && define['amd']) {
            define(['exports', 'jquery', 'jquery.ui.core'], factory);
        } else if (window) {
            var ns = window.module = window.module || {};
            factory(ns, window.jQuery);
        }
    })(function(module, $) {
        var file1Message;
        
        /**
         * Gets a message from file 1
         * @return {String}
         */
        module.getMessage1 = function () {
            if (!file1Message) {
                file1Message = "Message from file 1";
            }
            return file1Message;
        }
        var file2Message = "Message from file 2";
        
        /**
         * Gets a message from file 2
         * @return {String}
         */
        module.getMessage2 = function() {
            return file2Message;
        }
        // TODO: Could not read file: '/Nested/test.js', please check the file exists.
    });
})(window, navigator);
//@ sourceMappingURL=module.js.map