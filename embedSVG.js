function embedSVG(divId, svgPath) {
    // Find the <div> element by its id
    var div = document.getElementById(divId);

    // Create a new XMLHttpRequest object
    var xhr = new XMLHttpRequest();

    // Set up the request
    xhr.open('GET', svgPath, true);

    // Set the responseType to 'text' to receive the SVG markup as text
    xhr.responseType = 'text';

    // Define the onload function to handle the successful response
    xhr.onload = function() {
        // Check if the request was successful (status code 200)
        if (xhr.status === 200) {
            // Create a new <div> element to hold the SVG markup
            var svgDiv = document.createElement('div');
            
            // Set the innerHTML of the <div> to the SVG markup received from the response
            svgDiv.innerHTML = xhr.responseText;

            // Append the <div> containing the SVG markup to the specified <div>
            div.appendChild(svgDiv);
        }
    };

    // Define the onerror function to handle any errors
    xhr.onerror = function() {
        console.error('Error loading SVG file.');
    };

    // Send the request
    xhr.send();
}