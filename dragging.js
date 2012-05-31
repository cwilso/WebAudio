var dragObj = new Object();
dragObj.zIndex = 0;
dragObj.lastLit = null;

// Node Dragging functions - these are used for dragging the audio nodes, 
// like Destination or AudioSourceBuffer.

function startDraggingNode(event) {
 	var el;
  	var x, y;

	if (event.target.tagName == "SELECT")
		return;
		
    dragObj.elNode = event.target;

    // If this is a text node, use its parent element.
    if ((dragObj.elNode.nodeType == 3)||(dragObj.elNode.className == "analyserCanvas"))
    	dragObj.elNode = dragObj.elNode.parentNode;

	// Get cursor position with respect to the page.
    x = event.clientX + window.scrollX;
    y = event.clientY + window.scrollY;

  	// Save starting positions of cursor and element.
  	dragObj.cursorStartX = x;
  	dragObj.cursorStartY = y;
  	dragObj.elStartLeft  = parseInt(dragObj.elNode.style.left, 10);
  	dragObj.elStartTop   = parseInt(dragObj.elNode.style.top,  10);

  	if (isNaN(dragObj.elStartLeft)) dragObj.elStartLeft = 0;
  	if (isNaN(dragObj.elStartTop))  dragObj.elStartTop  = 0;

  	// Update element's z-index.
	dragObj.elNode.style.zIndex = ++dragObj.zIndex;

  	// Capture mousemove and mouseup events on the page.
    document.addEventListener("mousemove", whileDraggingNode,   true);
    document.addEventListener("mouseup",   stopDraggingNode, 	true);
    event.preventDefault();
}

function whileDraggingNode(event) {
	var x, y;
	var e = dragObj.elNode;

	// Get cursor position with respect to the page.
    x = event.clientX + window.scrollX;
    y = event.clientY + window.scrollY;

	// Move drag element by the same amount the cursor has moved.
  	e.style.left = (dragObj.elStartLeft + x - dragObj.cursorStartX) + "px";
  	e.style.top  = (dragObj.elStartTop  + y - dragObj.cursorStartY) + "px";

	if (e.inputConnections) {	// update any lines that point in here.
		var c;
		
		var off = e.inputs;
	    x = window.scrollX + 12;
	    y = window.scrollY + 12;

		while (off) {
			x+=off.offsetLeft;
			y+=off.offsetTop;
			off=off.offsetParent;
		}
		
		for (c=0; c<e.inputConnections.length; c++) {
			e.inputConnections[c].line.setAttributeNS(null, "x1", x);
			e.inputConnections[c].line.setAttributeNS(null, "y1", y);
		}
	}

	if (e.outputConnections) {	// update any lines that point out of here.
		var c;
		
		var off = e.outputs;
	    x = window.scrollX + 12;
	    y = window.scrollY + 12;

		while (off) {
			x+=off.offsetLeft;
			y+=off.offsetTop;
			off=off.offsetParent;
		}
		
		for (c=0; c<e.outputConnections.length; c++) {
			e.outputConnections[c].line.setAttributeNS(null, "x2", x);
			e.outputConnections[c].line.setAttributeNS(null, "y2", y);
		}
	}

    event.preventDefault();
}


function stopDraggingNode(event) {
  // Stop capturing mousemove and mouseup events.
    document.removeEventListener("mousemove", whileDraggingNode,   true);
    document.removeEventListener("mouseup",   stopDraggingNode, true);
}

// Connector Dragging functions - these are used for dragging the connectors 
// between Audio nodes
function startDraggingConnector(event) {
 	var el;
  	var x, y;

    dragObj.elNode = event.target;

    // If this is a text node, use its parent element.
    if (dragObj.elNode.nodeType == 3)
    	dragObj.elNode = dragObj.elNode.parentNode;

	// Get the position of the originating connector with respect to the page.
	var off = event.target;
    x = window.scrollX + 12;
    y = window.scrollY + 12;

	while (off) {
		x+=off.offsetLeft;
		y+=off.offsetTop;
		off=off.offsetParent;
	}

  	// Save starting positions of cursor and element.
  	dragObj.cursorStartX = x;
  	dragObj.cursorStartY = y;

	// remember if this is an input or output node, so we can match
	dragObj.input = (dragObj.elNode.className.indexOf("inputconnector") != -1);

	dragObj.elNode.unlitClassname = dragObj.elNode.className;
	dragObj.elNode.className += " canConnect";
	
	// Create a connector visual line
	var svgns = "http://www.w3.org/2000/svg";

	var shape = document.createElementNS(svgns, "line");
	shape.setAttributeNS(null, "x1", x);
	shape.setAttributeNS(null, "y1", y);
    shape.setAttributeNS(null, "x2", x);
    shape.setAttributeNS(null, "y2", y);
    shape.setAttributeNS(null, "stroke", "black");
	shape.setAttributeNS(null, "stroke-width", "5");
	dragObj.connectorShape=shape;

    document.getElementById("svgCanvas").appendChild(shape);

  	// Capture mousemove and mouseup events on the page.
    document.addEventListener("mousemove", whileDraggingConnector,   true);
    document.addEventListener("mouseup",   stopDraggingConnector, 	true);
    event.preventDefault();
	event.stopPropagation();
}

