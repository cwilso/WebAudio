//TODO:  
/* 

"add new" in ABS
drop sound file on ABS module

"add new" in convolver
drop convolver file on module

wavetable

*/


var audioContext = null;
var tempx=50, tempy=150;
var idX = 0;
var lastBufferLoaded = null;
var buffers = new Array();

function createNewModule( nodeType, input, output ) {
	var e=document.createElement("div");
	e.className="module " + nodeType;
	e.id = "module" + idX++;
	e.style.left="" + tempx + "px";
	e.style.top="" + tempy + "px";
	if (tempx > 700) {
		tempy += 250;
		tempx = 50;
	} else
		tempx += 250;
	if (tempy > 600)
		tempy = 100;

	e.setAttribute("audioNodeType", nodeType );
    e.addEventListener("mousedown", skipDefault,   false);
	e.addEventListener( 'pointerdown', startDraggingNode, false );
	var content = document.createElement("div");
	content.className="content";
	e.appendChild(content);
	var title = document.createElement("h6");
	title.className = "module-title";
	title.appendChild(document.createTextNode(nodeType));
	content.appendChild(title);

	if (input) {
		var i=document.createElement("div");
		i.className="node node-input ";
	    i.addEventListener( "mousedown", skipDefault, true );
		i.addEventListener( 'pointerdown', startDraggingConnector, false );
		i.innerHTML = "<span class='node-button'>&nbsp;</span>";
		e.appendChild(i);
		e.inputs = i;
	}
	
	if (output) {
		var i=document.createElement("div");
		i.className="node node-output";
	    i.addEventListener( "mousedown", skipDefault, true );
		i.addEventListener( 'pointerdown', startDraggingConnector, false );
		i.innerHTML = "<span class='node-button'>&nbsp;</span>";
		e.appendChild(i);
		e.outputs = i;
	}
	
	var close = document.createElement("a");
	close.href = "#";
	close.className = "close";
	close.onclick = deleteModule;
	e.appendChild( close );

	// add the node into the soundfield
	document.getElementById("modules").appendChild(e);
	return(content);
}

function addModuleSlider( element, label, ivalue, imin, imax, stepUnits, units, onUpdate ) {
	var group = document.createElement("div");
	group.className="control-group";

	var info = document.createElement("div");
	info.className="slider-info";
	info.setAttribute("min", imin );
	info.setAttribute("max", imax );
	var lab = document.createElement("span");
	lab.className="label";
	lab.appendChild(document.createTextNode(label));
	info.appendChild(lab);
	var val = document.createElement("span");
	val.className="value";
	val.appendChild(document.createTextNode("" + ivalue + " " + units));

	// cache the units type on the element for updates
	val.setAttribute("units",units);
	info.appendChild(val);

	group.appendChild(info);

	var slider = document.createElement("div");
	slider.className="slider";
	group.appendChild(slider);

	element.appendChild(group);
	return $( slider ).slider( { slide: onUpdate, value: ivalue, min: imin, max: imax, step: stepUnits } );
}


function onUpdateDetune(event, ui) {
	var e = updateSlider(event, ui);
	e.oscillatorDetune = ui.value;
	if (e.audioNode)
		e.audioNode.detune.value = ui.value;
}

function onUpdateOscillatorFrequency(event, ui) {
	var e = updateSlider(event, ui);
	e.oscillatorFrequency = ui.value;
	if (e.audioNode)
		e.audioNode.frequency.value = ui.value;
}

function onUpdateFrequency(event, ui) {
	updateSlider(event, ui).audioNode.frequency.value = ui.value;
}

function onUpdateGain(event, ui) {
	updateSlider(event, ui).audioNode.gain.value = ui.value;
}

function onUpdateDelay(event, ui) {
	updateSlider(event, ui).audioNode.delayTime.value = ui.value;
}

function onUpdateThreshold(event, ui) {
	updateSlider(event, ui).audioNode.threshold.value = ui.value;
}

function onUpdateKnee(event, ui) {
	updateSlider(event, ui).audioNode.knee.value = ui.value;
}

function onUpdateRatio(event, ui) {
	updateSlider(event, ui).audioNode.ratio.value = ui.value;
}

function onUpdateAttack(event, ui) {
	updateSlider(event, ui).audioNode.attack.value = ui.value;
}

function onUpdateRelease(event, ui) {
	updateSlider(event, ui).audioNode.release.value = ui.value;
}

function onUpdateQ(event, ui) {
	updateSlider(event, ui).audioNode.Q.value = ui.value;
}

