var audioContext = null;

var tempx=100, tempy=100;

function createNewNode( nodeType, input, output ) {
	var e=document.createElement("div");
	e.className="node " + nodeType;
	e.style.left="" + tempx + "px";
	if (tempx > 500)
		tempx = 100;
		else
		tempx += 50;
	e.style.top="" + tempy + "px";
	if (tempy > 1000)
		tempy = 100;
		else
		tempy += 50;
	e.setAttribute("audioNodeType", nodeType );
	e.onmousedown=startDraggingNode;
	e.appendChild(document.createTextNode(nodeType));
	
	if (input) {
		var i=document.createElement("div");
		i.className="inputconnector";
		i.onmousedown=startDraggingConnector;
		e.appendChild(i);
		e.inputs = i;
	}
	
	if (output) {
		var i=document.createElement("div");
		i.className="outputconnector";
		i.onmousedown=startDraggingConnector;
		e.appendChild(i);
		e.outputs = i;
	}
	
	// add the node into the soundfield
	document.getElementById("soundField").appendChild(e);
	return(e);
}

function hitplay(e) {
  	e = e.target.parentNode; // the node element, not the play button.

	// if there's already a note playing, cut it off.
	if (e.audioNode)
		e.audioNode.noteOff(0);
		
	//TODO: disconnect the audioNode before releasing it
	
	// create a new BufferSource, set it to the buffer and connect it.
	var n = e.audioNode = audioContext.createBufferSource();
	n.loop = e.getElementsByTagName("input")[0].checked;
	n.gain.value = e.gain;
	
	if (e.outputConnections) {
		e.outputConnections.forEach(function(connection){  
		                      n.connect( connection.destination.audioNode ); });
	}

  	e.audioNode.buffer = e.buffer;
	e.audioNode.noteOn(0);
}

function oscNoteOn(e) {
  	e = e.target.parentNode; // the node element, not the play button.
	if (e.audioNode)
		e.audioNode.noteOn(0);
}

function hitstop(e) {
	e.target.parentNode.audioNode.noteOff(0);
}

function flipLoop(e) {
	e.target.checked = !e.target.checked;
	if (e.target.parentNode.audioNode)
		e.target.parentNode.audioNode.loop = e.target.checked;
}

function onUpdateFilterQ(e) {
	var param = e.parentNode.audioNode.Q;
	
	var i = parseFloat(e.getAttribute("val"));	// in range 0.0 - 100.0
	var range = param.maxValue - param.minValue;
	param.value = ((i * range) / 100) + param.minValue;
	//	console.log( e.parentNode.audioNode.frequency.value + "Hz Q=" + e.parentNode.audioNode.Q.value + "\n");
}

function onUpdateFrequency(e) {
	var param = e.parentNode.audioNode.frequency;
	
	var i = parseFloat(e.getAttribute("val"));	// in range 0.0 - 100.0
	var range = param.maxValue - param.minValue;
	param.value = ((i * range) / 100) + param.minValue;
//	console.log( e.parentNode.audioNode.frequency.value + "Hz Q=" + e.parentNode.audioNode.Q.value + "\n");
}

function onUpdateFilterGain(e) {
	var param = e.parentNode.audioNode.gain;
	
	var i = parseFloat(e.getAttribute("val"));	// in range 0.0 - 100.0
	var range = param.maxValue - param.minValue;
	param.value = ((i * range) / 100) + param.minValue;
}

function onUpdateABSNGain(e) {
	var i = parseFloat(e.getAttribute("val"));	// in range 0.0 - 100.0
	var node = e.parentNode;
	node.gain = i / 100;
	if (node.audioNode) {
		node.audioNode.gain.value = i / 100;
	}
//	console.log( e.parentNode.audioNode.gain.value + "\n");
}

function onUpdateDelayTime(e) {
	var i = parseFloat(e.getAttribute("val"));	// in range 0.0 - 100.0
	var node = e.parentNode;
	node.delay = i / 10;
	if (node.audioNode) {
		node.audioNode.delayTime.value = i / 10;
	}
//	console.log( e.parentNode.audioNode.gain.value + "\n");
}

function changeType(e) {
	if (e.target.parentNode.audioNode)
		e.target.parentNode.audioNode.type = e.target.selectedIndex;
}

function initDefaultParam(param) {
	var range = param.maxValue - param.minValue;
	param.value = param.defaultValue;
	return ((param.value - param.minValue) * 100) / range;
}

