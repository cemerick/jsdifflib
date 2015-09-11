var expect = require("chai").expect;
var diffview = require("../diffview.js");
var difflib = require("../difflib.js");
var jsdom = require("jsdom").jsdom;
var document = jsdom("<html></html>");
global.document = document;

describe("diffview", function() {
   describe(".buildView()", function() {
       it("can build view with a difference", function () {
           var view = testBuildView('a', 'b');
           expect(view.differences).to.equal(1);
           expect(view.diffOutput.outerHTML).to.contain('diffview_difference_1');
           expect(view.diffOutput.outerHTML).not.to.contain('diffview_difference_2');
       });

       it("can build view with no differences", function () {
           var view = testBuildView('a', 'a');
           expect(view.differences).to.equal(0);
           expect(view.diffOutput.outerHTML).not.to.contain('diffview_difference_1');
       });

       it("can build view with multi-line difference blocks", function () {
           var source = '<ruleEntry>' +
               '\r\n<assignedTo>spencerthang@gmail.com</assignedTo>' +
               '\r\n<criteriaItems>' +
               '\r\n  <field>Lead.Country</field>' +
               '\r\n  <value>US,USA,United States,United States of America</value>' +
               '\r\n</criteriaItems>';

           var target = '<ruleEntry>' +
               '\r\n<assignedTo>spencerthang@red-gate.com</assignedTo>' +
               '\r\n<criteriaItems>' +
               '\r\n  <field>Lead.City</field>' +
               '\r\n  <value>SG,Singapore</value>' +
               '\r\n</criteriaItems>';

           var view = testBuildView(source, target);
           expect(view.differences).to.equal(2);
           expect(view.diffOutput.outerHTML).to.contain('diffview_difference_1');
           expect(view.diffOutput.outerHTML).to.contain('diffview_difference_2');
           expect(view.diffOutput.outerHTML).not.to.contain('diffview_difference_3');
       });
   });
});

var testBuildView = function(sourceText, targetText) {
    var source = difflib.stringAsLines(sourceText);
    var target = difflib.stringAsLines(targetText);
    var sm = new difflib.SequenceMatcher(source, target);
    var opcodes = sm.get_opcodes();

    var diffResult = diffview.buildView({
        baseTextLines: source,
        newTextLines: target,
        opcodes: opcodes,
        baseTextName: 'Source',
        newTextName: 'Target',
        viewType: 0
    });

    return diffResult;
}