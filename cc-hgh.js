//  Handy Game History script for Conquer Club
//  version 1.2
//  2010-12-08
//  Copyright (c) 2010, Daniel Pavlyuchkov (dako.lrd@gmail.com)
//  Based on script by philh-2007 (https://userscripts-mirror.org/scripts/show/12027)
//  Released under the GPL license
//  http://www.gnu.org/copyleft/gpl.html
//
//
// ==UserScript==
// @name              Conquer Club - Handy Game History
// @description       Provides a visual display of the game log (history)
// @namespace         https://userscripts-mirror.org
// @version           1.2
// @include           http*://*.conquerclub.com/game.php*
// ==/UserScript==


//---------   Global variables   ---------//

var semaphore = false;
var inVisualize = false;
var terrs = {};
var terrNums = [];
var log = [];
var logIndex = 0;
var counts = { action: {}, turn: {}, round: {}};


//---------   RegExp variables   ---------//

var dateR = '([\\d :-]+) - ';
var playerR = ' ?<SPAN class="player(\\d)">.*?</SPAN> ?';
var conquerRegex = new RegExp(dateR + playerR + 'assaulted (.*?) from (.*?) and conquered it from' + playerR,'i');
var nukeRegex = new RegExp(dateR + playerR + 'cashed in a group of <span class="card\\d">(.*?)</span>, <span class="card\\d">(.*?)</span>, and <span class="card\\d">(.*?)</span> nuking each region','i');
var roundRegex = new RegExp(dateR + 'Incrementing game to round (\\d+)');
var initRegex = new RegExp(dateR + 'Game has been initialized');
var turnRegex = new RegExp(dateR + playerR + 'received \\d+ troops for \\d+ regions','i');


//---------   Visualize link functions   ---------//

/**
 * Add [visualize] link
 *
 */
function addVisuLink () {
  var vl, span;

	vl = document.createElement('a');
	vl.appendChild(document.createTextNode('visualise'));
	vl.id = 'handy-history-visualize-link';
	vl.addEventListener('click', visualise, false);

	span = document.createElement('span');
	span.className = 'visualize-control';
	span.appendChild(document.createTextNode('[')).parentNode.appendChild(vl).parentNode.appendChild(document.createTextNode(']'));

	getGameLogHeader().appendChild(span);
}

/**
 * [visualize] link callback (part1)
 *
 */
function visualise (event) {
	if (!semaphore && !inVisualize) {
	  this.innerHTML = 'unvisualize';
		semaphore = true;
		loadFullLog();
		addUI();
		removeNumbers();
		getTerrCoords();
		placeIndicators();
		setTerrOwners(visualise2);
	} else if (inVisualize) {
	  this.innerHTML = 'visualize';
	  $id('inner-map').style.display = 'block';
	  $id('handy-history-map').style.display = 'none';
	  $id('handy-history-controls').style.display = 'none';
	  inVisualize = false;
	}

	if (event.preventDefault)
		event.preventDefault();

	return false;
}

/**
 * [visualize] link callback (part2)
 *
 */
function visualise2 () {
  parseLog();
  setTerrOrigOwners();
  inVisualize = true;
  semaphore = false;
}


//---------   Visualize link processing functions   ---------//

/**
 * Load full log of the game if it is available
 *
 */
function loadFullLog() {
  if ($id('full-log').style.display == 'none')
    return;

  // Simulate a click value
  evt = document.createEvent('HTMLEvents');
  evt.initEvent('click', true, true);
  $id('full-log').getElementsByTagName('a')[0].dispatchEvent(evt);
}

/**
 * Add UI controls
 *
 */
function addUI () {
  if ($id('handy-history-controls')) {
    $id('handy-history-controls').style.display = 'block';
    return;
  }

	var l = document.createElement('ul');
	l.id = 'handy-history-controls';
	l.style.listStyleType = 'none';
	l.style.padding = '0px';

	var h4 = document.createElement('li');
	h4.innerHTML = '<h4>Game Review</h4>';
	l.appendChild(h4);

	var links = [ ['Game', firstMove, lastMove],
		      ['Round', prevRound, nextRound, 'round'],
		      ['Turn', prevTurn, nextTurn, 'turn'],
		      ['Action', prevMove, nextMove, 'action'] ];
	for (var i = 0; i < links.length; i++) {
		var li = document.createElement('li');
		li.innerHTML = '<a href="">&lt;</a> '
			+ links[i][0]
			+ ' <a href="">&gt;</a>';

		if (links[i][3]) {
			var n = links[i][3];
			li.innerHTML+=' (<span></span>/<span></span>)';
			var ss = li.getElementsByTagName('span');
			counts[n].spancur = ss[0];
			counts[n].spanmax = ss[1];
		}

		var as = li.getElementsByTagName('a');
		as[0].addEventListener('click', links[i][1], false);
		as[1].addEventListener('click', links[i][2], false);

		l.appendChild(li);
	}

	var insPos = $id('right_hand_side');
	insPos.appendChild(l);
}

/**
 * Hide game armies on the map
 *
 */
function removeNumbers () {
  $id('inner-map').style.display = 'none';
}