function createBiquadFilterNode() {
	var e=createNewNode("biquadFilter", true, true );
	var filter = audioContext.createBiquadFilter();
	e.audioNode = filter;
	filter.type=0;

	var ctl=document.createElement("select");
	ctl.type="select";
	ctl.value="type";
	ctl.addEventListener( "change", changeType );

	var opt = document.createElement("option");
	opt.setAttribute("value", "lowpass");
	opt.appendChild(document.createTextNode("Low Pass"));
	opt.setAttribute("selected");
	ctl.appendChild(opt);
	opt = document.createElement("option");
	opt.setAttribute("value", "highpass");
	opt.appendChild(document.createTextNode("High Pass"));
	ctl.appendChild(opt);
	opt = document.createElement("option");
	opt.setAttribute("value", "bandpass");
	opt.appendChild(document.createTextNode("Band Pass"));
	ctl.appendChild(opt);
	opt = document.createElement("option");
	opt.setAttribute("value", "lowshelf");
	opt.appendChild(document.createTextNode("Low Shelf"));
	ctl.appendChild(opt);
	opt = document.createElement("option");
	opt.setAttribute("value", "highshelf");
	opt.appendChild(document.createTextNode("High Shelf"));
	ctl.appendChild(opt);
	opt = document.createElement("option");
	opt.setAttribute("value", "peaking");
	opt.appendChild(document.createTextNode("Peaking"));
	ctl.appendChild(opt);
	opt = document.createElement("option");
	opt.setAttribute("value", "notch");
	opt.appendChild(document.createTextNode("Notch"));
	ctl.appendChild(opt);
	opt = document.createElement("option");
	opt.setAttribute("value", "allpass");
	opt.appendChild(document.createTextNode("All Pass"));
	ctl.appendChild(opt);
	
	ctl.selectedIndex="0";
	e.appendChild(ctl);

	ctl = createNewDialControl( 50, initDefaultParam(filter.Q) );
	ctl.style.left = "10px";
	ctl.style.top = "40px";
	ctl.onUpdateDial = onUpdateFilterQ;
	e.appendChild( ctl );

	ctl = createNewDialControl( 50, initDefaultParam(filter.frequency) );
	ctl.style.left = "70px";
	ctl.style.top = "40px";
	ctl.onUpdateDial = onUpdateFrequency;
	e.appendChild( ctl );

	ctl = createNewDialControl( 50, initDefaultParam(filter.gain) );
	ctl.style.left = "10px";
	ctl.style.top = "100px";
	ctl.onUpdateDial = onUpdateFilterGain;
	e.appendChild( ctl );

}

function createOscillatorNode() {
	var e=createNewNode("Oscillator", true, true );
	var osc = audioContext.createOscillator();
	e.audioNode = osc;
	osc.type=osc.SINE;

	var ctl=document.createElement("select");
	ctl.type="select";
	ctl.value="type";
	ctl.addEventListener( "change", changeType );

	var opt = document.createElement("option");
	opt.setAttribute("value", "sine");
	opt.appendChild(document.createTextNode("Sine"));
	opt.setAttribute("selected");
	ctl.appendChild(opt);
	opt = document.createElement("option");
	opt.setAttribute("value", "square");
	opt.appendChild(document.createTextNode("Square"));
	ctl.appendChild(opt);
	opt = document.createElement("option");
	opt.setAttribute("value", "sawtooth");
	opt.appendChild(document.createTextNode("Sawtooth"));
	ctl.appendChild(opt);
	opt = document.createElement("option");
	opt.setAttribute("value", "triangle");
	opt.appendChild(document.createTextNode("Triangle"));
	ctl.appendChild(opt);
	
	ctl.selectedIndex="0";
	e.appendChild(ctl);

	ctl=document.createElement("button");
	ctl.appendChild(document.createTextNode("note on"));
	ctl.onclick = oscNoteOn;
	e.appendChild(ctl);

	ctl=document.createElement("button");
	ctl.appendChild(document.createTextNode("note off"));
	ctl.onclick = hitstop;
	e.appendChild(ctl);

	ctl = createNewDialControl( 100, initDefaultParam(osc.frequency) );
	ctl.style.left = "10px";
	ctl.style.top = "55px";
	ctl.onUpdateDial = onUpdateFrequency;
	e.appendChild( ctl );

}

function onAnalyserConnectInput() {
	// set up 
	if (!animationRunning) {
		animationRunning = true;
		updateAnalysers( 0 );
	}
}

function createDelayNode() {
	var e=createNewNode("delay", true, true );
	var delayNode = audioContext.createDelayNode();
	e.audioNode = delayNode;

	delayNode.delayTime.value = 0.5;
	var ctl = createNewDialControl( 100, 5 );
	ctl.style.left = "25px";
	ctl.style.top = "50px";
	ctl.onUpdateDial = onUpdateDelayTime;
	e.appendChild( ctl );
}

function createAnalyserNode() {
	var e=createNewNode("analyser", true, true );
	var analyser = audioContext.createAnalyser();
	analyser.smoothingTimeConstant = "0.25"; // not much smoothing
	e.audioNode = analyser;
	var canvas = document.createElement( "canvas" );
	canvas.style.left = "10px";
	canvas.style.top = "35px";
	canvas.style.position = "absolute";
	canvas.height = "120";
	canvas.width = "150";
	canvas.className = "analyserCanvas"
	canvas.style.webkitBoxReflect = "below 0px -webkit-gradient(linear, left top, left bottom, from(transparent), color-stop(0.9, transparent), to(white))"
	
	e.appendChild( canvas );
	
	e.onConnectInput = onAnalyserConnectInput;
	analysers.push(e);	// Add to the list of analysers in the animation loop
	e.drawingContext = canvas.getContext('2d');
//	e.drawingContext.fillStyle = "blue";
//	e.drawingContext.fillRect(0,0,150, 120);
}

