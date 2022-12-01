/*
This is part of jsdifflib v1.0. <http://github.com/cemerick/jsdifflib>

Copyright 2007 - 2011 Chas Emerick <cemerick@snowtide.com>. All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are
permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice, this list of
      conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright notice, this list
      of conditions and the following disclaimer in the documentation and/or other materials
      provided with the distribution.

THIS SOFTWARE IS PROVIDED BY Chas Emerick ``AS IS'' AND ANY EXPRESS OR IMPLIED
WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Chas Emerick OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

The views and conclusions contained in the software and documentation are those of the
authors and should not be interpreted as representing official policies, either expressed
or implied, of Chas Emerick.
*/
var replaced = 0, inserted = 0, deleted = 0, matched = 0;

diffview = {
	/**
	 * Builds and returns a visual diff view.  The single parameter, `params', should contain
	 * the following values:
	 *
	 * - baseTextLines: the array of strings that was used as the base text input to SequenceMatcher
	 * - newTextLines: the array of strings that was used as the new text input to SequenceMatcher
	 * - opcodes: the array of arrays returned by SequenceMatcher.get_opcodes()
	 * - baseTextName: the title to be displayed above the base text listing in the diff view; defaults
	 *	   to "Base Text"
	 * - newTextName: the title to be displayed above the new text listing in the diff view; defaults
	 *	   to "New Text"
	 * - contextSize: the number of lines of context to show around differences; by default, all lines
	 *	   are shown
	 * - viewType: if 0, a side-by-side diff view is generated (default); if 1, an inline diff view is
	 *	   generated
	 */
	buildView: function (params) {
		replaced = 0; inserted = 0; deleted = 0; matched = 0;
		var baseTextLines = params.baseTextLines;
		var newTextLines = params.newTextLines;
		var opcodes = params.opcodes;
		var baseTextName = params.baseTextName ? params.baseTextName : "Base Text";
		var newTextName = params.newTextName ? params.newTextName : "New Text";
		var contextSize = params.contextSize;
		var inline = (params.viewType == 0 || params.viewType == 1) ? params.viewType : 0;

    let startTimings = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000];
    let durations = [501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511];

    inline = 0;


    //console.log(">>>>>>>>>>>>inline = "+inline);

    //var inline = 0;

		if (baseTextLines == null)
			throw "Cannot build diff view; baseTextLines is not defined.";
		if (newTextLines == null)
			throw "Cannot build diff view; newTextLines is not defined.";
		if (!opcodes)
			throw "Canno build diff view; opcodes is not defined.";

		function celt (name, clazz) {
			var e = document.createElement(name);
			e.className = clazz;
			return e;
		}

		function telt (name, text) {
			var e = document.createElement(name);
			e.appendChild(document.createTextNode(text));
			return e;
		}

		function ctelt (name, clazz, text) {
			var e = document.createElement(name);
			e.className = clazz;
			e.appendChild(document.createTextNode(text));
			return e;
		}

		var tdata = document.createElement("thead");
		var node = document.createElement("tr");
		tdata.appendChild(node);
		if (inline) {
			node.appendChild(document.createElement("th"));
			node.appendChild(document.createElement("th"));
			node.appendChild(ctelt("th", "texttitle", baseTextName + " vs. " + newTextName));
		} else {
			node.appendChild(document.createElement("th"));
			node.appendChild(ctelt("th", "texttitle", baseTextName));
			node.appendChild(document.createElement("th"));
			node.appendChild(ctelt("th", "texttitle", newTextName));
		}
		tdata = [tdata];

		var rows = [];
		var node2;

    let dOutput = [];
    let diffOutput = [];
    let diffOutputBase = [];
    let diffOutputNew = [];
    let diffColumn = "base"



		/**
		 * Adds two cells to the given row; if the given row corresponds to a real
		 * line number (based on the line index tidx and the endpoint of the
		 * range in question tend), then the cells will contain the line number
		 * and the line of text from textLines at position tidx (with the class of
		 * the second cell set to the name of the change represented), and tidx + 1 will
		 * be returned.	 Otherwise, tidx is returned, and two empty cells are added
		 * to the given row.
		 */
		function addCells (row, tidx, tend, textLines, change) {
      //let diffObject = null;

      let wordText = "";
      if (tidx < tend) {
        wordText = textLines[tidx].replace(/\t/g, "\u00a0\u00a0\u00a0\u00a0");
      }
    
      let wordObj = {'tidx':tidx, 'tend':tend, 'text':wordText, 'status':change};

      diffOutput.push(wordObj);
      
      if (diffColumn === "base") {
        wordObj.start = startTimings[tidx];
        wordObj.duration = durations[tidx];
        diffOutputBase.push(wordObj);
        diffColumn = "new";
      } else {
        diffOutputNew.push(wordObj);
        diffColumn = "base";
      }

			if (tidx < tend) {
				row.appendChild(telt("th", (tidx + 1).toString()));
				row.appendChild(ctelt("td", change, textLines[tidx].replace(/\t/g, "\u00a0\u00a0\u00a0\u00a0")));
        //console.log("first");
				return tidx + 1;
			} else {
				row.appendChild(document.createElement("th"));
				row.appendChild(celt("td", "empty"));
        //console.log("second");
				return tidx;
			}
		}

		function addCellsInline (row, tidx, tidx2, textLines, change) {
      dOutput.push({'row':row, 'tidx':tidx, 'tidx2':tidx2, 'textLines':textLines, 'change':change});
			row.appendChild(telt("th", tidx == null ? "" : (tidx + 1).toString()));
			row.appendChild(telt("th", tidx2 == null ? "" : (tidx2 + 1).toString()));
			row.appendChild(ctelt("td", change, textLines[tidx != null ? tidx : tidx2].replace(/\t/g, "\u00a0\u00a0\u00a0\u00a0")));
		}

		for (var idx = 0; idx < opcodes.length; idx++) {
			code = opcodes[idx];
			change = code[0];
			var b = code[1];
			var be = code[2];
			var n = code[3];
			var ne = code[4];
			var rowcnt = Math.max(be - b, ne - n);
			var toprows = [];
			var botrows = [];
			for (var i = 0; i < rowcnt; i++) {
				// jump ahead if we've alredy provided leading context or if this is the first range
				if (contextSize && opcodes.length > 1 && ((idx > 0 && i == contextSize) || (idx == 0 && i == 0)) && change=="equal") {
					var jump = rowcnt - ((idx == 0 ? 1 : 2) * contextSize);
					if (jump > 1) {
						toprows.push(node = document.createElement("tr"));

						b += jump;
						n += jump;
						i += jump - 1;
						node.appendChild(telt("th", "..."));
						if (!inline) node.appendChild(ctelt("td", "skip", ""));
						node.appendChild(telt("th", "..."));
						node.appendChild(ctelt("td", "skip", ""));

						// skip last lines if they're all equal
						if (idx + 1 == opcodes.length) {
							break;
						} else {
							continue;
						}
					}
				}



				toprows.push(node = document.createElement("tr"));
				if (inline) {
					if (change == "insert") {
						addCellsInline(node, null, n++, newTextLines, change);
						//console.log('insert');
						inserted++;
					} else if (change == "replace") {
						//console.log('replace');
						replaced++;
						botrows.push(node2 = document.createElement("tr"));
						if (b < be) addCellsInline(node, b++, null, baseTextLines, "delete");
						if (n < ne) addCellsInline(node2, null, n++, newTextLines, "insert");
					} else if (change == "delete") {
						//console.log('delete');
						deleted++;
						addCellsInline(node, b++, null, baseTextLines, change);
					} else {
						// equal
						//console.log('matched');
						matched++;
						addCellsInline(node, b++, n++, baseTextLines, change);
					}
				} else {

					if (change == "replace") replaced++;
					if (change == "insert") inserted++;
					if (change == "delete") deleted++;
					if (change == "equal") matched++;

					b = addCells(node, b, be, baseTextLines, change);
					n = addCells(node, n, ne, newTextLines, change);
				}
			}

			for (var i = 0; i < toprows.length; i++) rows.push(toprows[i]);
			for (var i = 0; i < botrows.length; i++) rows.push(botrows[i]);

      
		}

		rows.push(node = ctelt("th", "author", "diff view generated by "));
		node.setAttribute("colspan", inline ? 3 : 4);
		node.appendChild(node2 = telt("a", "jsdifflib"));
		node2.setAttribute("href", "http://github.com/cemerick/jsdifflib");

		tdata.push(node = document.createElement("tbody"));
		for (var idx in rows) rows.hasOwnProperty(idx) && node.appendChild(rows[idx]);

		node = celt("table", "diff" + (inline ? " inlinediff" : ""));
		for (var idx in tdata) tdata.hasOwnProperty(idx) && node.appendChild(tdata[idx]);

	  document.getElementById('replaced').innerHTML = replaced;
	  document.getElementById('inserted').innerHTML = inserted;
	  document.getElementById('deleted').innerHTML = deleted;
	  document.getElementById('matched').innerHTML = matched;

    let output = [];

    if (inline === 0) {
      rows.forEach((row) => {
        if (row.childNodes.length > 2) {  
          output.push({'bidx':row.childNodes[0].innerText, 'btxt': row.childNodes[1].innerText, 'nidx':row.childNodes[2].innerText, 'ntxt': row.childNodes[3].innerText, 'status': row.lastChild.className});
        }
      });
    }

    let boundaryStart = 30;
    let boundaryEnd = 13000;

    let lastStatus = null;
    let totalInserts = 0;
    let realigned = [];

    console.log("----------------------");

    diffOutputBase.forEach((out, index) => {
      
      if (out.status === "equal") {
        realigned.push({'text': out.text, 'time': out.start, 'duration': out.duration});
      }

      if (out.status === "replace" && lastStatus !== "replace") {

        let wordLengths = [];
        let totalWordLength = 0;

        console.log("***********")
        console.log(diffOutputNew[index].text);
        console.log("***********");

        // we have two entries for each "row" – the old and the new
        wordLengths[0] = diffOutputNew[index].text.length; 
        totalWordLength += wordLengths[0];

        let startTime = out.start;
        let replacements = 1;
    
        // lookahead, are there any other replacements immediately after, if so - how many?
      
        while(diffOutputBase[index+replacements].status === "replace") {
          wordLengths[replacements] = diffOutputNew[index+replacements].text.length;
          totalWordLength += wordLengths[replacements];
          replacements++;
        }
        
        // check the next non-replacement and grab its time to calculate increments for the replacements
        if (diffOutputBase[index+replacements]) {
          endTime = diffOutputBase[index+replacements].start;
        }

        let counter = 0;
        let lastEndTime = null;

        // loop through the replacements again and push the text and new calculated time
        while(diffOutputBase[index+counter].status === "replace") {
          if (realigned.length > 0) { // previously aligned word exists
            let lastRealigned = realigned[realigned.length - 1];
            lastEndTime = lastRealigned.time + lastRealigned.duration;
            gap = (endTime - startTime);
          } else { // previously aligned word does not exist 
            lastEndTime = boundaryStart;
            gap = diffOutputBase[0].start - boundaryStart;
          }
          counter++; 
          let timePerChar = gap/totalWordLength;
          let wordLength = wordLengths[counter-1];
        
          if (counter === 1) { // a counter of 1 means we're at the first replacement which starts from next startTime
            // duration should be that of replaced word when there is only one replacement
            let replacementDuration = durations[diffOutputBase[index].tidx];
            // if there's more than one replacement word we need to calculate
            if (replacements > 1) {
              replacementDuration = Math.floor((timePerChar)*wordLength)-1;
            }

            realigned.push({'text': diffOutputNew[index+counter-1].text, 'time': out.start, 'duration': replacementDuration});
          } else { // subsequent pushes should use lastEndTime + duration
            realigned.push({'text': diffOutputNew[index+counter-1].text, 'time': lastEndTime+1, 'duration': Math.floor((timePerChar)*wordLength)-1});
          }
        }

        totalInserts += (replacements - 1);
      }

      if (out.status === "insert" && lastStatus !== "insert") {

        let wordLengths = [];
        let totalWordLength = 0;
        // we have two entries for each "row" – the old and the new
        console.log("===========")
        console.log(diffOutputNew[index].text);
        console.log("===========");
        wordLengths[0] = diffOutputNew[index].text.length; 
        totalWordLength += wordLengths[0];

        // we need to take account of the total number of inserts that have come before 
        // as the index value includes those

        let startTime = out.start + out.duration;
        
        if (realigned.length > 0) { // previously aligned word exists)
          startTime = diffOutputBase[index-1].start + diffOutputBase[index-1].duration; 
        }
        
        //establish inserts in a row
        let inserts = 1;

        if (index+inserts < diffOutputBase.length - 1){
          // lookahead, are there any other inserts immediately after, if so - how many?
          while(diffOutputBase[index+inserts] != undefined && diffOutputBase[index+inserts].status === "insert") {
            wordLengths[inserts] = diffOutputNew[index+inserts].text.length;
            totalWordLength += wordLengths[inserts];
            inserts++;
          }
        }

        let endTime = null;
        let gap = null;

        // check the next non-insert and grab its time to calculate increments for the inserts
        if (diffOutputBase[index+inserts-1]) {
          endTime = diffOutputBase[index+inserts-1].start;
        }

        let counter = 0;
        let lastEndTime = null;

        // loop through the inserts again and push the text and new calculated time

        console.log("index = "+index);
        console.log("counter = "+counter);
        console.log("diffOutputBase.length = "+diffOutputBase.length);

        while(diffOutputBase[index+counter].status === "insert" && index+counter < diffOutputBase.length - 1) {
          if (realigned.length > 0) { // previously aligned word exists
            let lastRealigned = realigned[realigned.length - 1];
            lastEndTime = lastRealigned.time + lastRealigned.duration;
            gap = (endTime - startTime);
            console.log("endTime = "+endTime);
            console.log("startTime = "+startTime);
          } else { // previously aligned word does not exist 
            lastEndTime = boundaryStart;
            gap = diffOutputBase[0].start - boundaryStart;
          }
          counter++; 
          let timePerChar = gap/totalWordLength;
          console.log("totalWordLength = "+totalWordLength);
          console.log("gap = "+gap);
          console.log("timePerChar = "+timePerChar);
          let wordLength = wordLengths[counter-1];
          if (endTime !== undefined) {
            realigned.push({'text': diffOutputNew[index+counter-1].text, 'time': lastEndTime+1, 'duration': Math.floor((timePerChar)*wordLength)-2});
          }
        }
        console.log("endTime = "+endTime);

        if (endTime === undefined) { // no end time means words were added to the end
          console.log("EXTRA WORDS!!!!");
          // figure out how many 
          let wordsAddedToEnd = diffOutputBase.length - index;
          console.log("wordsAddedToEnd = "+wordsAddedToEnd);

          console.log("index = "+index);
          console.log("diffOutputBase.length = "+diffOutputBase.length);

          wordLengths = [];
          totalWordLength = 0;

          for (let idx = 0; idx < wordsAddedToEnd; idx++){
            wordLengths[idx] = diffOutputNew[index+idx].text.length;
            totalWordLength += wordLengths[idx];
          }

          console.log("wordLengths = ");
          console.log(wordLengths);
          console.log("totalWordLength = "+totalWordLength);

          let lastRealigned = realigned[realigned.length - 1];
          lastEndTime = lastRealigned.time + lastRealigned.duration;

          gap = boundaryEnd - lastEndTime;
          console.log("gap = "+gap);
          console.log(wordLengths);
          let timePerChar = gap/totalWordLength;

          wordLengths.forEach((chars,idx) => {
            realigned.push({'text': diffOutputNew[index+idx].text, 'time': lastEndTime+1, 'duration': Math.floor((timePerChar)*chars)-1});
            lastEndTime = lastEndTime+1 + Math.floor((timePerChar)*chars)-2;
          });
        }
        totalInserts += inserts;
      }

      lastStatus = out.status;
   
    });

    console.log("diffOutputBase...");
    console.log(diffOutputBase);

    console.log("diffOutputNew...");
    console.log(diffOutputNew);

    console.log("realigned...");
    console.log(realigned);

    ////console.log(node);

		return node;
	} 
};