/**
 * Parse map xml and get countries coords
 *
 */
function getTerrCoords () {
  var data = /map = (.+);/.exec($id('middleColumn').getElementsByTagName('script')[0].innerHTML)[1];
  var ts = eval('(' + data + ')').countries;
  var realTerritories = 0;

  for (var i = 0; i < ts.length; i++) {
    var name = ts[i].name;
    var sx = ts[i].xS;
    var sy = ts[i].yS;
    var lx = ts[i].xL;
    var ly = ts[i].yL;

    if (!terrs[name]) terrs[name] = {};
    terrs[name].sx = sx*1; //cast to int
    terrs[name].sy = sy*1;
    terrs[name].lx = lx*1;
    terrs[name].ly = ly*1;

    terrNums[realTerritories] = terrs[name];
    realTerritories++;
  }
}

/**
 * Place * indicators instead of troops
 *
 */
function placeIndicators () {
  if ($id('handy-history-map')) {
    $id('handy-history-map').style.display = 'block';
    return;
  }

  var map = $id('outer-map');
  var div = document.createElement('div');
  div.id = 'handy-history-map';
  map.appendChild(div);

  var isSmall = $id('resolution').innerHTML.match(/S/);
  for (var i in terrs) {
    var sp = document.createElement('span');
    sp.innerHTML = '*';
    if (isSmall) {
      sp.style.left = (terrs[i].sx - 6) + 'px';
      sp.style.top = (terrs[i].sy - 38) + 'px';
    } else {
      sp.style.left = (terrs[i].lx -5) + 'px';
      sp.style.top = (terrs[i].ly - 38) + 'px';
    }
    sp.className = 'c0';
    div.appendChild(sp);
    terrs[i].indic = sp;
  }
}

/**
 * Set terr owners based on armies JSON array
 *
 * @param function callback - step2 function callback
 */
function setTerrOwners (callback) {
  var armlist = [];

  if ($id('armies').childNodes.length !== 0) {
    // full log is loaded
    armlist = eval('(' + $id('armies').innerHTML + ')');
    for (var i = 0; i < armlist.length; i++) {
      var owner = armlist[i].player;
      terrNums[i].currentOwner = owner;
      setTerrCol(terrNums[i], owner);
    }
    callback();
  } else
    setTimeout(function(){setTerrOwners(callback);}, 1000);
}

/**
 * Parse log and fill actions/turns/rounds massive with all teh chat lines
 *
 */
function parseLog () {
  var types = [ 'action', 'turn', 'round' ];
  counts.action.max = counts.turn.max = counts.round.max = 0;
  var logdiv = $id('log');
  if (logdiv.childNodes[0].nodeName == 'SPAN')
    logdiv = logdiv.childNodes[0];

  // opera has <BR>, firefox has <br>. But test for ' /' in case.
  var logarr = logdiv.innerHTML.split(/<br ?\/?>/i);

  log = []; //empty log array
  for (var i = 0; i < logarr.length; i++) {
    if (conquerRegex.exec(logarr[i])) {
      var entry = {};
      entry.type = 'conquer';
      entry.time = RegExp.$1;
      entry.attacker = RegExp.$2;
      entry.to = RegExp.$3;
      entry.from = RegExp.$4;
      entry.defender = RegExp.$5;
      log.push(entry);
      counts.action.max++;
    }
    else if (logarr[i].match(initRegex)) {
      log.push({type: 'new round',
          time: RegExp.$1,
          num: 1});
      counts.round.max++;
    }
    else if (logarr[i].match(roundRegex)) {
      var entry = {};
      entry.type = 'new round';
      entry.time = RegExp.$1;
      entry.num = RegExp.$2;
      log.push(entry);
      counts.round.max++;
    }
    else if (logarr[i].match(turnRegex)) {
      var entry = {};
      entry.type = 'new turn';
      entry.time = RegExp.$1;
      entry.player = RegExp.$2;
      log.push(entry);
      counts.turn.max++;
    }
    else if (logarr[i].match(nukeRegex)) {
      // stub
    }
  }
  logIndex = log.length;
  for (var i = 0; i < types.length; i++) {
    counts[types[i]].spanmax.innerHTML
      = counts[types[i]].spancur.innerHTML
      = counts[types[i]].max;
  }
}

/**
 * Set original owners of the territories
 *
 */
function setTerrOrigOwners () {
  for (var i = 0; i < log.length; i++) {
    var o = log[i];
    if (o.type == 'conquer') {
      if (terrs[o.from].origOwner == null)
        terrs[o.from].origOwner = o.attacker;
      if (terrs[o.to].origOwner == null)
        terrs[o.to].origOwner = o.defender;
    }
  }
}


//---------   Movement functions   ---------//

/**
 * Counter functions for the moves
 *
 */
function inCount (n) {
	counts[n].spancur.innerHTML++;
}
function deCount (n) {
	counts[n].spancur.innerHTML--;
}
function setCount (n,v) {
	counts[n].spancur.innerHTML = v;
}

// logIndex n means next will consider the n+1th, prev will consider
// the nth. n is one-based.

