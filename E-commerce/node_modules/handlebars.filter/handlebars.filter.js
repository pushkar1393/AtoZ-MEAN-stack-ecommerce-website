(function (moduleFactory) {
    if (typeof exports === "object") {
        module.exports = moduleFactory(require("markdown"));
    } else if(typeof define === "function" && define.amd) {
        define(["markdown"], moduleFactory);
    }
}(function (Markdown) {
/**
 * @module handlebars%filter
 * @description  Provides helpers and methods to filter content
 * 
 *     var Handlebars = require("handlebars");
 *     var Filter = require("handlebars.filter");
 *     Filter.registerHelper(Handlebars);
 * 
 * @returns {object} Filter instance
 */
    var Handlebars;

    var locale = "default";

    var filterRegister = {};
    /**
     * @template  uppercase
     * @block filter
     * @param {string} str
     * @description Transforms output to uppercase
     */
    filterRegister.uppercase = function (str) {
        return str ? str.toUpperCase() : str;
    };
    /**
     * @template  lowercase
     * @block filter
     * @param {string} str
     * @description Transforms output to lowercase
     */
    filterRegister.lowercase = function (str) {
        return str ? str.toLowerCase() : str;
    };
    //filterRegister.camelcase = function (str) {
    //    return str.toLowerCase();
    //};
    /**
     * @template  capitalize
     * @block filter
     * @param {string} str
     * @param {object} [options]
     * @description Capitalizes output
     */
    filterRegister.capitalize = function (str, options) {
        if (!str) {
            return str;
        }
        if (options.hash.respect === false) {
            str = str.toLowerCase();
        }
        var words = str.split(" ");
        var capitalize = function() {
            return arguments[1].toUpperCase();
        };
        for (var word in words) {
            words[word] = words[word].replace(/^(["']*.)/, capitalize);
        }
        return words.join(" ");
    };

    /**
     * @template  titlecase
     * @block filter
     * @param {string} str
     * @description Transforms output to titlecase
     */
    filterRegister.titlecase = (function (){
        var small = "(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|v[.]?|via|vs[.]?)";
        var punct = "([!\"#$%&'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]*)";

        var titleCaps = function (title) {
            if (!title) {
                return title;
            }
            var parts = [],
                split = /[:.;?!] |(?: |^)["Ò]/g,
                index = 0;

            var upperAll = function (all){
                return (/[A-Za-z]\.[A-Za-z]/).test(all) ? all : upper(all);
            };

            var upperPunct = function (all, punct, word){
                return punct + upper(word);
            };

            while (true) {
                var m = split.exec(title);

                parts.push( title.substring(index, m ? m.index : title.length)
                    .replace(/\b([A-Za-z][a-z.'Õ]*)\b/g, upperAll)
                    .replace(RegExp("\\b" + small + "\\b", "ig"), lower)
                    .replace(RegExp("^" + punct + small + "\\b", "ig"), upperPunct)
                    .replace(RegExp("\\b" + small + punct + "$", "ig"), upper));

                index = split.lastIndex;

                if (m) {
                    parts.push(m[0]);
                } else {
                    break;
                }
            }

            return parts.join("").replace(/ V(s?)\. /ig, " v$1. ")
                .replace(/(['Õ])S\b/ig, "$1s")
                .replace(/\b(AT&T|Q&A)\b/ig, function(all){
                    return all.toUpperCase();
                });
        };

        function lower (word){
            return word.toLowerCase();
        }

        function upper (word){
          return word.substr(0,1).toUpperCase() + word.substr(1);
        }

        return titleCaps;
    })();

    /**
     * @template  markdown
     * @block filter
     * @param {string} str
     * @description Parses output as markdown
     */
    filterRegister.markdown = function (str) {
        if (!str) {
            return str;
        } 
        return Markdown.parse(str);
    };

    var FilterHelper = function () {
        /**
         * @template filter
         * @block helper
         * @description  Transforms content using named filter method
         *
         * Apply a filter to content
         * 
         *     {{filter str filtername}}
         *
         * Apply a filter to captured content
         * 
         *     {{#filter filtername}}{{str}}{{/filter}}
         *
         * Apply chained filters to content
         * 
         *     {{filter str filter1 filter2}}
         *
         * Apply lowercase filter
         * 
         *     {{filter str "lowercase"}}
         *
         * See {@link template:lowercase}
         *
         * Apply uppercase filter
         * 
         *     {{filter str "uppercase"}}
         *
         * See {@link template:uppercase}
         *
         * Apply capitalize filter
         * 
         *     {{filter str "capitalize"}}
         *
         * See {@link template:capitalize}
         *
         * Apply capitalize filter overriding any existing casing
         * 
         *     {{filter str "capitalize" respect=false}}
         *
         * Apply titlecase filter
         * 
         *     {{filter str "titlecase"}}
         *
         * See {@link template:titlecase}
         *
         * Apply markdown filter
         * 
         *     {{filter str "markdown"}}
         *
         * See {@link template:markdown}
         *
         */
        Handlebars.registerHelper("filter", function() {
            var args = Array.prototype.slice.call(arguments),
                options = args.pop(),
                str;
            options.hash = options.hash || {};

            if (args.length > 1 && !filterRegister[args[0]]) {
                // allow calls like {{filter content filterName}}
                str = args.shift();
            } else {
                // otherwise {{#filter filterName anotherFilter }}content{{/filter}}
                str = options.fn(this);
            }
            for (var arg in args) {
                if (filterRegister[args[arg]]) {
                    str = filterRegister[args[arg]](str, options);
                }
            }
            return str;
        });
    };

    var Filter = (function () {
        var external = {
            /**
             * @method locale
             * @static
             * @param {string} [loc] Locale to switch to
             * @description Get or set default locale used by Filter
             *
             * If called without loc parameter, returns locale
             *
             * If called with loc parameter, sets locale
             *
             * @returns {string} Filter’s locale
             */
            locale: function (loc) {
                if (loc) {
                    locale = loc;
                }
                return locale;
            },
            /**
             * @method registerFilter
             * @static
             * @param {string} name Name of filter
             * @param {function} fn Filter function
             * @description Add filter to Filter
             */
            registerFilter: function (name, fn) {
                filterRegister[name] = fn;
            },
            /**
             * @method unregisterFilter
             * @static
             * @param {string} name Name of filter
             * @description Remove filter from Filter
             */
            unregisterFilter: function (name) {
                delete filterRegister[name];
            },
            /**
             * @method registerHelper
             * @static
             * @param {object} hbars [description]
             * @description Register Filter helper with Handlebars
             *
             * - {@link template:filter}
             */
            registerHelper: function (hbars) {
                Handlebars = hbars;
                FilterHelper();
            }

        };
        return external;
    })();

    return Filter;
}));