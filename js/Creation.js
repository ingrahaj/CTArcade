var overlayBoard;
var overlayConsole;

var TYPE = {
	IGNORE : {value: 0, css: "create_ignore", ignorecss: "ignore", description:
		"These tiles are ignored by the rule"},
	P1 : {value: 1, css: "create_p1", ignorecss: "consider", description:
		"This tile needs to have P1 in it to apply the rule"},
	P2 : {value: 2, css: "create_p2", ignorecss: "consider", description:
		"This tile needs to have P2 in it to apply the rule"},
	EMPTY : {value: 3, css: "create_empty", ignorecss: "consider", description:
		"This tile needs to be empty to apply the rule"},
	SELECTED : {value: 5, css: "create_selected", ignorecss: "consider", description:
		"This is where P1 could go next"}
	//THERE : {value: 4, css: "create_there"},
};

changeType = function(index1, index2){
	if (overlayBoard[index1][index2] == TYPE.IGNORE)
		overlayBoard[index1][index2] = TYPE.P1;
	else if (overlayBoard[index1][index2] == TYPE.P1)
		overlayBoard[index1][index2] = TYPE.P2;
	else if (overlayBoard[index1][index2] == TYPE.P2)
		overlayBoard[index1][index2] = TYPE.EMPTY;
	else if (overlayBoard[index1][index2] == TYPE.EMPTY)
		overlayBoard[index1][index2] = TYPE.SELECTED;
	/*else if (overlayBoard[index1][index2] == TYPE.THERE)
		overlayBoard[index1][index2] = TYPE.SELECTED;*/
	else if (overlayBoard[index1][index2] == TYPE.SELECTED)
		overlayBoard[index1][index2] = TYPE.IGNORE;
}