function updateSlider(event, ui, callback) {
	var e = event.target;
	var group = null;
	while (!e.classList.contains("module")) {
		if (e.classList.contains("control-group"))
			group = e;
		e = e.parentNode;
	}

	//TODO: yes, this is lazy coding, and fragile.
	var output = group.children[0].children[1];

	// update the value text
	output.innerText = "" + ui.value + " " + output.getAttribute("units");
	return e;
}

function onPlayOscillator(event) {
	var playButton = event.target;
	if (playButton.isPlaying) {
		//stop
		playButton.isPlaying = false;
		playButton.src = "img/ico-play.gif";
		var e = playButton.parentNode;
		while (e && !e.classList.contains("module"))
			e = e.parentNode;
		if (e && e.audioNode) {
			e.audioNode.noteOff(0);
			e.audioNode = null;
		}
	} else {
		playButton.isPlaying = true;
		playButton.src = "img/ico-stop.gif";
		var e = playButton.parentNode;
		while (e && !e.classList.contains("module"))
			e = e.parentNode;
		if (e) {
			var oscNode = audioContext.createOscillator();
			oscNode.frequency.value = e.oscillatorFrequency;
			oscNode.detune.value = e.oscillatorDetune;
			oscNode.type = e.oscillatorType;
			e.audioNode = oscNode;
			if (e.outputConnections) {
				e.outputConnections.forEach(function(connection){  
				    oscNode.connect( connection.destination.audioNode ); });
			}
			oscNode.noteOn(0);
		}
	}
}

function onToggleLoop(event) {
	var checkbox = event.target;
	
	var e = checkbox.parentNode;
	while (e && !e.classList.contains("module"))
		e = e.parentNode;
	if (e)
		e.loop = checkbox.checked;
}

function onToggleNormalize(event) {
	var checkbox = event.target;

	var e = checkbox.parentNode;
	while (e && !e.audioNode)
		e = e.parentNode;
	if (e)
		e.audioNode.normalize = checkbox.checked;
}

function switchOscillatorTypes(event) {
	var select = event.target;

	var e = select.parentNode;
	while (e && !e.audioNode)
		e = e.parentNode;
	if (e) {
		// TODO: wavetable!

		//cache the type
		e.oscillatorType = select.selectedIndex;

		// if we have a playing oscillator, go ahead and switch it live
		if (e.audioNode)
			e.audioNode.type = select.selectedIndex;
	}
}

function switchAudioBuffer(event) {
	var select = event.target;

	var e = select.parentNode;
	while (e && !e.classList.contains("module"))
		e = e.parentNode;

	if (e) {
		if (select.selectedIndex == select.options.length-1) {
			// TODO: open dialog, add new
			alert( "Not yet implemented.");
			return;
		}
		e.buffer = buffers[ select.selectedIndex ];
	}
}


function switchFilterTypes(event) {
	var select = event.target;
	var fType = select.selectedIndex;

	var e = select.parentNode;
	while (e && !e.audioNode)
		e = e.parentNode;
	if (e) {
		e.audioNode.type = fType;
		if (fType>2 && fType<6) {
			e.children[0].children[3].classList.remove("disabled");
		} else {
			e.children[0].children[3].classList.add("disabled");
		}
	}
}

function stopABSource( playButton ) {
	//stop
	playButton.isPlaying = false;
	playButton.src = "img/ico-play.gif";
	var e = playButton.parentNode;
	while (e && !e.classList.contains("module"))
		e = e.parentNode;

	if ( !e )
		return;
	if ( e.stopTimer ) {
		window.clearTimeout(e.stopTimer);
		e.stopTimer = 0;
	}
	if ( e.audioNode )
		e.audioNode.noteOff(0);

}

function onPlayABSource(event) {
	var playButton = event.target;
	if (playButton.isPlaying)
		stopABSource( playButton );
	  else {
		playButton.isPlaying = true;
		playButton.src = "img/ico-stop.gif";

		var e = playButton.parentNode;
		while (e && !e.classList.contains("module"))
			e = e.parentNode;

		if (!e)
			return;

		// if there's already a note playing, cut it off.
		if (e.audioNode) {
			e.audioNode.noteOff(0);
			e.audioNode.disconnect();
			e.audioNode = null;
		}
		
		// create a new BufferSource, set it to the buffer and connect it.
		var n = e.audioNode = audioContext.createBufferSource();
		n.loop = e.loop;
		n.buffer = e.buffer;
	
		if (e.outputConnections) {
			e.outputConnections.forEach(function(connection){  
			                      n.connect( connection.destination.audioNode ); });
		}
		e.audioNode.noteOn(0);
		var delay = Math.floor( e.buffer.duration * 1000) + 1;
		if (!e.loop)
			e.stopTimer = window.setTimeout( stopABSource, delay, playButton );
	}
}

