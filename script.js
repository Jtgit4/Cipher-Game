let cipherMapping = {};
let originalText = "";
const maxCharactersPerRow = 35;

function fetchNewCipherText() {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                originalText = response.original_text;
                populateText(response.cipher_text);
                clearGuesses();
                hideBanner();
                
                // Added this block to clear input boxes
                const letterInputs = document.querySelectorAll('.letter-pairing input');
                letterInputs.forEach(input => {
                    input.value = '';
                });
                
                console.log('Input boxes should be cleared'); // Add this line for debugging
                
            } else {
                console.error("Failed to fetch new cipher text");
            }
        }
    };
    xhr.open("GET", "/fetch_cipher_text", true);
    xhr.send();
}

function clearAllAssignments() {
    // Clear the cipher mapping
    cipherMapping = {};

    // Clear each input box by setting its value to an empty string
    const letterInputs = document.querySelectorAll('.letter-pairing input');
    for (let input of letterInputs) {
        input.value = '';
    }

    // Update the clear text blocks
    updateClearTextBlocks();

    console.log('All assignments cleared');
}

function populateText(cipherText) {
    const textSection = document.querySelector(".text-section");
    textSection.innerHTML = "";
  
    let charCount = 0;
    let rowElement;
  
    for (let i = 0; i < cipherText.length; i++) {
      const letter = cipherText[i];
      const isPunctuation = /[^\w\s]|_/.test(letter);
  
      // Check if we need to start a new row
      if (charCount % maxCharactersPerRow === 0) {
        rowElement = document.createElement("div");
        rowElement.classList.add("text-row");
        textSection.appendChild(rowElement);
      }
  
      const charContainer = document.createElement("div");
      charContainer.classList.add("char-container");
  
      const cipherTextBlock = document.createElement("span");
      cipherTextBlock.classList.add("text-block", "cipher-text");
      cipherTextBlock.innerText = letter === " " ? "_" : letter.toUpperCase();
      cipherTextBlock.onclick = handleCipherTextClick;
      charContainer.appendChild(cipherTextBlock);
  
      const clearTextBlock = document.createElement("span");
      clearTextBlock.classList.add("text-block", "clear-text");
      clearTextBlock.innerText = isPunctuation ? letter : "_";
      charContainer.appendChild(clearTextBlock);
  
      rowElement.appendChild(charContainer);
      charCount++;
    }
  }

function hideBanner() {
    const resultBanner = document.getElementById("result-banner");
    if (resultBanner) {
        resultBanner.classList.add("hidden");
    }
}

/* 
function submitGuess() {
    const guessedLetter = document.getElementById("guessed-letter").value.toUpperCase();
    if (selectedCipherLetter && guessedLetter) {
        // Check if the guessed letter is already assigned to another cipher letter
        if (Object.values(cipherMapping).includes(guessedLetter)) {
            alert(`The letter ${guessedLetter} is already assigned to another cipher letter.`);
            return;
        }
        
        cipherMapping[selectedCipherLetter] = guessedLetter;
        const charContainers = document.querySelectorAll(".char-container");
        for (let container of charContainers) {
            const cipherTextBlock = container.querySelector(".cipher-text");
            const clearTextBlock = container.querySelector(".clear-text");
            const cipherLetter = cipherTextBlock.innerText;
            if (cipherMapping[cipherLetter]) {
                clearTextBlock.innerText = cipherMapping[cipherLetter];
            }
        }
    }
} */


/*function checkSolution() {
    const guessedText = Array.from(document.querySelectorAll(".clear-text"))
      .map(e => e.innerText.replace('-', ' '))
      .join('')
      .toLowerCase()
      .replace(/[^\w\s]|_/g, ""); // Remove punctuation and spaces
  
    const originalTextWithoutPunctuation = originalText
      .toLowerCase()
      .replace(/[^\w\s]|_/g, ""); // Remove punctuation and spaces
  
    const resultBanner = document.getElementById("result-banner");
    if (!resultBanner) return;
  
    if (guessedText === originalTextWithoutPunctuation) {
      resultBanner.classList.remove("hidden");
      resultBanner.innerText = "Congratulations, you cracked the cipher!";
    } else {
      resultBanner.classList.remove("hidden");
      resultBanner.innerText = "Not correct, keep trying!";
    }
  }
  */

  function checkSolution() {
    const charContainers = document.querySelectorAll('.char-container');
    
    let guessedText = '';
    charContainers.forEach(container => {
        const clearTextElement = container.querySelector('.clear-text');
        const cipherTextElement = container.querySelector('.cipher-text');
        const clearTextChar = clearTextElement.innerText;
        const cipherTextChar = cipherTextElement.innerText;

        // Append the clear text character or, if it's an underscore, the cipher text character
        guessedText += clearTextChar !== '_' ? clearTextChar : (cipherTextChar === '-' ? ' ' : cipherTextChar);
    });

    const normalizedGuessedText = guessedText.replace(/-/g, ' '); // replace hyphens with spaces
    const normalizedOriginalText = originalText.replace(/ /g, ''); // remove spaces

    const resultBanner = document.getElementById("result-banner");
    if (!resultBanner) return;

    if (normalizedGuessedText.toLowerCase() === normalizedOriginalText.toLowerCase()) {
        resultBanner.classList.remove("hidden");
        resultBanner.innerText = "Congratulations, you cracked the cipher!";
    } else {
        resultBanner.classList.remove("hidden");
        resultBanner.innerText = "Not correct, keep trying!";
    }
}

