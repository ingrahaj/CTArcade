var game=null;
var cons=null;	// console object
var needReset = false;
var alreadyPlayed = false;
// var currentTurn;
// var p1 = 'X';   // human player
// var p2 = 'O'; 	// computer AI 
//var currentStep = -1;  // how many moves done so far and which one is now being shown
var playbackMode = false; // True when user's viewing previous moves, 
								// user can either resume game there or teach AI what it could've done.

function turnPlayer(name) {
	//$("#currentStep").text(currentStep);	
}

function updateBoard(board) {  // update current board presentation
	// turnPlayer(game.turn);
	for(var x=0;x<game.width;x++) {
		for(var y=0;y<game.height;y++) {
			$("#t"+x+""+y).removeClass('tile_p1');
			$("#t"+x+""+y).removeClass('tile_p2');
			$("#t"+x+""+y).addClass('tile_'+board[x][y]);
		}
	}
}

// called after user/AI move to prevent keep on playing
function checkWinner() {
	// winning event
	var winner = game.checkForWinner();
	if (winner) {
		$("#status").text(winner + " wins!");
		$("#status").css('background-color', 'yellow');
		cons.appendHTML("<br/>")
		if(winner=='p1') cons.appendMessage('You win!');
		else cons.appendMessage('I win!');
		cons.appendMessage('Let\'s play again! Just click the new game button.');
		// $("#bigButton_newGame").show();
		needReset = true;
	} else {
		$("#status").text(game.turn + " to play");
		// cons.appendMessage(game.turn + " to play");
	}
	return winner;
}	

// it uses AI's current strategy set 
// to find the best move
function computerMove() {
	// turnPlayer('p2');
	// $("#console > .message").empty();		
	// $("#bigButton_computerMove").hide();
	// var countMove = cons.countMove();
	if(needReset) {
		cons.appendMessage('Game already finished. Press new game button to start again.');
		return;
	}
	
	cons.clear();
	
	$("#sortable").each( function() {
		$(this).attr('id','');	
	});
	
	var html = "<div>For my last move I tried all my strategies,</div><ul id='sortable'>";
	var nextMove = game.findBestStrategy(game.board,game.turn,game.strategySet); // returns {'message':[[title]],'loc':[[x,y],...]};
	// convert used strategies in HTML
	enabledStrategy = game.getEnabledStrategy();  // get strategies AI learned so far
	for(i in enabledStrategy) {
		st = enabledStrategy[i];
		html = html+"<li class='ui-state-default'><div style='margin:10px 0 0 10px; ' class='ai_"+ st['code'] +" rule_inactive'>"+ st['name'] +"</div></li>";
	}
	html = html+"</ul>";
	// $("#console > .message").append(html);	// create list of strategies that AI knows
	cons.appendHTML(html);
	for(i in enabledStrategy) {
		st = enabledStrategy[i];
		if (nextMove.message==st.name) {	// for the best strategy, 
			// color it in red
			console.log("found it!"+st.name);
			var currentMove = cons.getLast(); 
			$(".ai_"+st['code']).removeClass('rule_inactive');
			$(".ai_"+st['code']).removeClass('rule_unapplicable');
			$(".ai_"+st['code']).addClass('rule_selected');
			$(".ai_"+st['code']).append("<span style='color:gray; font-size:13px;'> was the first applicable rule.</span>");
			break;
		} else {   // for non-feasible (but top-priority) strategies
			var currentMove = cons.getLast(); 
			console.log("cannot find it!"+ st.name);  
			$(".ai_"+st['code']).removeClass('rule_inactive');
			$(".ai_"+st['code']).addClass('rule_unapplicable');
			$(".ai_"+st['code']).removeClass('rule_selected');
			$(".ai_"+st['code']).append("<span style='color:gray; font-size:13px;'> was not applicable.</span>");
		}
	}
	$("#sortable").sortable({
		update : function(event, ui) {
			changeOrder();
		}
	});
	$("#sortable").disableSelection();
	// $("#console_p2 > .message").append("<div onclick='changeOrder();' style='font-size:14px; margin:10px 0 10px 15px; color:blue; cursor:pointer;'>[CHANGE ORDER]</div>");
	
	
	if (nextMove.message=="Tie Game") {
		$("#status").text(nextMove.message);
		// $("#bigButton_newGame").show();
		html = "<div style='line-height:2em;'>Tie game! Click 'new game' button to start over.</div>"
		cons.appendHTML(html);
	} else if (nextMove.message=="no strategy found") {
		$("#status").text(nextMove.message);
		html = "<div style='line-height:2em;'>No strategy seems to match the situation.</div>"
		cons.appendHTML(html);
	} else {
		$("#rule").text(nextMove.message);
		// $("#console > .message").animate({scrollTop: $("#console > .message").scrollHeight});
		// $("#console > .message").each(function() {
			// var scrollHeight =Math.max(this.scrollHeight, this.clientHeight);
			// var offset = scrollHeight - this.clientHeight;
			// $(this).animate({scrollTop: offset});
		// });
		
		// now it selects one from all the moves of the best strategy
		selectedLoc = nextMove.locList[Math.floor(Math.random()*nextMove.locList.length)]; // randomly select one location from list
		game.move(selectedLoc[0], selectedLoc[1], game.turn); // update board ds with current game.turn and return new value of the cell
		$("#currentStep").text(game.history.length-1);
		updateBoard(game.board);
		// $('#bigButton').hide();
		if (!checkWinner()){
			html = "<div style='line-height:1.2em;margin-top:10px;'>Your turn now. Click an empty cell to continue.</div>"
			cons.appendHTML(html);
		}
		// var t = setTimeout("turnPlayer('p1')",700);
		alreadyPlayed = false;
	}
}