/* historic code, need to poach connection stuff
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

function hitstop(e) {
	e.target.parentNode.audioNode.noteOff(0);
	e.target.parentNode.audioNode = null;
}
*/



function createOscillator() {
	var osc = createNewModule( "oscillator", false, true );
	addModuleSlider( osc, "frequency", 440, 0, 8000, 1, "Hz", onUpdateOscillatorFrequency );
	addModuleSlider( osc, "detune", 0, -1200, 1200, 1, "cents", onUpdateDetune );

	var play = document.createElement("img");
	play.src = "img/ico-play.gif";
	play.style.marginTop = "10px";
	play.alt = "play";
	play.onclick = onPlayOscillator;
	osc.appendChild( play );
	
	osc = osc.parentNode;
	osc.className += " has-footer";

	// Add footer element
	var footer = document.createElement("footer");
	var sel = document.createElement("select");
	sel.className = "osc-type";
	var opt = document.createElement("option");
	opt.appendChild( document.createTextNode("sine"));
	sel.appendChild( opt );
	opt = document.createElement("option");
	opt.appendChild( document.createTextNode("square"));
	sel.appendChild( opt );
	opt = document.createElement("option");
	opt.appendChild( document.createTextNode("sawtooth"));
	sel.appendChild( opt );
	opt = document.createElement("option");
	opt.appendChild( document.createTextNode("triangle"));
	sel.appendChild( opt );
	opt = document.createElement("option");
	opt.appendChild( document.createTextNode("wavetable"));
	sel.onchange = switchOscillatorTypes;
	sel.appendChild( opt );
	footer.appendChild( sel );
	osc.appendChild( footer );
	
	// Cache default values on node element
	osc.oscillatorFrequency = 440;
	osc.oscillatorDetune = 0;
	osc.oscillatorType = 0;			// SINE

	if (this.event)
		this.event.preventDefault();
}

function createGain() {
	var module = createNewModule( "gain", true, true );
	addModuleSlider( module, "gain", 1.0, 0.0, 10.0, 0.01, "", onUpdateGain );

	// after adding sliders, walk up to the module to store the audioNode.
	module = module.parentNode;

	var gainNode = audioContext.createGainNode();
	gainNode.gain.value = 1.0;
	module.audioNode = gainNode;

	if (this.event)
		this.event.preventDefault();
}

function gotStream(stream) {
    // Create an AudioNode from the stream.
//    realAudioInput = audioContext.createMediaStreamSource(stream);
    this.audioNode = audioContext.createMediaStreamSource(stream);
}

function createLiveInput() {
	var module = createNewModule( "live input", false, true );

	// after adding sliders, walk up to the module to store the audioNode.
	module = module.parentNode;

    var gUM = navigator.getUserMedia ||
              navigator.webkitGetUserMedia ||
              navigator.mozGetUserMedia;
    if (!gUM)
        return(alert("Error: getUserMedia not supported!"));

    gUM({audio:true}, gotStream.bind(module), function(e) {
            alert('Error getting audio');
            console.log(e);
        });

	if (this.event)
		this.event.preventDefault();
}

function createDelay() {
	var module = createNewModule( "delay", true, true );
	addModuleSlider( module, "delay time", 0.2, 0.0, 10.0, 0.01, "sec", onUpdateDelay );

	// after adding sliders, walk up to the module to store the audioNode.
	module = module.parentNode;

	var delayNode = audioContext.createDelayNode();
	delayNode.delayTime.value = 0.2;
	module.audioNode = delayNode;

	if (this.event)
		this.event.preventDefault();
}

function createAudioBufferSourceFromMenu(event) {
	createAudioBufferSource(null);
}

