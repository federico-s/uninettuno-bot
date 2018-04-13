chrome.runtime.onMessageExternal.addListener(
	function(request, sender, sendResponse) {
		if (request.type == "add") {
			addElementArray (request.subject, request.lesson, request.time, request.url);
		}

		if (request.type == "remove") {
			removeElementArray (request.subject);
		}
	});

function removeElementArrayFromClickImg(evt) {
	removeElementArray(evt.target.myParam);
	location.reload();
}

function removeElementArray(subject) {
  var aSub = loadArraySub ();
  var aLes = loadArrayLes ();
  for(var i = aSub.length; i--;) {
      if(aSub[i] === subject) {
          aSub.splice(i, 1);
          aLes.splice(i, 1);
      }
  }
  saveArraySub (aSub);
  saveArrayLes (aLes);
}

function addElementArray(subject, lesson, time, url) {
  var aSub = loadArraySub ();
  var aLes = loadArrayLes ();
  var isPresent = true;
  for(var i = aSub.length; i--;) {
      if(aSub[i] === subject) {
          aLes[i] = lesson + "|" + time + "|" + url;
          isPresent = false;
      }
  }
  if (isPresent) {
  	var index = aSub.push(subject) - 1;
  	aLes[index] = lesson + "|" + time + "|" + url;
  }

  saveArraySub (aSub);
  saveArrayLes (aLes);
}

function loadArraySub () {
	var aSub = new Array();
	if (localStorage.getItem("subject") != null)
		aSub = JSON.parse(localStorage.getItem("subject"));

	return aSub;
}

function loadArrayLes () {
	var aLes = new Array();
	if (localStorage.getItem("lesson") != null)
		aLes = JSON.parse(localStorage.getItem("lesson"));

	return aLes;
}

function saveArraySub (aSub) {
	localStorage.setItem("subject", JSON.stringify(aSub));
}

function saveArrayLes (aLes) {
	localStorage.setItem("lesson", JSON.stringify(aLes));
}

function playLesson (evt) {
	var aLes = evt.target.myParam;
	var les = aLes.split("|")[0];
    var time = aLes.split("|")[1];
	var link = aLes.split("|")[2].concat("&gmbotles="+les.split(" ")[1]+"&gmbotime="+parseInt(time));
	chrome.tabs.create({ url: link });
}

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10);
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}

function printArrayInTable () {
  var aSub = loadArraySub ();
  var aLes = loadArrayLes ();
  var table = document.getElementById("lezioni-guardate");

  if (aSub.length != 0)
	  for(var i = 0; i<aSub.length; i++) {
		  var row = table.insertRow(i);
		  var td1 = row.insertCell(0);
		  var td2 = row.insertCell(1);
		  var td3 = row.insertCell(2);
		  var sub = aSub[i];
		  var tempaLes = aLes[i];
		  var les = tempaLes.split("|")[0];
		  var time = tempaLes.split("|")[1];
		  var url = tempaLes.split("|")[2];

		  td1.innerHTML = "<div class=\"sinistra sotto-sopra text\">" + sub + "</div><div class=\"sinistra sotto text\">" + les + " | " + time.toHHMMSS() + "</div>";
		  td2.innerHTML = "<img id=\"" + "playElement-" + i + "\" src=\"img/play.png\" />";
		  td3.innerHTML = "<img id=\"" + "removeElement-" + i + "\" src=\"img/remove.png\" />";

		  var play = window.document.getElementById("playElement-" + i);
		  play.addEventListener('click', playLesson, false);
		  play.myParam = tempaLes;

		  var remove = window.document.getElementById("removeElement-" + i);
		  remove.addEventListener('click', removeElementArrayFromClickImg, false);
		  remove.myParam = sub;
	  }
  else
  	table.innerHTML = "<div class=\"sotto-sopra text\">Nessuna lezione guardata.</div>";

 }

function setControlliVelocita(){
	var controls = document.getElementById("controlli-velocita");

	var currPbRt = localStorage.getItem("currentPlaybackRate") == null ? 1 : localStorage.getItem("currentPlaybackRate");

	controls.innerHTML="Velocit&agrave;: <input type=\"number\" value=\""+currPbRt+"\" min=\"0.5\" max=\"3\" step=\"0.5\" id=\"speedInput\">";

	console.log(controls);
}

window.addEventListener("load", printArrayInTable);
window.addEventListener("load", setControlliVelocita);
window.addEventListener('load', function load(event){
    var speedInput = document.getElementById('speedInput');

    speedInput.addEventListener('change', function(e) { 
	    
	    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	        chrome.tabs.sendMessage(tabs[0].id, {data: e.target.value}, function(response) {
	        	localStorage.setItem("currentPlaybackRate", response.data);
	        	speedInput.value=response.data;
	            console.log('ok');
	        });
	    });
    });
});