startCreationInterface = function(board) {
	$("<div></div>",{
		id : 'overlay',
		style : 'width: 100%;\
				height: 100%;\
				z-index: 1;\
				background-color: #444444;\
				position: absolute;\
				left: 0;\
				top: 0;\
				opacity: 0.0;\
				filter: alpha(opacity=0.5);'
	}).appendTo($("html"));
	
	// clone, create an overlaid console
	var consoleHandle = $("#console");
	consoleHandle.clone().attr("id","overlayConsole").appendTo("html");
	$("#overlayConsole").css({"position":"absolute",
							 "left":consoleHandle.offset()["left"]-parseInt(consoleHandle.css("margin-left")),
							 "top":consoleHandle.offset()["top"]-parseInt(consoleHandle.css("margin-top")),
							 "width":consoleHandle.width(),
							 "height":consoleHandle.height(),
							 "z-index":2,
							 "opacity":1.0,
							 "filter":"alpha(opacity=1.0)"});
	overlayConsole = new Console();
	overlayConsole.init("#overlayConsole > .message");
	overlayConsole.clear();
	
	// also need to clone, create the web representation of the game board
	var tileHandle;
	for (var i=0; i<board.length; i++){
		for (var j=0; j<board[i].length; j++){
			//initialize the board type
			if (board[i][j] == "p1")
				board[i][j] = TYPE.P1;
			else if (board[i][j] == "p2")
				board[i][j] = TYPE.P2;
			else
				board[i][j] = TYPE.IGNORE;
			
			// set up the rest of the attributes of the new tile
			tileHandle = $('#t'+i+j);
			tileHandle.clone().attr("id","tilecopy"+i+j).appendTo("html");
			$("#tilecopy"+i+j).attr("style","");
			$("#tilecopy"+i+j).css({"position":"absolute",
								   "left":tileHandle.offset()["left"]-parseInt(tileHandle.css("margin-left")),
								   "top":tileHandle.offset()["top"]-parseInt(tileHandle.css("margin-top")),
								   "width":tileHandle.width(),
								   "height":tileHandle.height(),
								   "z-index":2,
								   "opacity":1.0,
								   "filter":"alpha(opacity=1.0)"});
			$("#tilecopy"+i+j).attr("class", "tile " + board[i][j].ignorecss + " " + board[i][j].css);
			$("#tilecopy"+i+j).mousedown(
				function(index1,index2){
					return function(){
						changeType(index1,index2);
						/*var cssClasses = $(this).attr("class");
						var loc = cssClasses.search("create");
						if(loc != -1)
							cssClasses = cssClasses.slice(0,loc-1);
						alert(cssClasses + " " + overlayBoard[index1][index2].css);*/
						$(this).attr("class", "tile " + board[index1][index2].ignorecss + " " + board[index1][index2].css);
					}
				}(i,j));
			overlayBoard = board;
		}
	}
	
	// put the descriptions of each creation tile type in the console
	var html = "<div style='height: 300px;'>"
	for (type in TYPE){
		html = html +
			"<div id='container_"+type+"' style='float:left; margin: 2px;'>\
			   <div class='"+TYPE[type].css+"' \
					style='width: 50px; height: 50px; float: left;'>\
				</div>\
				<div id='description_"+type+"' class='instruction' \
					style='float: left; padding: 10px;'>"
					+type+": "+TYPE[type].description+"\
				</div>\
			</div>"
	}
	html = html + "</div>";
	overlayConsole.appendHTML(html);
	for (type in TYPE){
		var handle = $("#container_"+type);
		var width = handle.width()-74-2*parseInt(handle.css("padding-left"));
		$("#description_"+type).css("width",width);
	}
	
	// add a continue and quit button to the console
	overlayConsole.appendButton("CONTINUE","checkRule()");
	overlayConsole.appendHTML("<br/>")
	overlayConsole.appendButton("QUIT","endCreationInterface()");
	
	/*$("<input></input>",{
		type : 'button',
		id : 'doneCreating',
		style : 'height: 20px;\
				z-index: 2;\
				background-color: #FFFFFF;\
				position: absolute;'
	}).attr("value","Create Rule")
	.appendTo($("html"));
	$("#doneCreating").css({
		"width":$("#t00").width(),
		"left":$("#t10").offset()["left"] + 2,
		"top":$("#t02").offset()["top"] + $("#t20").height() + 10
	});
	$("#doneCreating").click(function(){
		if (ruleIsValid){
			parseRule(overlayBoard);
			endCreationInterface();
		}
		// parse the rule and return a function similar to those already programmed
		// add it to the required structures
	});*/
	
	// fancy animation stuff
	$("#overlay").animate({"opacity":"0.75"}, 'fast');
}

checkRule = function(){
	var message = ruleIsValid();
	if (message == null){
		overlayConsole.clear();
		overlayConsole.appendInstruction("What do you want to call your new rule?");
		overlayConsole.appendHTML("<input id='ruleName' type='text' value='newRule'/>");
		overlayConsole.appendButton("CONTINUE","checkName()");
	} else {
		alert(message);
	}
}

checkName = function(){
	var name = $("#ruleName").val();
	if (name != null && name != ""){
		overlayConsole.clear();
		overlayConsole.appendInstruction("Can you describe what your new rule does?");
		overlayConsole.appendHTML("<textarea id='ruleDesc'>My rule...</textarea>");
		overlayConsole.appendButton("CONTINUE","checkDesc(\""+name+"\")");
	} else {
		alert("Please write a name for your new rule!");
	}
}

checkDesc = function(name){
	var desc = $("#ruleDesc").val();
	if (desc == "My rule..." || desc == "")
		desc = "No description";
	console.log(name+": "+desc);
	console.log("starting parseRule")
	parseRule(overlayBoard, name, desc);
	console.log("starting endCreationInterface")
	endCreationInterface();
}

endCreationInterface = function(){
	$("#overlay").remove();
	$("#overlayConsole").remove();
	for (var i=0; i<overlayBoard.length; i++)
		for (var j=0; j<overlayBoard[0].length; j++)
			$("#tilecopy"+i+j).remove();
}

ruleIsValid = function(){
	// right now just make sure there is at least one "SELECTED" tile
	var selectedCount = 0;
	for (var i=0; i<overlayBoard.length; i++)
		for (var j=0; j<overlayBoard[0].length; j++){
			var tile = overlayBoard[i][j];
			console.log(tile);
			if (tile == TYPE.SELECTED)
				selectedCount++;
		}
	if (selectedCount < 1)
		return "At least one place must be selected (red border)";
	return null;
}