function createAudioBufferSource( buffer ) {
	var module = createNewModule( "audiobuffersource", false, true );

	var play = document.createElement("img");
	play.src = "img/ico-play.gif";
	play.style.marginTop = "10px";
	play.alt = "play";
	play.onclick = onPlayABSource;
	module.appendChild( play );
	
	module = module.parentNode;
	module.className += " has-footer has-loop";

	// Add footer element
	var footer = document.createElement("footer");

	var looper = document.createElement("div");
	looper.className = "loop";
	var label = document.createElement("label");
	var check = document.createElement("input");
	check.type = "checkbox";
	check.onchange = onToggleLoop;
	label.appendChild(check);
	label.appendChild(document.createTextNode(" Loop"));
	looper.appendChild(label);
	footer.appendChild(looper);

	var sel = document.createElement("select");
	sel.className = "ab-source";
	var opt = document.createElement("option");

	if (buffer) {	// TODO:  NASTY HACK!  USING A GLOBAL! Should also add dropped files for all buffers.
		opt.appendChild( document.createTextNode( lastBufferLoaded ));
		sel.appendChild( opt );
		opt = document.createElement("option");
		buffers.splice(0,0,buffer);
		module.buffer = buffer;
	}

	opt.appendChild( document.createTextNode("glass-hit.ogg"));
	sel.appendChild( opt );
	opt = document.createElement("option");
	opt.appendChild( document.createTextNode("drums.ogg"));
	sel.appendChild( opt );
	opt = document.createElement("option");
	opt.appendChild( document.createTextNode("noise.ogg"));
	sel.appendChild( opt );
	opt = document.createElement("option");
	opt.appendChild( document.createTextNode("voice.ogg"));
	sel.appendChild( opt );
	opt = document.createElement("option");
	opt.appendChild( document.createTextNode("bass.ogg"));
	sel.appendChild( opt );
	opt = document.createElement("option");
	opt.appendChild( document.createTextNode("guitar.ogg"));
	sel.appendChild( opt );
	opt = document.createElement("option");
	opt.appendChild( document.createTextNode("  add new..."));
	sel.appendChild( opt );

	sel.onchange = switchAudioBuffer;
	footer.appendChild( sel );
	module.appendChild( footer );
	
	// Add select element and type options
	module.buffer = buffer ? buffer : glassBuffer;

	if (this.event)
		this.event.preventDefault();
	return module;
}


function createDynamicsCompressor() {
	var module = createNewModule( "dynamicscompressor", true, true );
	addModuleSlider( module, "threshold", -24.0, -36.0, 0.0, 0.01, "Db", onUpdateThreshold );
	addModuleSlider( module, "knee", 30.0, 0.0, 40.0, 0.01, "Db", onUpdateKnee );
	addModuleSlider( module, "ratio", 12.0, 1.0, 50.0, 0.1, "", onUpdateRatio );
	addModuleSlider( module, "attack", 0.003, 0.0, 1.0, 0.001, "sec", onUpdateAttack );
	addModuleSlider( module, "release", 0.25, 0.0, 2.0, 0.01, "sec", onUpdateRelease );

	// after adding sliders, walk up to the module to store the audioNode.
	module = module.parentNode;

	var audioNode = audioContext.createDynamicsCompressor();
	audioNode.threshold.value = -24.0;
	audioNode.knee.value = 20.0;
	audioNode.ratio.value = 12.0;
	audioNode.attack.value = 0.003;
	audioNode.release.value = 0.25;
	module.audioNode = audioNode;
	if (this.event)
		this.event.preventDefault();
}

function createConvolver() {
	var module = createNewModule( "convolver", true, true );

	module = module.parentNode;
	module.className += " has-footer has-loop";

	// Add footer element
	var footer = document.createElement("footer");

	var looper = document.createElement("div");
	looper.className = "loop";
	var label = document.createElement("label");
	var check = document.createElement("input");
	check.type = "checkbox";
	check.onchange = onToggleNormalize;
	label.appendChild(check);
	label.appendChild(document.createTextNode(" norm"));
	looper.appendChild(label);
	footer.appendChild(looper);

	var sel = document.createElement("select");
	sel.className = "ab-source";
	var opt = document.createElement("option");
	opt.appendChild( document.createTextNode("irHall.ogg"));
	sel.appendChild( opt );
	opt = document.createElement("option");
	opt.appendChild( document.createTextNode("irRoom.ogg"));
	sel.appendChild( opt );
	opt = document.createElement("option");
	opt.appendChild( document.createTextNode("irParkingGarage.ogg"));
	sel.appendChild( opt );
	footer.appendChild( sel );
	module.appendChild( footer );
	
	// Add select element and type options
	var audioNode = audioContext.createConvolver();
	audioNode.buffer = irHallBuffer;
	module.audioNode = audioNode;
	if (this.event)
		this.event.preventDefault();
}

