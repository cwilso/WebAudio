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

	// Create a connector visual node

  	// Capture mousemove and mouseup events on the page.
    document.addEventListener("mousemove", whileDraggingConnector,   true);
    document.addEventListener("mouseup",   stopDraggingConnector, 	true);
    event.preventDefault();
}

function whileDraggingConnector(event) {
	var x, y;
	// Get cursor position with respect to the page.
    x = event.clientX + window.scrollX;
    y = event.clientY + window.scrollY;

	// Move connector visual node
	// light up connector point underneath, if any

    event.preventDefault();
}

function stopDraggingConnector(event) {
  	// Stop capturing mousemove and mouseup events.
    document.removeEventListener("mousemove", whileDraggingConnector,   true);
    document.removeEventListener("mouseup",   stopDraggingConnector, true);

	// If we're over a connection point, make the connection
	// Otherwise, delete the connector
}