function history(direction) {
	// increment currentStep
	var currentStep = parseInt($("#currentStep").text());
	if (direction=='next')
		currentStep += 1;
	else
		currentStep -= 1;
		
	// keep currentStep within reasonable bounds
	if (currentStep>=game.history.length-1) {
		historyMode('off');
		tempBoard = game.history[game.history.length-1];
		updateBoard(tempBoard['board']);
		currentStep = game.history.length-1;
		$("#currentStep").text(currentStep);
		// $(".icon_player").css('border','0px');
		// if (tempBoard['turn']=='O') $("#icon_p1").css('border','2px solid #aaa');
		// else $("#icon_p2").css('border','2px solid #aaa');
		return;
	} else if(currentStep<=-1) {
		currentStep=0;
		return;
	} else {
		historyMode('on');
		tempBoard = game.history[currentStep];	
		updateBoard(tempBoard['board']);
		$("#currentStep").text(currentStep);
		// $(".icon_player").css('border','0px');
		cons.clear();
		cons.appendMessage('We are in history mode. You can trace the current game back and forth.');
		cons.appendHTML('<br/>');
		if (tempBoard['turn']=='p2') {
			cons.appendInstruction('It was your turn. Do you want to start again from this point?');
			cons.appendHTML('<br/>');
			cons.appendButton('Resume Game From Here','resumeGame('+currentStep+');');
			// $("#icon_p1").css('border','2px solid #aaa');
			// cons.appendHTML("<div>It was your turn. Do you want to start again from this point? <div class='button_round' onclick='resumeGame("+currentStep+");' style='float:right;'>Resume Game Here</div></div>");
			// $("#console_p2 > .message").empty();
		} else {
			// $("#icon_p2").css('border','2px solid #aaa');
			// $("#console > .message").empty();
			cons.appendInstruction("It was my turn. You can teach me what I could have done at this point.");
			cons.appendHTML("<br/>");
			cons.appendInstruction("To do that, click an empty cell and tell me why you think it is important.");
			cons.appendHTML("<br/>");
			$(".tile").click( function() {
				teachAI(tempBoard['board'],tempBoard['turn'],$(this).attr('id'));
			});
		}
		
	}
}