function createAnalyser() {
	var module = createNewModule( "analyser", true, true );

	var canvas = document.createElement( "canvas" );
	canvas.height = "140";
	canvas.width = "240";
	canvas.className = "analyserCanvas";
	canvas.style.webkitBoxReflect = "below 0px -webkit-gradient(linear, left top, left bottom, from(transparent), color-stop(0.9, transparent), to(white))"
	canvas.style.backgroundImage = "url('img/analyser-bg.png')";
	module.appendChild( canvas );

	// after adding sliders, walk up to the module to store the audioNode.
	module = module.parentNode;

	var audioNode = audioContext.createAnalyser();
	module.audioNode = audioNode;

	audioNode.smoothingTimeConstant = "0.25"; // not much smoothing
	audioNode.fftSize = 512;
	audioNode.maxDecibels = 0;
	module.onConnectInput = onAnalyserConnectInput;
	analysers.push(module);	// Add to the list of analysers in the animation loop
	module.drawingContext = canvas.getContext('2d');

	if (this.event)
		this.event.preventDefault();
}

function onAnalyserConnectInput() {
	// set up 
	if (!animationRunning) {
		animationRunning = true;
		updateAnalysers( 0 );
	}
}

function createBiquadFilter() {
	var module = createNewModule( "biquadfilter", true, true );
	addModuleSlider( module, "frequency", 440, 0, 20000, 1, "Hz", onUpdateFrequency );
	addModuleSlider( module, "Q", 1, 1, 100, 0.1, "", onUpdateQ );
	var gainSlider = addModuleSlider( module, "gain", 1.0, 0.0, 10.0, 0.01, "", onUpdateGain );
	module.children[3].classList.add("disabled");
	// gainSlider.classList.add("disabled");

	module = module.parentNode;
	module.className += " has-footer";

	// cache the gain slider for later use
	module.gainSlider = gainSlider;

	// Add footer element
	var footer = document.createElement("footer");
	var sel = document.createElement("select");
	sel.className = "filter-type";
	var opt = document.createElement("option");
	opt.appendChild( document.createTextNode("lowpass"));
	sel.appendChild( opt );
	opt = document.createElement("option");
	opt.appendChild( document.createTextNode("highpass"));
	sel.appendChild( opt );
	opt = document.createElement("option");
	opt.appendChild( document.createTextNode("bandpass"));
	sel.appendChild( opt );
	opt = document.createElement("option");
	opt.appendChild( document.createTextNode("lowshelf"));
	sel.appendChild( opt );
	opt = document.createElement("option");
	opt.appendChild( document.createTextNode("highshelf"));
	sel.appendChild( opt );
	opt = document.createElement("option");
	opt.appendChild( document.createTextNode("peaking"));
	sel.appendChild( opt );
	opt = document.createElement("option");
	opt.appendChild( document.createTextNode("notch"));
	sel.appendChild( opt );
	opt = document.createElement("option");
	opt.appendChild( document.createTextNode("allpass"));
	sel.appendChild( opt );
	sel.onchange = switchFilterTypes;
	footer.appendChild( sel );
	module.appendChild( footer );
	
	// Add select element and type options
	var audioNode = audioContext.createBiquadFilter();
	audioNode.frequency.value = 440.0;
	audioNode.Q.value = 1.0;
	audioNode.gain.value = 1.0;
	module.audioNode = audioNode;

	if (this.event)
		this.event.preventDefault();
}

function deleteModule() {
	var moduleElement = this.parentNode;

	// First disconnect the audio
	disconnectNode( moduleElement );
	// Then delete the visual element
	moduleElement.parentNode.removeChild( moduleElement );
}

function downloadAudioFromURL( url ){
	var request = new XMLHttpRequest();
  	request.open('GET', url, true);
  	request.responseType = 'arraybuffer';

  	lastBufferLoaded = url;	// TODO: get last bit after the last /

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
// TODO: might want this indicator back
//	window.ondragover = function () { this.className = 'hover'; return false; };
//	window.ondragend = function () { this.className = ''; return false; };
	window.ondrop = function (e) {
  		this.className = '';
  		e.preventDefault();

	  var reader = new FileReader();
	  reader.onload = function (event) {
	  	audioContext.decodeAudioData( event.target.result, function(buffer) {
	    		createAudioBufferSource(buffer);
	  	}, function(){alert("error loading!");} ); 

	  };
	  reader.onerror = function (event) {
	    alert("Error: " + reader.error );
	  };
	  lastBufferLoaded = e.dataTransfer.files[0].name;
	  reader.readAsArrayBuffer(e.dataTransfer.files[0]);
	  return false;
	};	
}

