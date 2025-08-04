document.addEventListener('DOMContentLoaded', () => {

    // --- DOM ELEMENTS ---
    const calculatorEl = document.getElementById('calculator');
    const modeToggle = document.getElementById('mode-toggle');
    const display = document.querySelector('.calculator-screen');
    const keys = document.querySelector('.calculator-keys');

    // --- CALCULATOR STATE ---
    const calculator = {
        displayValue: '0',
        firstOperand: null,
        waitingForSecondOperand: false,
        operator: null,
    };

    // --- UI LOGIC ---

    /**
     * Updates the calculator screen with the current display value.
     */
    function updateDisplay() {
        display.value = calculator.displayValue;
    }

    /**
     * Toggles between basic and scientific calculator modes.
     */
    function toggleMode() {
        calculatorEl.classList.toggle('scientific-mode');
    }

    // --- EVENT LISTENERS ---

    modeToggle.addEventListener('change', toggleMode);

    keys.addEventListener('click', (event) => {
        const { target } = event;
        // Exit if the clicked element is not a button
        if (!target.matches('button')) {
            return;
        }

        // Delegate handling based on button type
        if (target.classList.contains('operator')) {
            handleOperator(target.value);
        } else if (target.classList.contains('decimal')) {
            inputDecimal(target.value);
        } else if (target.classList.contains('all-clear')) {
            resetCalculator();
        } else {
            inputDigit(target.value);
        }
        
        updateDisplay();
    });


    // --- INPUT HANDLING ---

    /**
     * Handles digit input.
     * @param {string} digit - The digit pressed.
     */
    function inputDigit(digit) {
        const { displayValue, waitingForSecondOperand } = calculator;

        if (waitingForSecondOperand === true) {
            calculator.displayValue = digit;
            calculator.waitingForSecondOperand = false;
        } else {
            calculator.displayValue = displayValue === '0' ? digit : displayValue + digit;
        }
    }

    /**
     * Handles decimal point input.
     * @param {string} dot - The decimal point.
     */
    function inputDecimal(dot) {
        if (calculator.waitingForSecondOperand) {
            calculator.displayValue = '0.';
            calculator.waitingForSecondOperand = false;
            return;
        }
        if (!calculator.displayValue.includes(dot)) {
            calculator.displayValue += dot;
        }
    }

    /**
     * Handles operator input (+, -, *, /, sqrt, ^, etc.).
     * @param {string} nextOperator - The operator pressed.
     */
    function handleOperator(nextOperator) {
        const { firstOperand, displayValue, operator } = calculator;
        const inputValue = parseFloat(displayValue);

        // Handle unary operators like sqrt, sin, etc.
        const unaryOperators = ['sqrt', 'exp', 'log', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan'];
        if (unaryOperators.includes(nextOperator)) {
            const result = calculate(null, inputValue, nextOperator);
            calculator.displayValue = `${parseFloat(result.toFixed(10))}`;
            calculator.firstOperand = result;
            return;
        }

        // Replace operator if waiting for the second operand
        if (operator && calculator.waitingForSecondOperand) {
            calculator.operator = nextOperator;
            return;
        }

        // Store the first operand if it doesn't exist
        if (firstOperand === null && !isNaN(inputValue)) {
            calculator.firstOperand = inputValue;
        } else if (operator) {
            // Perform calculation if an operator already exists
            const result = calculate(firstOperand, inputValue, operator);
            calculator.displayValue = `${parseFloat(result.toFixed(10))}`;
            calculator.firstOperand = result;
        }

        calculator.waitingForSecondOperand = true;
        calculator.operator = nextOperator;
    }


    // --- CALCULATION LOGIC ---

    /**
     * Performs the calculation based on the operator.
     * @param {number|null} firstOperand - The first number.
     * @param {number} secondOperand - The second number.
     * @param {string} operator - The operation to perform.
     * @returns {number} The result of the calculation.
     */
    function calculate(firstOperand, secondOperand, operator) {
        switch (operator) {
            case '+':
                return firstOperand + secondOperand;
            case '-':
                return firstOperand - secondOperand;
            case '*':
                return firstOperand * secondOperand;
            case '/':
                return firstOperand / secondOperand;
            case '=':
                return secondOperand;

            // Scientific Functions
            case '^':
                return Math.pow(firstOperand, secondOperand);
            case 'sqrt':
                return Math.sqrt(secondOperand);
            case 'exp':
                return Math.exp(secondOperand);
            case 'log':
                return Math.log(secondOperand);
            case 'sin':
                return Math.sin(secondOperand);
            case 'cos':
                return Math.cos(secondOperand);
            case 'tan':
                return Math.tan(secondOperand);
            case 'asin':
                return Math.asin(secondOperand);
            case 'acos':
                return Math.acos(secondOperand);
            case 'atan':
                return Math.atan(secondOperand);

            default:
                return secondOperand;
        }
    }

    /**
     * Resets the calculator to its initial state.
     */
    function resetCalculator() {
        calculator.displayValue = '0';
        calculator.firstOperand = null;
        calculator.waitingForSecondOperand = false;
        calculator.operator = null;
    }

    // --- INITIALIZE ---
    updateDisplay();
});