parseRule = function(ruleBoard, name, desc){
	newRule = function(board,player){
		console.log("NEWRULE---------------");
		console.log(ruleBoard);
		console.log(board);
		console.log(player);
		// not going to worry about position,rotation,symmetric invariance for now
		// I am going to make this player-ignorant, though, i.e. switch all the
		//   human player pictures with AI pictures
		// once this comes into play, having a return array of possible placements will be handy
		var result = new Object();
		result['success']=true;
		result['loc'] = [];
		for (var i=0; i<board.length; i++){
			for (var j=0; j<board[0].length; j++){
				switch(ruleBoard[i][j]){
					case (TYPE.P1):
						// this assumes p1 is the current player in the rule
						// could implement it so that it's player-blind
						if (board[i][j] != player)
							result['success'] = false;
						break;
					case (TYPE.P2):
						if (board[i][j] != game.flip(player))
							result['success'] = false;
						break;
					case (TYPE.EMPTY):
						if (board[i][j] != null)
							result['success'] = false;
						break;
					case (TYPE.SELECTED):
						if (board[i][j] == null)
							result['loc'].push([i,j])
						break;
				}
			}
		}
		console.log(result);
		return result;
	}
	// how to represent different created rules? array?
	
	// name,code,tooltip,enabled:
	//   name should be set by the user
	//   code could depend on name, or be represented as an index into an array of functions
	//   tooltip should be set by the user, if used
	//   enabled could be toggled depending on the context - should the AI learn it right away,
	//                                                       or learn through context when it next pops up
	game.strategySet.push({'name':name,'code':"newRule",'tooltip':desc,'enabled':true});
	game.newRule = newRule;
	console.log('new strategy pushed');	
	
	// for hooking in to the general game, need a generic addRule() function that could maybe do this
}

// want a way to break down rules into textual representation
// and building them back up to a rule function

// states of the guided rule creation
var GUIDE_STATE = {
	SELECT : {value: 0},
	IGNORE : {value: 1},
	FINISHING : {value: 2}
};

var guideState = GUIDE_STATE.SELECT;
var ignoreBoard = new Array();

var lastIndex1;
var lastIndex2;
var lastValue = null;
var lastIgnore = null;
var last = null;

var changeTypeBasedOnGuide = function(index1, index2, handle){
	if (guideState == GUIDE_STATE.SELECT){
		var curr = overlayBoard[index1][index2];
		if ( curr == TYPE.P1 || curr == TYPE.P2)
			return;
		if (lastValue != null){
			last.attr("class", "tile " + lastIgnore + " " + lastValue.css);
			overlayBoard[lastIndex1][lastIndex2] = lastValue;
			ignoreBoard[lastIndex1][lastIndex2] = lastIgnore;
		}
		last = handle;
		lastValue = curr;
		lastIgnore = ignoreBoard[index1][index2];
		lastIndex1 = index1;
		lastIndex2 = index2;
		overlayBoard[index1][index2] = TYPE.SELECTED;
		ignoreBoard[index1][index2] = "consider";
	} else if (guideState == GUIDE_STATE.IGNORE)
		flipIgnoreValue(index1, index2);
}

var flipIgnoreValue = function(index1, index2){
	var tile = overlayBoard[index1][index2];
	if (tile == TYPE.SELECTED)
		return;
	if (ignoreBoard[index1][index2] == "ignore")
		ignoreBoard[index1][index2] = "consider";
	else
		ignoreBoard[index1][index2] = "ignore";
}

