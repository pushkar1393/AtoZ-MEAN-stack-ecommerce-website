var Log = require("log");
var log = new Log(process.env.loglevel || "error");

var Handlebars = require("handlebars");
var Filter = require("../handlebars.filter");
Filter.registerHelper(Handlebars);


function template (tmpl, data) {
    var urtemplate = Handlebars.compile(tmpl);
    var output = urtemplate(data || {});
    log.info("\n================================", "\n"+tmpl, "\n---------------------------------\n", output, "\n");
    return output;
}


describe("Filter helper", function() {

    it("should capitalize", function () {
        expect(template('{{filter "heLLO worlD" "capitalize"}}')).toBe("HeLLO WorlD");
        expect(template('{{filter "heLLO worlD" "capitalize" respect=false}}')).toBe("Hello World");
        expect(template('{{#filter "capitalize"}}hello world{{/filter}}')).toBe("Hello World");
        expect(template('{{filter planetgreeting "capitalize"}}', {planetgreeting: "hello world"})).toBe("Hello World");
        expect(template('{{#filter "capitalize"}}{{/filter}}')).toBe("");
        expect(template('{{filter planetgreeting "capitalize"}}', {planetgreeting: ""})).toBe("");
        expect(template('{{filter planetgreeting "capitalize"}}', {planetgreeting: undefined})).toBe("");
    });

    it("should transform to lowercase", function () {
        expect(template('{{filter "HELLO WORLD" "lowercase"}}')).toBe("hello world");
        expect(template('{{#filter "lowercase"}}HELLO WORLD{{/filter}}')).toBe("hello world");
        expect(template('{{filter planetgreeting "lowercase"}}', {planetgreeting: "HELLO WORLD"})).toBe("hello world");
        expect(template('{{#filter "lowercase"}}{{/filter}}')).toBe("");
        expect(template('{{filter planetgreeting "lowercase"}}', {planetgreeting: ""})).toBe("");
        expect(template('{{filter planetgreeting "lowercase"}}', {planetgreeting: undefined})).toBe("");
    });

    it("should transform to uppercase", function () {
        expect(template('{{filter "hello world" "uppercase"}}')).toBe("HELLO WORLD");
        expect(template('{{#filter "uppercase"}}hello world{{/filter}}')).toBe("HELLO WORLD");
        expect(template('{{filter planetgreeting "uppercase"}}', {planetgreeting: "hello world"})).toBe("HELLO WORLD");
        expect(template('{{#filter "uppercase"}}{{/filter}}')).toBe("");
        expect(template('{{filter planetgreeting "uppercase"}}', {planetgreeting: ""})).toBe("");
        expect(template('{{filter planetgreeting "uppercase"}}', {planetgreeting: undefined})).toBe("");
    });

    it("should transform to titlecase", function () {
        expect(template('{{filter "the fox and the hound and the beaver" "titlecase"}}')).toBe("The Fox and the Hound and the Beaver");
        expect(template('{{#filter "titlecase"}}the fox and the hound and the beaver{{/filter}}')).toBe("The Fox and the Hound and the Beaver");

        expect(template('{{filter title "titlecase"}}', {title: "the fox and the hound and the beaver"})).toBe("The Fox and the Hound and the Beaver");
        expect(template('{{#filter "titlecase"}}{{/filter}}')).toBe("");
        expect(template('{{filter title "titlecase"}}', {title: ""})).toBe("");
        expect(template('{{filter title "titlecase"}}', {title: undefined})).toBe("");
    });

    it("should parse markdown", function () {
        expect(template('{{{filter "## Hello\n- Foo\n- Bar\n- Baz\n### Goodbye\nCruel world" "markdown"}}}')).toBe("<h2>Hello</h2>\n\n<ul><li>Foo</li><li>Bar</li><li>Baz</li></ul>\n\n<h3>Goodbye</h3>\n\n<p>Cruel world</p>");
        expect(template('{{#filter "markdown"}}## Hello\n- Foo\n- Bar\n- Baz\n### Goodbye\nCruel world{{/filter}}')).toBe("<h2>Hello</h2>\n\n<ul><li>Foo</li><li>Bar</li><li>Baz</li></ul>\n\n<h3>Goodbye</h3>\n\n<p>Cruel world</p>");
        expect(template('{{filter nothing "markdown"}}', {nothing: undefined})).toBe("");
    });

    it("should chain filters", function () {
        expect(template('{{filter "heLLO worlD" "lowercase" "capitalize"}}')).toBe("Hello World");
        expect(template('{{#filter "lowercase" "capitalize"}}heLLO worlD{{/filter}}')).toBe("Hello World");
        expect(template('{{filter "heLLO worlD" "capitalize" "lowercase"}}')).toBe("hello world");
        expect(template('{{filter filter "capitalize" "lowercase"}}', {filter: undefined})).toBe("");
    });



    it("should register new filters", function () {
        Filter.registerFilter("double-e", function (str) {
            return str.replace(/ee/g, "WW");
        });
        expect(template('{{filter "ever been to Edinburgh?" "double-e"}}')).toBe("ever bWWn to Edinburgh?");
    });
});

log.info("Described tests");