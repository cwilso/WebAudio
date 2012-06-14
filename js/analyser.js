var animationRunning = false;
var analysers = new Array;
var CANVAS_WIDTH = 150;
var CANVAS_HEIGHT = 120;

function updateAnalyser(e) {
	var SPACER_WIDTH = 2;
	var BAR_WIDTH = 2;
	var OFFSET = 100;
	var CUTOFF = 23;
	var numBars = Math.round(CANVAS_WIDTH / SPACER_WIDTH);
	var ctx = e.drawingContext;
	var freqByteData = new Uint8Array(e.audioNode.frequencyBinCount);

	e.audioNode.getByteFrequencyData(freqByteData); 
	//analyser.getByteTimeDomainData(freqByteData);

	ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  	ctx.fillStyle = '#F6D565';
  	ctx.lineCap = 'round';
	var multiplier = e.audioNode.frequencyBinCount / numBars;

	// Draw rectangle for each frequency bin.
	for (var i = 0; i < numBars; ++i) {
		var magnitude = 0;
		var offset = Math.floor( i * multiplier );
		// gotta sum/average the block, or we miss narrow-bandwidth spikes
		for (var j = 0; j< multiplier; j++)
			magnitude += freqByteData[offset + j];
		magnitude = magnitude / multiplier;
		var magnitude2 = freqByteData[i * multiplier];
    	ctx.fillStyle = "hsl( " + Math.round((i*360)/numBars) + ", 100%, 50%)";
    	ctx.fillRect(i * SPACER_WIDTH, CANVAS_HEIGHT, BAR_WIDTH, -magnitude);
	}
}

function updateAnalysers(time) {
  	window.webkitRequestAnimationFrame( updateAnalysers );

	for (var i = 0; i < analysers.length; i++)
		updateAnalyser(analysers[i]);
}