function clearGuesses() {
    cipherMapping = {};
    const clearTextBlocks = document.querySelectorAll(".clear-text .text-block");
    clearTextBlocks.forEach(block => block.innerText = '_');
    hideBanner();
}

window.addEventListener("DOMContentLoaded", () => {
    fetchNewCipherText();
    addLetterPairingListeners();
});

function addLetterPairingListeners() {
    const letterInputs = document.querySelectorAll('.letter-pairing input');
    letterInputs.forEach(input => {
        input.addEventListener('input', (event) => {
            const guessedLetter = event.target.value.toUpperCase();
            const cipherLetter = event.target.parentElement.getAttribute('data-cipher-letter');

            // Check if the input is cleared
            if (event.target.value === '') {
                // Remove the guessed letter from the cipherMapping
                delete cipherMapping[cipherLetter];
                updateClearTextBlocks();
                return;
            }

            // Check if the guessed letter is already assigned to another cipher letter
            if (Object.values(cipherMapping).includes(guessedLetter)) {
                alert(`The letter ${guessedLetter} is already assigned to another cipher letter.`);
                event.target.value = ''; // Clear the input
                return;
            }

            cipherMapping[cipherLetter] = guessedLetter;
            updateClearTextBlocks();
        });
    });
}

function updateClearTextBlocks() {
    const charContainers = document.querySelectorAll(".char-container");
    for (let container of charContainers) {
        const cipherTextBlock = container.querySelector(".cipher-text");
        const clearTextBlock = container.querySelector(".clear-text");
        const cipherLetter = cipherTextBlock.innerText;
        if (cipherMapping[cipherLetter]) {
            clearTextBlock.innerText = cipherMapping[cipherLetter];
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // ... existing code ...

    // Add a click event listener to the cipher text letters
    const cipherTextElements = document.querySelectorAll('.text-section span');
    cipherTextElements.forEach(element => {
        element.addEventListener('click', handleCipherTextClick);
    });
});

let selectedCipherLetter = null;

function handleCipherTextClick(event) {
    const letter = event.target.innerText;

    // Deselect previously selected letters
    const allSelected = document.querySelectorAll('.cipher-text.selected');
    allSelected.forEach(element => {
        element.classList.remove('selected');
    });

    // Select the clicked letter, only if it's a letter from A-Z
    if (letter.match(/[A-Z]/)) {
        // Find all instances of the same letter and add 'selected' class
        const sameLetterElements = document.querySelectorAll(`.cipher-text`);
        sameLetterElements.forEach(element => {
            if (element.innerText === letter) {
                element.classList.add('selected');
            }
        });

        selectedCipherLetter = event.target;
    }
}

document.addEventListener('keyup', function (event) {
    if (selectedCipherLetter) {
        const letter = event.key.toUpperCase();
        if (letter.length === 1 && letter.match(/[A-Z]/)) {
            // Set the typed letter to the input box for the selected cipher text letter
            const cipherLetter = selectedCipherLetter.innerText;
            
            // Modified query selector to match the HTML structure
            const inputBox = document.querySelector(`input[data-cipher-letter='${cipherLetter}']`);
            
            if (inputBox) { // Check if the inputBox is found
                inputBox.value = letter; // Set the value instead of appending

                // Check if the guessed letter is already assigned to another cipher letter
                if (Object.values(cipherMapping).includes(letter)) {
                    alert(`The letter ${letter} is already assigned to another cipher letter.`);
                    inputBox.value = ''; // Clear the input
                    return;
                }

                // Update the mapping and the de-cipher text
                cipherMapping[cipherLetter] = letter;
                updateClearTextBlocks();
            } else {
                console.log('inputBox not found for cipherLetter:', cipherLetter);
            }
        }
    }
});

document.querySelectorAll('.input-box').forEach(inputBox => {
    inputBox.addEventListener('input', function(event) {
        const cipherLetter = this.getAttribute('data-cipher-letter');
        const letter = this.value.toUpperCase();

        // Make sure it is a single letter and within the A-Z range
        if (letter.length === 1 && letter.match(/[A-Z]/)) {
            // Check if the guessed letter is already assigned to another cipher letter
            if (Object.values(cipherMapping).includes(letter) && cipherMapping[cipherLetter] !== letter) {
                alert(`The letter ${letter} is already assigned to another cipher letter.`);
                this.value = cipherMapping[cipherLetter] || ''; // Reset to previous value or empty
                return;
            }
            
            // Update the mapping and the de-cipher text
            cipherMapping[cipherLetter] = letter;
            updateClearTextBlocks();
        } else {
            this.value = ''; // Clear the input if invalid
        }
    });
});