var switchState = function(){
	switch(guideState){ 
		case GUIDE_STATE.SELECT:
			var message = ruleIsValid();
			if (message != null){
				alert(message);
				return;
			}
			guideState = GUIDE_STATE.IGNORE;
			overlayConsole.clear();
			overlayConsole.appendInstruction("Now, which spaces made you go where you did?");
			overlayConsole.appendHTML("<br/>");
			overlayConsole.appendButton("CONTINUE","switchState()");
			overlayConsole.appendHTML("<br/>");
			overlayConsole.appendButton("QUIT","endCreationInterface()");
			break;
		case GUIDE_STATE.IGNORE:
			guideState = GUIDE_STATE.FINISHING;
			for (var i=0; i<overlayBoard.length; i++)
				for (var j=0; j<overlayBoard[0].length; j++)
					if (ignoreBoard[i][j] == "ignore")
						overlayBoard[i][j] = TYPE.IGNORE;
			checkRule();
			break;
		case GUIDE_STATE.FINISHING:
			alert("This should be impossible to reach - guide_state.finishing");
			break;
	}
}

// also want a way to create rules within a guide
startGuidedCreationInterface = function(board) {
	$("<div></div>",{
		id : 'overlay',
		style : 'width: 100%;\
				height: 100%;\
				z-index: 1;\
				background-color: #444444;\
				position: absolute;\
				left: 0;\
				top: 0;\
				opacity: 0.0;\
				filter: alpha(opacity=0.5);'
	}).appendTo($("html"));
	
	// clone, create an overlaid console
	var consoleHandle = $("#console");
	consoleHandle.clone().attr("id","overlayConsole").appendTo("html");
	$("#overlayConsole").css({"position":"absolute",
							 "left":consoleHandle.offset()["left"]-parseInt(consoleHandle.css("margin-left")),
							 "top":consoleHandle.offset()["top"]-parseInt(consoleHandle.css("margin-top")),
							 "width":consoleHandle.width(),
							 "height":consoleHandle.height(),
							 "z-index":2,
							 "opacity":1.0,
							 "filter":"alpha(opacity=1.0)"});
	overlayConsole = new Console();
	overlayConsole.init("#overlayConsole > .message");
	overlayConsole.clear();
	
	// also need to clone, create the web representation of the game board
	var tileHandle;
	for (var i=0; i<board.length; i++){
		ignoreBoard[i] = new Array();
		for (var j=0; j<board[i].length; j++){
			//initialize the board type
			if (board[i][j] == "p1")
				board[i][j] = TYPE.P1;
			else if (board[i][j] == "p2")
				board[i][j] = TYPE.P2;
			else
				board[i][j] = TYPE.EMPTY;
			ignoreBoard[i][j] = "ignore";
			
			// set up the rest of the attributes of the new tile
			tileHandle = $('#t'+i+j);
			tileHandle.clone().attr("id","tilecopy"+i+j).appendTo("html");
			$("#tilecopy"+i+j).attr("style","");
			$("#tilecopy"+i+j).css({"position":"absolute",
								   "left":tileHandle.offset()["left"]-parseInt(tileHandle.css("margin-left")),
								   "top":tileHandle.offset()["top"]-parseInt(tileHandle.css("margin-top")),
								   "width":tileHandle.width(),
								   "height":tileHandle.height(),
								   "z-index":2,
								   "opacity":1.0,
								   "filter":"alpha(opacity=1.0)"});
			$("#tilecopy"+i+j).attr("class", "tile " + ignoreBoard[i][j] + " " + board[i][j].css);
			$("#tilecopy"+i+j).mousedown(
				function(index1,index2){
					return function(){
						changeTypeBasedOnGuide(index1,index2,$(this));
						$(this).attr("class", "tile " + ignoreBoard[index1][index2] + " " + board[index1][index2].css);
					}
				}(i,j));
			overlayBoard = board;
		}
	}
	
	// add a continue and quit button to the console
	overlayConsole.appendInstruction("Click where you think I should have gone.");
	overlayConsole.appendHTML("<br/>");
	overlayConsole.appendHTML("<br/>");
	overlayConsole.appendButton("ALL DONE!","switchState()");
	overlayConsole.appendHTML("<br/>");
	overlayConsole.appendButton("QUIT","endCreationInterface()");
	
	// set up the initial guide state
	guideState = GUIDE_STATE.SELECT;
	
	// fancy animation stuff
	$("#overlay").animate({"opacity":"0.75"}, 'fast');
}