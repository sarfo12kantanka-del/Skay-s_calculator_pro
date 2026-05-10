let realExpression = "";
let historyLog = [];
let historyIndex = -1;
let display;

document.addEventListener('DOMContentLoaded', () => {
    display = document.getElementById('display');
});

function getDisplay() {
    if (!display) display = document.getElementById('display');
    return display;
}

function syncExpression() {
    const disp = getDisplay();
    let expr = disp.value
        .replace(/x/g, '*')
        .replace(/÷/g, '/');

    expr = expr.replace(/([\d.)])π/g, '$1*Math.PI');
    expr = expr.replace(/π/g, 'Math.PI');

    expr = expr.replace(/([\d.)])e(?![xp])/g, '$1*Math.E');
    expr = expr.replace(/e(?![xp])/g, 'Math.E');

    realExpression = expr;
}

function appendToDisplay(value) {
    const disp = getDisplay();
    historyIndex = -1;

    let visualValue = value;
    if (value === '*') visualValue = 'x';
    if (value === '/') visualValue = '÷';

    disp.value += visualValue;
    syncExpression();
}

function clearDisplay() {
    const disp = getDisplay();
    disp.value = "";
    realExpression = "";
    historyIndex = -1;
}

function allClear() {
    const disp = getDisplay();
    disp.value = "";
    realExpression = "";
    historyLog = [];
    historyIndex = -1;
}

function backspace() {
    const disp = getDisplay();
    disp.value = disp.value.toString().slice(0, -1);
    syncExpression();
}

function percentage() {
    const disp = getDisplay();
    if (!disp.value) return;
    try {
        syncExpression();
        const result = eval(realExpression) / 100;
        disp.value = result;
        realExpression = result.toString();
    } catch (e) {
        disp.value = "Error";
        realExpression = "";
    }
}

function toggleSign() {
    const disp = getDisplay();
    if (!disp.value) return;
    try {
        syncExpression();
        const result = eval(realExpression) * -1;
        disp.value = result;
        realExpression = result.toString();
    } catch (e) {
        disp.value = "Error";
        realExpression = "";
    }
}

function _sin(x) { const r = Math.sin(x * Math.PI / 180); return Math.abs(r) < 1e-12 ? 0 : r; }
function _cos(x) { const r = Math.cos(x * Math.PI / 180); return Math.abs(r) < 1e-12 ? 0 : r; }
function _tan(x) { const r = Math.tan(x * Math.PI / 180); return Math.abs(r) < 1e-12 ? 0 : r; }

function _fact(n) {
    if (n < 0 || !Number.isInteger(n) || n > 170) return NaN;
    if (n === 0 || n === 1) return 1;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
}

function applyFunction(func) {
    const disp = getDisplay();
    const prefixFuncs = { sin: 'sin', cos: 'cos', tan: 'tan', log: 'log', ln: 'ln', sqrt: '\u221A' };

    if (func in prefixFuncs) {
        const name = prefixFuncs[func];
        const last = disp.value.slice(-1);
        if (/[\d.)]/.test(last)) {
            disp.value += '*';
        }
        disp.value += name + '(';
    } else if (func === 'square') {
        disp.value += '\u00B2';
    } else if (func === 'factorial') {
        disp.value += '!';
    }
    syncExpression();
}

function calculate() {
    const disp = getDisplay();
    try {
        syncExpression();
        if (!realExpression) return;

        let expr = realExpression
            .replace(/sin\(/g, '_sin(')
            .replace(/cos\(/g, '_cos(')
            .replace(/tan\(/g, '_tan(')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/ln\(/g, 'Math.log(')
            .replace(/\u221A\(/g, 'Math.sqrt(')
            .replace(/([\d.]+)\u00B2/g, 'Math.pow($1,2)')
            .replace(/([\d.]+)!/g, '_fact($1)');

        let open = (expr.match(/\(/g) || []).length;
        let close = (expr.match(/\)/g) || []).length;
        while (close < open) {
            expr += ')';
            close++;
        }

        const result = eval(expr);

        if (disp.value && disp.value !== result.toString()) {
            historyLog.unshift(`${disp.value}=${result}`);
            if (historyLog.length > 10) historyLog.pop();
        }

        disp.value = result;
        realExpression = result.toString();
        historyIndex = -1;
    } catch (e) {
        disp.value = "Error";
        realExpression = "";
    }
}

function showHistory() {
    const disp = getDisplay();
    if (historyLog.length === 0) {
        let originalVal = disp.value;
        disp.value = "Empty";
        setTimeout(() => { disp.value = originalVal; }, 800);
        return;
    }

    historyIndex++;
    if (historyIndex >= historyLog.length) historyIndex = 0;

    disp.value = historyLog[historyIndex];
}

document.addEventListener('DOMContentLoaded', () => {
    getDisplay().addEventListener('keypress', function (e) {
        if (e.key === 'Enter') calculate();
    });
});