function whileDraggingConnector(event) {
	var x, y;
	var toElem = event.toElement;
	
	// Get cursor position with respect to the page.
    x = event.clientX + window.scrollX;
    y = event.clientY + window.scrollY;

    dragObj.connectorShape.setAttributeNS(null, "x2", x);
    dragObj.connectorShape.setAttributeNS(null, "y2", y);
	
	// Move connector visual node
	// light up connector point underneath, if any
	var str = "" + toElem.className;
	
	if (dragObj.lastLit && (dragObj.lastLit != toElem ) ) {
		dragObj.lastLit.className = dragObj.lastLit.unlitClassname;
		dragObj.lastLit = null;
	}
	
	if (!dragObj.lastLit || (dragObj.lastLit != toElem )) {
		if (dragObj.input) {
			if (str.indexOf("outputconnector") != -1) {
				toElem.unlitClassname = toElem.className;
				toElem.className += " canConnect";
				dragObj.lastLit = toElem;
			}
		} else {	// first node was an output, so we're looking for an input
			if (str.indexOf("inputconnector") != -1) {
				toElem.unlitClassname = toElem.className;
				toElem.className += " canConnect";
				dragObj.lastLit = toElem;
			}
		}
	}
	
    event.preventDefault();
	event.stopPropagation();
}

// Make a connection between two connection point elements.
// the src and dst params are connection point elems, NOT
// the node elems themselves.
function connectNodes( src, dst ) {
	src.className += " connected";
	dst.className += " connected";

	// We want to be dealing with the audio node elements from here on
	src = src.parentNode;
	dst = dst.parentNode;
	
	// Put an entry into the source's outputs
	if (!src.outputConnections)
		src.outputConnections = new Array();
	var connector = new Object();
	connector.line = dragObj.connectorShape;
	connector.destination = dst;
	src.outputConnections.push(connector);
	
	//Make sure the connector line points go from src->dest (x1->x2)
	if (!dragObj.input) { // need to flip
		var shape = dragObj.connectorShape;
		var x = shape.getAttributeNS(null, "x2");
		var y = shape.getAttributeNS(null, "y2");
	    shape.setAttributeNS(null, "x2", shape.getAttributeNS(null, "x1"));
	    shape.setAttributeNS(null, "y2", shape.getAttributeNS(null, "y1"));
		shape.setAttributeNS(null, "x1", x);
		shape.setAttributeNS(null, "y1", y);
	}
	// Put an entry into the destinations's inputs
	if (!dst.inputConnections)
		dst.inputConnections = new Array();
	connector = new Object();
	connector.line = dragObj.connectorShape;
	connector.source = src;
	dst.inputConnections.push(connector);
	
	// if the source has an audio node, connect them up.  
	// AudioBufferSourceNodes may not have an audio node yet.
	if (src.audioNode )
		src.audioNode.connect(dst.audioNode);

	if (dst.onConnectInput)
		dst.onConnectInput();
	dragObj.connectorShape = null;
}

function stopDraggingConnector(event) {
  	// Stop capturing mousemove and mouseup events.
    document.removeEventListener("mousemove", whileDraggingConnector,   true);
    document.removeEventListener("mouseup",   stopDraggingConnector, true);

	if (dragObj.lastLit) {
		dragObj.lastLit.className = dragObj.lastLit.unlitClassname;
		dragObj.lastLit = null;
	}

	dragObj.elNode.className = dragObj.elNode.unlitClassname;
	
	var to = event.toElement;

	// Get the position of the originating connector with respect to the page.
	var off = to;
	x = window.scrollX + 12;
	y = window.scrollY + 12;

	while (off) {
		x+=off.offsetLeft;
		y+=off.offsetTop;
		off=off.offsetParent;
	}
	dragObj.connectorShape.setAttributeNS(null, "x2", x);
    dragObj.connectorShape.setAttributeNS(null, "y2", y);

	var str=""+to.className;
	
	// If we're over a connection point, make the connection
	if (dragObj.input) {
		if (str.indexOf("outputconnector") != -1) {
			// can connect!
			connectNodes(to, dragObj.elNode);
			return;
		}

	} else {	// first node was an output, so we're looking for an input
		if (str.indexOf("inputconnector") != -1) {
			// can connect!
			// TODO: first: swap the line endpoints so they're consistently x1->x2
			// That makes updating them when we drag nodes around easier.
			connectNodes(dragObj.elNode, to);
			return;
		}
	}

	// Otherwise, delete the connector
	dragObj.connectorShape.parentNode.removeChild(dragObj.connectorShape);
	dragObj.connectorShape = null;
}

function stringifyAudio() {
	var code = "var context=null;\ntry \{\n\tcontext = window.webkitAudioContent ? " +
		"new webkitAudioContext\(\) : new audioContext;\n}\ncatch(e) \{\n" +
		"\talert\('Web Audio API is not supported in this browser'\);\n\}\n";

	var nodes = document.getElementById("soundField").children;

	for (var i=0; i<nodes.length; i++) {
		if ( nodes[i].audioNode ) {
			switch ( nodes[i].audioNodeType ) {
				case "audioBufferSource":
					code += "\tvar ABSN = context.createBufferSource();\n\tABSN.gain = " + 
						nodes[i].gain + ";\n\tABSN.buffer = myBuffer;\n\tABSN.connect();\n";
					break;
			}
		}
	}
	// add the node into the soundfield
	document.getElementById("code").innerHTML = code;
}