function teachAI(board,turn,loc) {
	var x = loc[1];
	var y = loc[2];
	flippedTurn = (turn == 'p1') ? 'p2' : 'p1';
	var matchingRules = game.analyzeMove(board,flippedTurn,[x,y]);
	cons.appendInstruction("Which rule below matches your choice?");
	html = "<div class='teach'>";
	$(matchingRules).each( function(i,rule) {
		alreadyKnown = game.checkStrategyEnabled(rule['code']);
		$('<div></div>',{
			id : 'mR_'+rule['code'],
			style : 'margin: 7px 5px 7px 25px; font-size:1.3em; cursor:pointer;'
		})	.text(rule['name'])
			.click(function() { enableStrategy(rule['code']);})
			.appendTo($(cons.target));
	});
	$('<div></div>',{
			id : 'mR_Other',
			style : 'margin: 7px 5px 7px 25px; font-size:1.3em; cursor:pointer;'
		})	.text("Other")
			.click(function() {startGuidedCreationInterface(game.cloneBoard(board));})
			.appendTo($(cons.target));
	/*$(matchingRules).each( function(i,rule) {
		// $('<div></div>',{
			// id : 'mR_'+rule['code'],
			// style : 'margin-left:20px;height:2em;'
		// })	.text(rule['name'])
			// .click(function() { enableStrategy(rule['code']);})
			// .appendTo('#console > .message');
		html = "<div style='margin-left:20px;'>"+rule['name']+"</div>"			
	});
	html = html+"<div style='margin-left:20px;'>Other</div>";
	html = html+"</div>";
	
	cons.appendHTML(html);*/
}

function resumeGame(currentStep) {
	alreadyPlayed = false;
	needReset = false;
	game.resumeAt(currentStep);
	historyMode('off');
	$(".tile").click( function() {
		callUserMove($(this).attr('id'));
	});
}

function historyMode(flag) {
	if(flag=='on') {
		$(".tile").unbind();
		$('.tile').css('background-color','#ddd');
		$('#status').text('History mode')
						.css('background-color','#0055ff');
	}
	if(flag=='off') {
		$(".tile").unbind();
		$(".tile").click( function() {
			callUserMove($(this).attr('id'));
		});
		$('.tile').css('background-color','#fff');
		$('#status').text(currentTurn + " 's turn")
						.css('background-color','#fff');
		// $("#console > .message").empty();
		cons.appendMessage("It's your turn. Click an empty cell to take.");			
	}
	
}

function changeOrder() {
	// console.log('chageOrder');
	nameList = [];
	$('#sortable li').each(function(i,e) {
		// extract the strategy code and push into new list
		var c = $(e).clone();
		console.log($(c).html());
		console.log("aa"+ $(c).find('span').remove().end().text());
		nameList.push($(c).text());
	});
	game.changeOrder(nameList);
}

function enableStrategy(code) {
	console.log(code + ' is enabled!');
 	isNewStrategyLearned = game.enableStrategy(code);
	if(isNewStrategyLearned) {
		$(cons.target).find("#mR_"+code).append("<span style='font-size:12px; color:#955;'> I learned this new rule!</span>");
	} else {
		$(cons.target).find("#mR_"+code).append("<span style='font-size:12px; color:#595;'> Thanks! But I knew it already.</span>");
	}
	
}

