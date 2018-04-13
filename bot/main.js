/*
chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    console.log("Velocità di riproduzione cambiata...");
    var data = request.data || {};

    var video = document.getElementsByClassName('jw-video')[0];
    video.playbackRate = data;

    var spanVelocita = document.getElementById('velocitaRiproduzioneSpan');
    spanVelocita.innerHTML = data;

    sendResponse({data: data, success: true});
});
*/

chrome.storage.onChanged.addListener(function(changes) {

	var currPbRate = changes["currentPlaybackRate"] && changes["currentPlaybackRate"].newValue;

	console.log("Velocità di riproduzione cambiata...");
    
    var video = document.getElementsByClassName('jw-video')[0];
    video.playbackRate = currPbRate;

    var spanVelocita = document.getElementById('velocitaRiproduzioneSpan');
    spanVelocita.innerHTML = currPbRate;
    
});

/*
chrome.app.window.current().onClosed(function() {
	alert("closing");
	localStorage.removeItem("currentPlaybackRate");
});
*/
(function() {
	console.log("Uninettuno bot is starting...");
	var script = document.createElement('script');

	chrome.storage.sync.get("currentPlaybackRate", function(items){
		var currPbRt = items.currentPlaybackRate == null ? 1 : items.currentPlaybackRate;
		var code = document.createTextNode(
		'(function() {' 
		+ 
		'var idExtension ="'+chrome.runtime.id+'";'
		+
		`
		var messaggio = 'Bot Attivo'; 
		var checkLBack = (document.querySelectorAll('[id$="LezionePrecedente"]')[0]!=null);
		var checkLNext = (document.querySelectorAll('[id$="LezioneSuccessiva"]')[0]!=null);
		var isFirst = ((!checkLBack) && (checkLNext));
		var isLast = ((checkLBack) && (!checkLNext));
		var isVideoLesson = ((checkLBack || checkLNext));
		var currentLesson = 0;
		var currentSubject = null;
		var isLanguageIt = (document.getElementsByTagName('html')[0].getAttribute('lang') == "it");
		var minimumRandomTime = 5000;
		var maximumRandomTime = 15000;

		var video = document.getElementsByClassName('jw-video')[0];

		
		function getByUrl(name){
		   if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
		      return decodeURIComponent(name[1]);
		}

		function saveTimeLesson() {
			chrome.runtime.sendMessage(idExtension , {type: 'add', lesson: currentLesson, subject: currentSubject, time:jwplayer().getPosition(), url:window.location.href.replace("&gmbotles="+getByUrl("gmbotles")+"&gmbotime="+getByUrl("gmbotime"),'')}, function(response) {
				  console.log(response);
			});

		    setTimeout(saveTimeLesson, 60000);
		}

		function stopAndPlayLesson() {
			console.log('Pausing video');
			jwplayer().pause();

			var minimumRandomTimeF = 7000;
			var maximumRandomTimeF = 17000;
			var randomTimeF = Math.floor(Math.random() * (maximumRandomTimeF - minimumRandomTimeF + 1)) + minimumRandomTimeF;

		    setTimeout(function(){ jwplayer().play(); }, randomTimeF);

			var minimumRandomTimeR = 550000;
			var maximumRandomTimeR = 900000;
			var randomTimeR = Math.floor(Math.random() * (maximumRandomTimeR - minimumRandomTimeR + 1)) + minimumRandomTimeR;	

			setTimeout(stopAndPlayLesson, randomTimeR);
		}

		if (isVideoLesson && isLanguageIt) {
			currentLesson = document.querySelectorAll('[id$="ArgumentsTitle"]')[0].innerHTML.split(":")[0];
			currentSubject = document.getElementsByClassName("nome-materia")[0].innerText;
			buttonNext = document.querySelectorAll('[id$="LezioneSuccessiva"]')[0];
			buttonBack = document.querySelectorAll('[id$="LezionePrecedente"]')[0];

			var currPbRt = `+currPbRt+`

			/*
			chrome.storage.sync.get("currentPlaybackRate", function(items){
				currPbRt = items.currentPlaybackRate == null ? 1 : items.currentPlaybackRate;
			});
			*/

			//var currPbRt = chrome.storage.sync.get("currentPlaybackRate") == null ? 1 : chrome.storage.sync.get("currentPlaybackRate");
			console.log("currPbRt = "+currPbRt);
			video.playbackRate = currPbRt;

			messaggio = '<font color="blue">Bot Attivo | ' + currentSubject + ' | ' + currentLesson+'</font>';
			
			if (isFirst) 
				messaggio = '<font color="blue">Bot Attivo | ' + currentSubject + ' | ' + currentLesson + ' | Prima Lezione</font>';

			if (isLast)
				messaggio = '<font color="blue">Bot Attivo | ' + currentSubject + ' | ' + currentLesson + ' |</font> <font color="red">Ultima Lezione</font>';

			messaggio = messaggio + ' | Velocità: <span id="velocitaRiproduzioneSpan">'+video.playbackRate+'</span>x';

			var isPlayed = false;
			jwplayer().onPlay(function(){ 
				if (!isPlayed) {
					if (getByUrl("gmbotles")==currentLesson.split(" ")[1]) {
						if (getByUrl("gmbotime") != undefined) {
							jwplayer().seek(getByUrl("gmbotime"));
							history.pushState({}, null, window.location.href.split("/")[4].replace("&gmbotles="+getByUrl("gmbotles")+"&gmbotime="+getByUrl("gmbotime"),''));
						}
					}
					else {
						if (getByUrl("gmbotime") != undefined){
							history.pushState({}, null, window.location.href.split("/")[4].replace("&gmbotles="+getByUrl("gmbotles")+"&gmbotime="+getByUrl("gmbotime"),''));
						}
					}

					setTimeout(saveTimeLesson, 60000);
					isPlayed = true;

					var minimumRandomTimeE = 550000;
					var maximumRandomTimeE = 900000;
					var randomTimeE = Math.floor(Math.random() * (maximumRandomTimeE - minimumRandomTimeE + 1)) + minimumRandomTimeE;	
					setTimeout(stopAndPlayLesson, randomTimeE);
				}
			});

			jwplayer().onComplete(function(){ 
				var randomTime = Math.floor(Math.random() * (maximumRandomTime - minimumRandomTime + 1)) + minimumRandomTime;
				if (!isLast)
					setTimeout(function(){ buttonNext.click(); }, randomTime);
			});
		} else {
			messaggio = '<font color="red">Bot Attivo | Nessuna videolezione in riproduzione</font>';

			if (!isLanguageIt)
				messaggio = '<font color="red">Bot Disattivato | Seleziona la lingua italiana su Uninettuno.</font>';
		}
		
		var div = document.createElement('div');
		div.id='currentLessonText';
		div.style.position = 'fixed';
		div.style.top = 0;
		div.style.right = 0;
		div.style.zIndex=100000;
		div.innerHTML = messaggio;
		document.body.appendChild(div);  
		`
		+ 
		'})();'
	);
		script.appendChild(code);
	});

	/*
	var code = document.createTextNode(
		'(function() {' 
		+ 
		'var idExtension ="'+chrome.runtime.id+'";'
		+
		`
		var messaggio = 'Bot Attivo'; 
		var checkLBack = (document.querySelectorAll('[id$="LezionePrecedente"]')[0]!=null);
		var checkLNext = (document.querySelectorAll('[id$="LezioneSuccessiva"]')[0]!=null);
		var isFirst = ((!checkLBack) && (checkLNext));
		var isLast = ((checkLBack) && (!checkLNext));
		var isVideoLesson = ((checkLBack || checkLNext));
		var currentLesson = 0;
		var currentSubject = null;
		var isLanguageIt = (document.getElementsByTagName('html')[0].getAttribute('lang') == "it");
		var minimumRandomTime = 5000;
		var maximumRandomTime = 15000;

		var video = document.getElementsByClassName('jw-video')[0];

		
		function getByUrl(name){
		   if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
		      return decodeURIComponent(name[1]);
		}

		function saveTimeLesson() {
			chrome.runtime.sendMessage(idExtension , {type: 'add', lesson: currentLesson, subject: currentSubject, time:jwplayer().getPosition(), url:window.location.href.replace("&gmbotles="+getByUrl("gmbotles")+"&gmbotime="+getByUrl("gmbotime"),'')}, function(response) {
				  console.log(response);
			});

		    setTimeout(saveTimeLesson, 60000);
		}

		function stopAndPlayLesson() {
			console.log('Pausing video');
			jwplayer().pause();

			var minimumRandomTimeF = 7000;
			var maximumRandomTimeF = 17000;
			var randomTimeF = Math.floor(Math.random() * (maximumRandomTimeF - minimumRandomTimeF + 1)) + minimumRandomTimeF;

		    setTimeout(function(){ jwplayer().play(); }, randomTimeF);

			var minimumRandomTimeR = 550000;
			var maximumRandomTimeR = 900000;
			var randomTimeR = Math.floor(Math.random() * (maximumRandomTimeR - minimumRandomTimeR + 1)) + minimumRandomTimeR;	

			setTimeout(stopAndPlayLesson, randomTimeR);
		}

		if (isVideoLesson && isLanguageIt) {
			currentLesson = document.querySelectorAll('[id$="ArgumentsTitle"]')[0].innerHTML.split(":")[0];
			currentSubject = document.getElementsByClassName("nome-materia")[0].innerText;
			buttonNext = document.querySelectorAll('[id$="LezioneSuccessiva"]')[0];
			buttonBack = document.querySelectorAll('[id$="LezionePrecedente"]')[0];

			var currPbRt = `+currPbRt+`

			/*
			chrome.storage.sync.get("currentPlaybackRate", function(items){
				currPbRt = items.currentPlaybackRate == null ? 1 : items.currentPlaybackRate;
			});
			

			//var currPbRt = chrome.storage.sync.get("currentPlaybackRate") == null ? 1 : chrome.storage.sync.get("currentPlaybackRate");
			console.log("currPbRt = "+currPbRt);
			video.playbackRate = currPbRt;

			messaggio = '<font color="blue">Bot Attivo | ' + currentSubject + ' | ' + currentLesson+'</font>';
			
			if (isFirst) 
				messaggio = '<font color="blue">Bot Attivo | ' + currentSubject + ' | ' + currentLesson + ' | Prima Lezione</font>';

			if (isLast)
				messaggio = '<font color="blue">Bot Attivo | ' + currentSubject + ' | ' + currentLesson + ' |</font> <font color="red">Ultima Lezione</font>';

			messaggio = messaggio + ' | Velocità: <span id="velocitaRiproduzioneSpan">'+video.playbackRate+'</span>x';

			var isPlayed = false;
			jwplayer().onPlay(function(){ 
				if (!isPlayed) {
					if (getByUrl("gmbotles")==currentLesson.split(" ")[1]) {
						if (getByUrl("gmbotime") != undefined) {
							jwplayer().seek(getByUrl("gmbotime"));
							history.pushState({}, null, window.location.href.split("/")[4].replace("&gmbotles="+getByUrl("gmbotles")+"&gmbotime="+getByUrl("gmbotime"),''));
						}
					}
					else {
						if (getByUrl("gmbotime") != undefined){
							history.pushState({}, null, window.location.href.split("/")[4].replace("&gmbotles="+getByUrl("gmbotles")+"&gmbotime="+getByUrl("gmbotime"),''));
						}
					}

					setTimeout(saveTimeLesson, 60000);
					isPlayed = true;

					var minimumRandomTimeE = 550000;
					var maximumRandomTimeE = 900000;
					var randomTimeE = Math.floor(Math.random() * (maximumRandomTimeE - minimumRandomTimeE + 1)) + minimumRandomTimeE;	
					setTimeout(stopAndPlayLesson, randomTimeE);
				}
			});

			jwplayer().onComplete(function(){ 
				var randomTime = Math.floor(Math.random() * (maximumRandomTime - minimumRandomTime + 1)) + minimumRandomTime;
				if (!isLast)
					setTimeout(function(){ buttonNext.click(); }, randomTime);
			});
		} else {
			messaggio = '<font color="red">Bot Attivo | Nessuna videolezione in riproduzione</font>';

			if (!isLanguageIt)
				messaggio = '<font color="red">Bot Disattivato | Seleziona la lingua italiana su Uninettuno.</font>';
		}
		
		var div = document.createElement('div');
		div.id='currentLessonText';
		div.style.position = 'fixed';
		div.style.top = 0;
		div.style.right = 0;
		div.style.zIndex=100000;
		div.innerHTML = messaggio;
		document.body.appendChild(div);  
		`
		+ 
		'})();'
	);
	script.appendChild(code);
	*/
	(document.body || document.head).appendChild(script);

})();