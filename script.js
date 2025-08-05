document.addEventListener('DOMContentLoaded', () => {

    // --- NEW: TOP-LEVEL APP NAVIGATION LOGIC ---
    window.openApp = function(evt, appName) {
        const appPages = document.querySelectorAll(".app-page");
        appPages.forEach(page => page.style.display = "none");

        const appTabLinks = document.querySelectorAll(".app-tab-link");
        appTabLinks.forEach(tab => tab.classList.remove("active"));

        document.getElementById(appName).style.display = "block";
        evt.currentTarget.classList.add("active");
    };

    // --- SCIENTIFIC CALCULATOR LOGIC ---
    const calculatorEl = document.getElementById('calculator');
    const display = calculatorEl.querySelector('.calculator-screen');
    const keys = calculatorEl.querySelector('.calculator-keys');

    const calculator = {
        displayValue: '0',
        firstOperand: null,
        waitingForSecondOperand: false,
        operator: null,
    };

    function updateCalcDisplay() {
        display.value = calculator.displayValue;
    }
    updateCalcDisplay();

    keys.addEventListener('click', (event) => {
        const { target } = event;
        if (!target.matches('button')) return;

        if (target.classList.contains('operator')) handleOperator(target.value);
        else if (target.classList.contains('decimal')) inputDecimal(target.value);
        else if (target.classList.contains('all-clear')) resetCalculator();
        else inputDigit(target.value);
        
        updateCalcDisplay();
    });

    function inputDigit(digit) {
        if (calculator.waitingForSecondOperand) {
            calculator.displayValue = digit;
            calculator.waitingForSecondOperand = false;
        } else {
            calculator.displayValue = calculator.displayValue === '0' ? digit : calculator.displayValue + digit;
        }
    }

    function inputDecimal(dot) {
        if (calculator.waitingForSecondOperand) {
            calculator.displayValue = '0.';
            calculator.waitingForSecondOperand = false;
            return;
        }
        if (!calculator.displayValue.includes(dot)) calculator.displayValue += dot;
    }

    function handleOperator(nextOperator) {
        const { firstOperand, displayValue, operator } = calculator;
        const inputValue = parseFloat(displayValue);
        const unaryOperators = ['sqrt', 'exp', 'log', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan'];
        
        if (unaryOperators.includes(nextOperator)) {
            const result = performCalculation(null, inputValue, nextOperator);
            calculator.displayValue = `${parseFloat(result.toFixed(10))}`;
            return;
        }
        if (operator && calculator.waitingForSecondOperand) {
            calculator.operator = nextOperator;
            return;
        }
        if (firstOperand === null && !isNaN(inputValue)) {
            calculator.firstOperand = inputValue;
        } else if (operator) {
            const result = performCalculation(firstOperand, inputValue, operator);
            calculator.displayValue = `${parseFloat(result.toFixed(10))}`;
            calculator.firstOperand = result;
        }
        calculator.waitingForSecondOperand = true;
        calculator.operator = nextOperator;
    }

    function performCalculation(first, second, op) {
        const degToRad = (d) => d * (Math.PI / 180);
        const radToDeg = (r) => r * (180 / Math.PI);
        switch (op) {
            case '+': return first + second;
            case '-': return first - second;
            case '*': return first * second;
            case '/': return first / second;
            case '=': return second;
            case '^': return Math.pow(first, second);
            case 'sqrt': return Math.sqrt(second);
            case 'exp': return Math.exp(second);
            case 'log': return Math.log10(second);
            case 'sin': return Math.sin(degToRad(second));
            case 'cos': return Math.cos(degToRad(second));
            case 'tan': return Math.tan(degToRad(second));
            case 'asin': return radToDeg(Math.asin(second));
            case 'acos': return radToDeg(Math.acos(second));
            case 'atan': return radToDeg(Math.atan(second));
            default: return second;
        }
    }

    function resetCalculator() {
        Object.assign(calculator, { displayValue: '0', firstOperand: null, waitingForSecondOperand: false, operator: null });
    }

    // --- MODULAR CONVERTERS LOGIC ---
    window.openConverter = function(evt, converterName) {
        const pages = document.querySelectorAll(".converter-page");
        pages.forEach(page => page.style.display = "none");
        const tabLinks = document.querySelectorAll(".tab-link");
        tabLinks.forEach(tab => tab.classList.remove("active"));
        document.getElementById(converterName).style.display = "block";
        evt.currentTarget.classList.add("active");
    };

    window.calculateRpmToSpeed = function() {
        const rpm = parseFloat(document.getElementById('rpm').value) || 0;
        const circ = parseFloat(document.getElementById('circumference').value) || 0;
        const gear = parseFloat(document.getElementById('gearRatio').value) || 0;
        const final = parseFloat(document.getElementById('finalDrive').value) || 0;
        if (gear === 0 || final === 0) {
            document.getElementById('speed-output').innerText = "0 km/h"; return;
        }
        const wheelRpm = rpm / (gear * final);
        const speedKmph = (wheelRpm * circ * 60) / 1000;
        document.getElementById('speed-output').innerText = `${speedKmph.toFixed(2)} km/h`;
    };

    window.convertTemp = function(source) {
        const cIn = document.getElementById('celsius'), fIn = document.getElementById('fahrenheit');
        if (source === 'c') fIn.value = isNaN(cIn.value) ? '' : ((parseFloat(cIn.value) * 9/5) + 32).toFixed(2);
        else cIn.value = isNaN(fIn.value) ? '' : ((parseFloat(fIn.value) - 32) * 5/9).toFixed(2);
    };

    window.calculateTorqueToPower = function() {
        const torque = parseFloat(document.getElementById('torque').value) || 0;
        const rpm = parseFloat(document.getElementById('power-rpm').value) || 0;
        const powerKw = (torque * rpm) / 9550;
        const powerHp = powerKw * 1.341;
        document.getElementById('power-kw-output').innerText = powerKw.toFixed(2);
        document.getElementById('power-hp-output').innerText = powerHp.toFixed(2);
    };

    window.convertFuel = function(source) {
        const kmlIn = document.getElementById('kml'), mpgIn = document.getElementById('mpg'), factor = 2.35215;
        if (source === 'kml') mpgIn.value = isNaN(kmlIn.value) ? '' : (parseFloat(kmlIn.value) * factor).toFixed(2);
        else kmlIn.value = isNaN(mpgIn.value) ? '' : (parseFloat(mpgIn.value) / factor).toFixed(2);
    };

    window.calculateSOC = function() {
        const minV = 3.0, maxV = 4.2;
        const volt = parseFloat(document.getElementById('voltage').value);
        if (isNaN(volt)) { document.getElementById('soc-output').innerText = `~0%`; return; }
        const clampedV = Math.max(minV, Math.min(volt, maxV));
        const soc = ((clampedV - minV) / (maxV - minV)) * 100;
        document.getElementById('soc-output').innerText = `~${soc.toFixed(0)}%`;
    };

    window.calculateTyreDiameter = function() {
        const input = document.getElementById('tyre-size').value;
        const output = document.getElementById('tyre-diameter-output');
        const match = input.match(/^(\d+)\/(\d+)-(\d+)$/);
        if (!match) { output.innerText = "Invalid format"; return; }
        const [_, w, ar, rim] = match.map(parseFloat);
        const sidewall = (w * ar) / 100;
        const diameter = (2 * sidewall) + (rim * 25.4);
        output.innerText = `${diameter.toFixed(2)} mm`;
    };
});