function showMatchingRules(matchingRules)  {  // matchingRules : {name:text, code:text, locList:array of [x.y]}
	// console.log(matchingRules);
	// turnPlayer('p1');
	// $("#console > .message").empty();
	cons.clear();
	cons.appendMessage("Is your last move based on one of these rules?")
	
	$(matchingRules).each( function(i,rule) {
		alreadyKnown = game.checkStrategyEnabled(rule['code']);
		$('<div></div>',{
			id : 'mR_'+rule['code'],
			style : 'margin: 7px 5px 7px 25px; font-size:1.3em; cursor:pointer;'
		})	.text(rule['name'])
			.click(function() {enableStrategy(rule['code']); computerMove();})
			.appendTo($(cons.target));
		// if (alreadyKnown) {
			// $("#mR_"+rule['code']).css({
				// 'color':'#000'	
			// });
		// } else {
			// $("#mR_"+rule['code']).css({
				// 'color':'#aaa'	
			// });
		// }
	});
	// insert "other" div
	$('<div></div>',{
			id : 'mR_Other',
			style : 'margin: 7px 5px 7px 25px; font-size:1.3em; cursor:pointer;'
		})	.text("Other")
			.click(function() {startCreationInterface(game.cloneBoard(game.getBoard()));})
			.appendTo($(cons.target));
	if (!game.checkForWinner())
		cons.appendButton("CONTINUE","$(this).hide(); computerMove()");
	// $("#console > .message").each(function() {
		// var scrollHeight =Math.max(this.scrollHeight, this.clientHeight);
		// var offset = scrollHeight - this.clientHeight;
		// $(this).animate({scrollTop: offset});
	// });
	// $("#console > .message").animate({scrollTop: $("#console > .message").scrollHeight});
		
	// for (i in matchingRules) {
		// var rule = matchingRules[i];
		// ftoRun = new String(rule['code']);
		// console.log(ftoRun);
		// $('<div></div>',{
			// id : 'mR_'+rule['code'],
			// style : 'margin-left:20px;height:2em;'
		// })	.text(rule['name'])
			// .click(function() { alert(rule['code']);})
			// .appendTo('#console_p1 > .message');
		// htmlResult = htmlResult + "<div style='margin-left:20px;height:2em;' "
										// + "class='rule_inactive' id='mR_"+rule['code']+"' "
										// + "onclick='enableStrategy("+  "aaa"   + ")'"
										// + ">"
										// +  rule['name'];
		// htmlResult = htmlResult+"</div>";
	// }
	// $("<div>Now it's my turn. Press the board to continue.</div>").appendTo('#console_p1 > .message');
	// htmlResult = htmlResult+"<div style='cursor:pointer; color:red;' onclick='javascript:computerMove();'>Continue on [[Computer Move]]</div>";
	// $("#console_p1 > .message").append(htmlResult);
	// $("#bigButton_computerMove").show();
}

function clearBoard() {
	needReset=false;
	alreadyPlayed = false;
	$("#status").css('color','black');
	$("#bigButton").hide();
	historyMode('off');
	game.restart();  // reset game.board, game.turn 
	$("#currentStep").text(game.history.length-1);
	// turnPlayer('p1');
	// $("#bigButton_newGame").hide();
	$("#status").css('background-color', 'white');
	$("#rule").text("");
	cons.clear();
	cons.appendMessage("It's your turn. Click an empty cell for next move.");
	// $("#console > .message").empty();
	for (var i = 0; i < 3; i++) {
		for (var j =0; j<3;j++) {
			$("#t"+i+""+j).removeClass('tile_p1');
			$("#t"+i+""+j).removeClass('tile_p2');
		}
	}
}	

function callUserMove(dd) {
	if (needReset || alreadyPlayed) {	// when board is full or game already ended, needReset is true
		return;
	}
	var currentTurn = game.turn;
	var x = dd[1];
	var y = dd[2];
	userMove(x,y);
}

function userMove(x,y) {
	//currentStep += 1;
	cons.clear();
	var matchingRules = game.analyzeMove(game.board,game.turn,[x,y])
	if(!game.move(x, y, currentTurn))  // update game.board, game.turn and game.history
		return;
	updateBoard(game.board);	// update game.board on #txy.text
	$("#currentStep").text(game.history.length-1);
	alreadyPlayed = true;
	if(!checkWinner())	// check winning condition. if yes, show the winner, otherwise show next one to play
		showMatchingRules(matchingRules);
	// wait until user confirms which rule he used.
	// if (currentTurn != game.turn && !needReset) {
		// // $("#console > .message").empty().text("AI is thinking...");
		// // $("#bigButton").show();
		// var t= setTimeout("computerMove();",2200);
	// }			
}


$(document).ready(function () {
	game = new TicTacToe();
	cons = new Console();
	cons.init("#console > .message"); // initialize console object
	currentTurn = game.turn;
	$("#bigButton").hide();
	$("#status").text(game.getStatus());		
	$(".tile").click( function() {
		callUserMove($(this).attr('id'));
	});
});