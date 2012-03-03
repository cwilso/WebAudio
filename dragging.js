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
    x = event.target.clientX + window.scrollX;
    y = event.target.clientY + window.scrollY;

  	// Save starting positions of cursor and element.
  	dragObj.cursorStartX = x;
  	dragObj.cursorStartY = y;

	// remember if this is an input or output node, so we can match
	dragObj.input = (dragObj.elNode.className.indexOf("inputconnector") != -1);
	
	// Create a connector visual node

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

	// Move connector visual node
	// light up connector point underneath, if any
	if (dragObj.input) {
		if (event.toElement.className.indexOf("outputconnector") != -1) {
			// can connect!
		}
	} else {	// first node was an output, so we're looking for an input
		if (event.toElement.className.indexOf("inputconnector") != -1) {
			// can connect!
		}
	}
	
    event.preventDefault();
	event.stopPropagation();
}

function connectNodes( src, dst ) {
	src.parentNode.dstNode = dst.parentNode;
	dst.parentNode.srcNode = src.parentNode;
	src.className += " connected";
	dst.className += " connected";
}

function stopDraggingConnector(event) {
  	// Stop capturing mousemove and mouseup events.
    document.removeEventListener("mousemove", whileDraggingConnector,   true);
    document.removeEventListener("mouseup",   stopDraggingConnector, true);

	var to = event.toElement;
	
	// If we're over a connection point, make the connection
	if (dragObj.input) {
		if (to.className.indexOf("outputconnector") != -1) {
			// can connect!
			connectNodes(to, dragObj.elNode);
		}
	} else {	// first node was an output, so we're looking for an input
		if (to.className.indexOf("inputconnector") != -1) {
			// can connect!
			connectNodes(dragObj.elNode, to);
		}
	}
	// Otherwise, delete the connector
}