function prev () {
	if (logIndex <= 2)
		return false;

	logIndex--;
	delta = log[logIndex];
	switch (delta.type) {
	case 'conquer'://if (delta.type == 'conquer') {
		setTerrCol(terrs[delta.to], delta.defender);
	        deCount('action'); break;
	case 'new turn':
		deCount('turn'); break;
	case 'new round':
		deCount('round'); break;
	}

	return delta.type;
}

function next () {
	if (logIndex == log.length)
		return false;

	delta = log[logIndex];
	logIndex++;
	switch (delta.type) {
	case 'conquer':
		setTerrCol(terrs[delta.to], delta.attacker);
		inCount('action'); break;
	case 'new turn':
		inCount('turn'); break;
	case 'new round':
		inCount('round'); break;
	}

	return delta.type;
}

function peekPrev () {
	return log[logIndex-1].type;
}
function peekNext () {
	return log[logIndex].type;
}

function prevMove (event) {
	if (event && event.preventDefault)
		event.preventDefault();

	while (logIndex > 2)
		if (prev() == 'conquer') break;

	return false;
}

function nextMove (event) {
	if (event && event.preventDefault)
		event.preventDefault();

	while (logIndex < log.length)
		if (next() == 'conquer') break;
	if (isEndTurn())
		nextTurn();

	return false;
}

function prevTurn (event) {
	if (event && event.preventDefault)
		event.preventDefault();

	if (isStartTurn())
		prev();
	while (logIndex > 2) {
		if (prev() == 'new turn') break;
	}
	if (peekPrev() == 'new round')
		prevRound();

	return false;
}

function nextTurn (event) {
	if (event && event.preventDefault)
		event.preventDefault();

	while (logIndex < log.length) {
		if (next() == 'new turn') break;
	}

	return false;
}

function isEndTurn () {
	if (peekNext() == 'new turn'
	    || peekNext() == 'new round')
		return true;
	else
		return false;
}

function isStartTurn () {
	if (peekPrev() == 'new turn')
		return true;
	else
		return false;
}

function prevRound (event) {
	if (event && event.preventDefault)
		event.preventDefault();

	while (logIndex > 2) {
		if (prev() == 'new round') break;
	}

	return false;
}

function nextRound (event) {
	if (event && event.preventDefault)
		event.preventDefault();

	while (logIndex < log.length) {
		if (next() == 'new round') break;
	}
	nextTurn();

	return false;
}

function firstMove (event) {
	logIndex = 0;
	for (var i in terrs)
		setTerrCol(terrs[i], terrs[i].origOwner);

	for (var i in counts)
		setCount(i, 0);

	nextTurn(); // round 1, turn 1 are the first events

	if (event.preventDefault)
		event.preventDefault();
	return false;
}

function lastMove (event) {
	logIndex = log.length;
	for (var i in terrs)
		setTerrCol(terrs[i], terrs[i].currentOwner);

	for (var i in counts)
		setCount(i, counts[i].spanmax.innerHTML);

	if (event.preventDefault)
		event.preventDefault();
	return false;
}


//---------   Helper functions   ---------//

/**
 * Get chat <h3> header
 *
 * @return DOM Node element
 */
function getGameLogHeader() {
  var tagIndex, tags;
  var tags = $tag('h3');

  for(tagIndex = 0; tagIndex < tags.length; tagIndex++)
    if(tags[tagIndex].innerHTML == 'Game Log')
      return tags[tagIndex];
}

/**
 * Set the color of the territory
 *
 * @param object terr - territory global object
 * @param int color - color id
 */
function setTerrCol(terr, color) {
  color = (color == undefined || color == '?') ? 0 : color;
  terr.indic.className = 'c' + color;
}

/**
 * Add script styles
 *
 */
function addStyles() {
  GM_addStyle('span.visualize-control {font-size: 13px; font-weight: normal; padding: 0 5px;}');
  GM_addStyle('div#handy-history-map {position: relative;}');
  GM_addStyle('div#handy-history-map span {font-size: 40px; font-family: courier monospace; position: absolute;}');
  GM_addStyle('div#handy-history-map span.c0 {color: #eee}');
  GM_addStyle('div#handy-history-map span.c1 {color: #f00}');
  GM_addStyle('div#handy-history-map span.c2 {color: #009a04}');
  GM_addStyle('div#handy-history-map span.c3 {color: #00f}');
  GM_addStyle('div#handy-history-map span.c4 {color: #cc0}');
  GM_addStyle('div#handy-history-map span.c5 {color: #f0f}');
  GM_addStyle('div#handy-history-map span.c6 {color: #0cc}');
  GM_addStyle('div#handy-history-map span.c7 {color: #f92}');
  GM_addStyle('div#handy-history-map span.c8 {color: #7f7f7f}');
}

/**
 * Shortcut to DOM functions
 *
 */
function $id (id) { return document.getElementById(id); }
function $tag (name) { return document.getElementsByTagName(name); }


/**
 * Starting point
 *
 */
function initScript() {
  addVisuLink();
  addStyles();
}

// Start the script
initScript();
