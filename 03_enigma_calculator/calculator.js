document.addEventListener('DOMContentLoaded', () => {
    const $ = selector => document.querySelector(selector);
    const operation = $('#operation');
    const result = $('#result');
    const percentage = [$('#percentage-1'), $('#percentage-2'), $('#percentage-3'), $('#percentage-4'), $('#percentage-5'), $('#percentage-6')];
    const percentageResult = [$('#result-1'), $('#result-2'), $('#result-3')];
    const $matrixLabels = [$('#matrix-x'), $('#matrix-y')];
    const $matrixTemplate = $('#matrix-template');
    const $matrixRowTemplate = $('#matrix-row-template');
    const $matrixArray = $('#matrix-array');
    const virtualMatrix = [];
    let currentOperation = 'Ans = 0';
    let currentResult = '';
    let temporaryOperation = '0';
    let firstNumber = true;
    let pointAvailable = true;
    const basic_calculator = document.getElementById('basic-calculator');

    const updateDisplay = () => {
        result.textContent = temporaryOperation;
        operation.textContent = currentOperation;
    }

    const handlerNumberInput = (number) => {
        if (firstNumber) {
            temporaryOperation = '';
            firstNumber = false;
            updateDisplay();
        }
        if (number === '.') {
            if (!pointAvailable) return;
            pointAvailable = false;
        }
        temporaryOperation += number;
        updateDisplay();
    }
    
    const handlerOperationInput = (operation) => {
        if (temporaryOperation.slice(-1) === ' ' || temporaryOperation.slice(-1) === '.') return;
        pointAvailable = true;
        temporaryOperation += ` ${operation} `;
        updateDisplay();
    }

    document.querySelectorAll('.number').forEach(number => {
        number.addEventListener('click', () => {
            handlerNumberInput(number.textContent);
        });
    });

    document.querySelectorAll('.operation').forEach(button => {
        button.addEventListener('click', () => {
            handlerOperationInput(button.getAttribute('operation'));
        });
    });

    document.getElementById('clear').addEventListener('click', () => {
        temporaryOperation = '0';
        firstNumber = true;
        updateDisplay();
    });

    document.getElementById('delete').addEventListener('click', () => {
        if (temporaryOperation.length === 0) return;
        temporaryOperation = temporaryOperation.trim().slice(0, -1).trim();
        if (temporaryOperation.length === 0) {
            temporaryOperation = '0';
            firstNumber = true;
        }
        updateDisplay();
    });

    document.getElementById('equal').addEventListener('click', () => {
        if (temporaryOperation.length === 0) return;
        firstNumber = true;
        pointAvailable = true;
        try {
            currentOperation = temporaryOperation + ' =';
            currentResult = eval(temporaryOperation);
            temporaryOperation = "";
            updateDisplay();
            result.textContent = currentResult;
            currentOperation = 'Ans = ' + currentResult;
        }
        catch (error){
            currentResult = 'Error';
            temporaryOperation = "";
            updateDisplay();
            result.textContent = currentResult;
        }
    });

    document.addEventListener('keydown', (event) => {
        const key = event.key;
        let activeCalculator = basic_calculator.classList.contains('active');
        if (!activeCalculator) return;

        if (!isNaN(key) || key === '.') {
            handlerNumberInput(key);
        } else if ([ '+', '-', '*', '/', '(', ')'].includes(key)) {
            handlerOperationInput(key);
        } else if (key === 'Enter') {
            document.getElementById('equal').click();
        } else if (key === 'Backspace') {
            document.getElementById('delete').click();
        } else if (key === 'Escape') {
            document.getElementById('clear').click();
        }
    });

    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const isActive = tab.classList.contains('active');
            if (!isActive) {    
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));

                tab.classList.add('active');
                document.getElementById(tab.dataset.tab).classList.add('active');
            }
        });
    });

    document.querySelectorAll('.percentage-calculate').forEach((button) => {
        button.addEventListener('click', () => {
            let index= parseInt(button.getAttribute('index'));
            handlePercentageResults(index);
        });
    });

    function handlePercentageResults(index) {
        let resultHere;
        const percentageOperations = 
        {
            1: () => {
                //cuanto es X por ciento de Y
                let y = parseFloat(percentage[0].value);
                let x = parseFloat(percentage[1].value);
                resultHere = (x * y * 0.01).toFixed(2);
                percentageResult[0].value = resultHere;
                console.log(resultHere);
            },
            2: () => {
                // X es que porcentaje de Y
                let x = parseInt(percentage[2].value);
                let y = parseInt(percentage[3].value);
                resultHere = ((x / y) * 100).toFixed(2);
                percentageResult[1].value = resultHere;
                console.log(resultHere);
            },
            3: () => {
                // cual es el porcentaje de incremento/decremento de X a Y
                let x = parseFloat(percentage[4].value);
                let y = parseFloat(percentage[5].value);
                resultHere = (((y - x) / x) * 100).toFixed(2);
                percentageResult[2].value = resultHere;
                console.log(resultHere);
            }
        };
        if (percentageOperations[index]) {
            percentageOperations[index]();
        }
    }

    document.getElementById('matrix-create').addEventListener('click', () => {
        let x = parseInt($matrixLabels[0].value);
        let y = parseInt($matrixLabels[1].value);
        
        if (isNaN(x) || isNaN(y) || x <= 0 || y <= 0) {
            console.log('Invalid input');
            return;
        }

        $matrixArray.innerHTML = '';
        for (let i=0; i<x; i++) {
            const matrixRow = $matrixRowTemplate.content.cloneNode(true).querySelector('.matrix-row');
            for (let j=0; j<y; j++) {
                const matrixInput = $matrixTemplate.content.cloneNode(true).querySelector('.matrix-input');
                matrixRow.appendChild(matrixInput);
            }
            const listItem = document.createElement('li');
            listItem.appendChild(matrixRow);
            $matrixArray.appendChild(listItem);
        }
        console.log(virtualMatrix);
    });
});
