var dragObj = new Object();
dragObj.zIndex = 0;

// Node Dragging functions - these are used for dragging the audio nodes, 
// like Destination or AudioSourceBuffer.

function startDraggingNode(event) {
 	var el;
  	var x, y;

    dragObj.elNode = event.target;

    // If this is a text node, use its parent element.
    if (dragObj.elNode.nodeType == 3)
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
	// Get cursor position with respect to the page.
    x = event.clientX + window.scrollX;
    y = event.clientY + window.scrollY;

	// Move drag element by the same amount the cursor has moved.
  	dragObj.elNode.style.left = (dragObj.elStartLeft + x - dragObj.cursorStartX) + "px";
  	dragObj.elNode.style.top  = (dragObj.elStartTop  + y - dragObj.cursorStartY) + "px";

//TODO: update any connectors.
// if inputnode::
// if outputnode::

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
	// Get cursor position with respect to the page.
    x = event.clientX + window.scrollX;
    y = event.clientY + window.scrollY;

    dragObj.connectorShape.setAttributeNS(null, "x2", x);
    dragObj.connectorShape.setAttributeNS(null, "y2", y);
	
	// Move connector visual node
	// light up connector point underneath, if any
	var str=""+event.toElement.className;
	
	if (dragObj.input) {
		if (str.indexOf("outputconnector") != -1) {
			// TODO: light up - can connect!
		}
	} else {	// first node was an output, so we're looking for an input
		if (str.indexOf("inputconnector") != -1) {
			// TODO: light up - can connect!
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

	dragObj.connectorShape = null;
}

function stopDraggingConnector(event) {
  	// Stop capturing mousemove and mouseup events.
    document.removeEventListener("mousemove", whileDraggingConnector,   true);
    document.removeEventListener("mouseup",   stopDraggingConnector, true);

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