function createGainNode() {
	var e=createNewNode("gain", true, true );
	var gainNode = audioContext.createGainNode();
	e.audioNode = gainNode;

	gainNode.gain.value = 1.0;
	var ctl = createNewDialControl( 100, 100 );
	ctl.style.left = "25px";
	ctl.style.top = "50px";
	ctl.onUpdateDial = onUpdateABSNGain;
	e.appendChild( ctl );
}


function createAudioNodeFromBuffer( buffer ) {
	var e=createNewNode("audioBufferSource", false, true );

	e.buffer=buffer;
	
	var ctl=document.createElement("button");
	ctl.appendChild(document.createTextNode("play"));
	ctl.onclick = hitplay;
	e.appendChild(ctl);

	ctl=document.createElement("button");
	ctl.appendChild(document.createTextNode("stop"));
	ctl.onclick = hitstop;
	e.appendChild(ctl);

	ctl=document.createElement("input");
	ctl.type="checkbox";
	ctl.name="loop";
	ctl.value="loop";
	ctl.addEventListener( "onclick", flipLoop );
	e.appendChild(ctl);
	e.appendChild(document.createTextNode("loop  "));

	e.gain = 1.0;
	var ctl = createNewDialControl( 100, 100 );
	ctl.style.left = "25px";
	ctl.style.top = "50px";
	ctl.onUpdateDial = onUpdateABSNGain;
	e.appendChild( ctl );


}

function flipNormalize(e) {
	e.target.checked = !e.target.checked;
	if (e.target.parentNode.audioNode)
		e.target.parentNode.audioNode.normalize = e.target.checked;
}

function createConvolverNodeFromBuffer( buffer ) {
	var e=createNewNode("convolverNode", true, true );
	var convolver = audioContext.createConvolver();
	
	e.audioNode = convolver;
	e.buffer=buffer;
	convolver.buffer = buffer;
	
	ctl=document.createElement("input");
	ctl.type="checkbox";
	ctl.name="normalize";
	ctl.value="normalize";
	ctl.addEventListener( "onclick", flipNormalize );
	e.appendChild(document.createElement("br"));
	e.appendChild(ctl);
	e.appendChild(document.createTextNode("normalize"));
}

function downloadAudioFromURL( url ){
	var request = new XMLHttpRequest();
  	request.open('GET', url, true);
  	request.responseType = 'arraybuffer';

  	// Decode asynchronously
  	request.onload = function() {
    	audioContext.decodeAudioData( request.response, function(buffer) {
      		createAudioNodeFromBuffer(buffer);
    	}, function(){alert("error loading!");});
  	}
  	request.send();
}

function downloadImpulseFromURL( url ){
	var request = new XMLHttpRequest();
  	request.open('GET', url, true);
  	request.responseType = 'arraybuffer';

  	// Decode asynchronously
  	request.onload = function() {
    	audioContext.decodeAudioData( request.response, function(buffer) {
      		createConvolverNodeFromBuffer(buffer);
    	}, function(){alert("error loading!");});
  	}
  	request.send();
}

// Set up the page as a drop site for audio files. When an audio file is
// dropped on the page, it will be auto-loaded as an AudioBufferSourceNode.
function initDragDropOfAudioFiles() {
	window.ondragover = function () { this.className = 'hover'; return false; };
	window.ondragend = function () { this.className = ''; return false; };
	window.ondrop = function (e) {
  		this.className = '';
  		e.preventDefault();

	  var reader = new FileReader();
	  reader.onload = function (event) {
	  	audioContext.decodeAudioData( event.target.result, function(buffer) {
	    		createAudioNodeFromBuffer(buffer);
	  	}, function(){alert("error loading!");} ); 

	  };
	  reader.onerror = function (event) {
	    alert("Error: " + reader.error );
	  };
	  reader.readAsArrayBuffer(e.dataTransfer.files[0]);
	  return false;
	};	
}

// Initialization function for the page.
function init() {
	  	try {
	    	audioContext = new webkitAudioContext();
	  	}
	  	catch(e) {
	    	alert('Web Audio API is not supported in this browser');
	  	}

	initDragDropOfAudioFiles();	// set up page as a drop site for audio files

	// create the one-and-only destination node for the context
	var dest = createNewNode("destination", true, false );
	dest.style.backgroundImage = "url(Speaker_Icon_gray.svg)";
	dest.style.backgroundSize = "contain";
	dest.style.left = "" + (window.innerWidth - 225) + "px";
	dest.audioNode = audioContext.destination;
	stringifyAudio();
}

window.addEventListener('load', init, false);
