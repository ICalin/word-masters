const row = 6;
const column = 5;
const gridContainer = document.getElementById('myGrid');
let secret = 'CALIN';
let currentInput = '';
currentRow = 0;
let message = document.querySelector('.titleColor');


async function getWord() {
    try {
        console.log('Fetching word of the day...');
        let response = await fetch('https://words.dev-apis.com/word-of-the-day');
        const json = await response.json();
        console.log('Word of the day:', json);
        secret = json.word.toUpperCase();
    } catch (error) {
        console.error('Failed to fetch the word of the day:');
    }
}

async function postWord(currentInput) {
    try {
        const response = await fetch('https://words.dev-apis.com/validate-word', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ word: currentInput }), // Ensure the word is included in the request
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Validation result:', result);
        return result.validWord; // Return true if the word is valid
    } catch (error) {
        console.error('Error while validating the word:', error);
        return false; // Treat as invalid word in case of error
    }
}

async function readInput(event) {
    const key = event.key;
    const gridItems = Array.from(gridContainer.getElementsByClassName('grid-item'));


    if (key.length === 1 && key.match(/[a-z]/i) && currentInput.length < 5) {
        const gridIndex = currentRow * column + currentInput.length;
        if (gridIndex >= 0 && gridIndex < gridItems.length) {
            gridItems[gridIndex].textContent = key.toUpperCase();
            currentInput += key.toUpperCase();
        }
    }

    else if (key === 'Backspace') {
        const gridIndex = currentRow * column + currentInput.length - 1;
        gridItems[gridIndex].textContent = '';
        currentInput = currentInput.slice(0, -1);

    }
    else if (key === 'Enter' && currentInput.length === 5) {
        const shouldIncrementRow = await checkWord(currentInput, currentRow);
        if (shouldIncrementRow) {
            currentRow += 1;
        }
        currentInput = '';
    }

}

function redOutline(gridItems) {
    for (let i = 0; i < column; i++) {
        const gridIndex = currentRow * column + i;
        gridItems[gridIndex].style.outline = '2px solid red';
    }
    setTimeout(() => {
        for (let i = 0; i < column; i++) {
            const gridIndex = currentRow * column + i;
        
            gridItems[gridIndex].style.outline = 'none';

        }

    }, 1000);
}

async function checkWord(input, currentRow) {
    const isEnglishWord = await postWord(input); // Pass input to validate

    if (!isEnglishWord) {
        console.log('Not a valid English word!');
        // Clear the current row
        const gridItems = Array.from(gridContainer.getElementsByClassName('grid-item'));
        redOutline(gridItems);
        for (let i = 0; i < column; i++) {
            const gridIndex = currentRow * column + i;
            gridItems[gridIndex].textContent = ''; // Clear the grid cell
        }
        currentInput = '';
        return false;
    }

    changeColor(input, currentRow);

    if (input === secret) {
        message.textContent = 'You Won';
        message.style.color = 'green';
        console.log('You won!');
        document.removeEventListener('keydown', readInput);
    } else if (currentRow === row - 1) {
        message.textContent = `You lost, the word was ${secret}`;
    }

    return true;
}


function changeColor(input, currentRow) {
    const gridItems = Array.from(gridContainer.getElementsByClassName('grid-item'));
    const startIndex = currentRow * column;

    const secretFrequency = {};
    for (const char of secret) {
        secretFrequency[char] = (secretFrequency[char] || 0) + 1;
    }


    for (let i = 0; i < column; i++) {
        const gridItem = gridItems[startIndex + i];
        if (input[i] === secret[i]) {
            gridItem.style.backgroundColor = 'green';
            secretFrequency[input[i]] -= 1;
        }
    }


    for (let i = 0; i < column; i++) {
        const gridItem = gridItems[startIndex + i];
        if (gridItem.style.backgroundColor !== 'green') {
            if (secret.includes(input[i]) && secretFrequency[input[i]] > 0) {
                gridItem.style.backgroundColor = 'yellow';
                secretFrequency[input[i]] -= 1;
            }
        }

    }
}

function createGrid(row, column) {
    for (let i = 0; i < row; i++)
        for (let j = 0; j < column; j++) {
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item';
            gridItem.textContent = '';
            gridContainer.appendChild(gridItem);

        }
    document.addEventListener('keydown', readInput);

}

document.addEventListener('DOMContentLoaded', () => {
    createGrid(row, column);
    getWord();
});