var drumsBuffer,
    bassBuffer,
    voiceBuffer,
    noiseBuffer,
    guitarBuffer,
    irHallBuffer,
    irDrumRoomBuffer,
    irParkingGarageBuffer;

function startLoadingSounds() {
	var glassRequest = new XMLHttpRequest();
	glassRequest.open("GET", "sounds/glass-hit.ogg", true);
	glassRequest.responseType = "arraybuffer";
	glassRequest.onload = function() {
	  audioContext.decodeAudioData( glassRequest.response, function(buffer) { 
	    	glassBuffer = buffer; 
	    	buffers[0]= glassBuffer;
		} );
	}
	glassRequest.send();

	drumRequest = new XMLHttpRequest();
	drumRequest.open("GET", "sounds/drums.ogg", true);
	drumRequest.responseType = "arraybuffer";
	drumRequest.onload = function() {
	  audioContext.decodeAudioData( drumRequest.response, function(buffer) { 
	    	drumsBuffer = buffer; 
	    	buffers[1]= drumsBuffer;
		} );
	}
	drumRequest.send();


	noiseRequest = new XMLHttpRequest();
	noiseRequest.open("GET", "sounds/noise.ogg", true);
	noiseRequest.responseType = "arraybuffer";
	noiseRequest.onload = function() {
	  audioContext.decodeAudioData( noiseRequest.response, function(buffer) { 
	    	noiseBuffer = buffer; 
	    	buffers[2]= noiseBuffer;
		} );
	}
	noiseRequest.send();

	voiceRequest = new XMLHttpRequest();
	voiceRequest.open("GET", "sounds/voice.ogg", true);
	voiceRequest.responseType = "arraybuffer";
	voiceRequest.onload = function() {
	  audioContext.decodeAudioData( voiceRequest.response, function(buffer) { 
	    	voiceBuffer = buffer; 
	    	buffers[3]= voiceBuffer;
		} );
	}
	voiceRequest.send();

	bassRequest = new XMLHttpRequest();
	bassRequest.open("GET", "sounds/bass.ogg", true);
	bassRequest.responseType = "arraybuffer";
	bassRequest.onload = function() {
	  audioContext.decodeAudioData( bassRequest.response, function(buffer) { 
	    	bassBuffer = buffer; 
	    	buffers[4]= bassBuffer;
		} );
	}
	bassRequest.send();

	guitarRequest = new XMLHttpRequest();
	guitarRequest.open("GET", "sounds/guitar.ogg", true);
	guitarRequest.responseType = "arraybuffer";
	guitarRequest.onload = function() {
	  audioContext.decodeAudioData( guitarRequest.response, function(buffer) { 
	    	guitarBuffer = buffer; 
	    	buffers[5]= guitarBuffer;
		} );
	}
	guitarRequest.send();


	var irHallRequest = new XMLHttpRequest();
	irHallRequest.open("GET", "sounds/irHall.ogg", true);
	irHallRequest.responseType = "arraybuffer";
	irHallRequest.onload = function() {
	  audioContext.decodeAudioData( irHallRequest.response, function(buffer) { 
	    irHallBuffer = buffer; } );
	}
	irHallRequest.send();
}

function setClickHandler( id, handler ) {
    var el = document.getElementById( id );
    if (el) {
	    el.addEventListener( "mousedown", skipDefault, true );
		el.addEventListener( "pointerdown", handler, false );
	}
}

// Initialization function for the page.
function init() {
    try {
      audioContext = new AudioContext();
    } catch(e) {
      try {
        audioContext = new webkitAudioContext();
      } catch(e) {
        alert('Web Audio API is not supported in this browser.');
      }
    }

	initDragDropOfAudioFiles();	// set up page as a drop site for audio files

	startLoadingSounds();

	// create the one-and-only destination node for the context
	var dest = document.getElementById("output");
	dest.audioNode = audioContext.destination;
//	stringifyAudio();

	setClickHandler( "cabs", createAudioBufferSourceFromMenu );
	setClickHandler( "cosc", createOscillator );
	setClickHandler( "cliv", createLiveInput );
	setClickHandler( "cbqf", createBiquadFilter );
	setClickHandler( "cdel", createDelay );
	setClickHandler( "cdyc", createDynamicsCompressor );
	setClickHandler( "cgai", createGain );
	setClickHandler( "ccon", createConvolver );
	setClickHandler( "cana", createAnalyser );

//	if (navigator.userAgent.indexOf("Android") != -1)
//		document.body.style.zoom = "2";
}

window.addEventListener('load', init, false);
