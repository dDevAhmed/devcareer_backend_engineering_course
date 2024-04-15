function redactText(originalText, wordsToRedact, replacement = '****') {
    // Split the original text into an array of words
    let words = originalText.split(/\s+/);
    
    // Split the words to be redacted into an array
    let redactList = wordsToRedact.split(/\s+/);
    
    // Initialize variables to store stats
    let wordsScanned = words.length;
    let matchedWords = 0;
    let charactersScrambled = 0;
    
    // Iterate through each word in the original text
    let redactedText = words.map(word => {
        // Check if the word matches any word to be redacted
        if (redactList.includes(word.toLowerCase())) {
            // Increment matched words count
            matchedWords++;
            // Increment total characters scrambled
            charactersScrambled += word.length;
            // Replace the word with the replacement string
            return replacement.repeat(word.length);
        } else {
            return word;
        }
    }).join(' '); // Join the array back into a string
    
    // Calculate scrambling time (optional)
    let startTime = performance.now(); // Start time
    let endTime = performance.now(); // End time
    let scramblingTime = (endTime - startTime) / 1000; // Time in seconds
    
    // Display stats (optional)
    console.log(`Words scanned: ${wordsScanned}`);
    console.log(`Matched words: ${matchedWords}`);
    console.log(`Characters scrambled: ${charactersScrambled}`);
    console.log(`Scrambling time: ${scramblingTime} seconds`);
    
    // Return the redacted text
    return redactedText;
}

document.getElementById('redactButton').addEventListener('click', function() {
    // Get the input values
    let originalText = document.getElementById('originalText').value;
    let wordsToRedact = document.getElementById('wordsToRedact').value;
    let replacement = document.getElementById('replacement').value;

    // Call the redactText function and get the redacted text
    let redactedText = redactText(originalText, wordsToRedact, replacement);

    // Update the inner HTML of the #redactedText paragraph element with the redacted text
    document.getElementById('redactedText').innerHTML = redactedText;
});


// Example usage
// let originalText = "This is a sample text to test redaction functionality.";
// let wordsToRedact = "sample test";
// let replacement = '####'; // Optional, default is '****'
// let redactedText = redactText(originalText, wordsToRedact, replacement);
// console.log(redactedText);
