let form: HTMLFormElement = document.getElementsByClassName('menu-form')[0] as HTMLFormElement;
let matrixSizeInput: HTMLInputElement = document.getElementsByClassName('input-size')[0] as HTMLInputElement;
let matrixInputSelect: HTMLSelectElement = document.getElementsByClassName('select-input')[0] as HTMLSelectElement;
let matrixFileInput: HTMLInputElement = document.getElementsByClassName('input-file')[0] as HTMLInputElement;
let matrixFileInputWrapper: HTMLElement = document.getElementsByClassName('input-wrapper_file')[0] as HTMLElement;
let methodSelect: HTMLSelectElement = document.getElementsByClassName('select-method')[0] as HTMLSelectElement;
let matrixFields: HTMLElement = document.getElementsByClassName('matrix-input')[0] as HTMLElement;
let matrixInputs: HTMLCollectionOf<HTMLInputElement> = document.getElementsByClassName('input-element') as HTMLCollectionOf<HTMLInputElement>;
let matrixOutput: HTMLElement = document.getElementsByClassName('matrix-output')[0] as HTMLElement;
let resultButton: HTMLElement = document.getElementsByClassName('result-button')[0] as HTMLElement;

function resizeMatrixInput(size: number) {
    if (size > 10) {
        matrixSizeInput.value = "10";
        size = 10;
    }
    if (size < 2) {
        matrixSizeInput.value = "2";
        size = 2;
    }
    matrixFields.innerHTML = "";
    matrixOutput.style.left = `${size * 36}px`
    for (let i: number = 0; i < size; i++) {
        let matrixRow: HTMLElement = document.createElement('div');
        matrixRow.classList.add("matrix-row");
        for (let j: number = 0; j < size; j++) {
            let elementInput: HTMLInputElement = document.createElement('input') as HTMLInputElement;
            elementInput.type = "text";
            elementInput.classList.add("input-element");
            elementInput.required = true;
            elementInput.disabled = parseInt(matrixInputSelect.value) == 1 ? false : true;
            matrixRow.appendChild(elementInput);
        }
        matrixFields.appendChild(matrixRow);
    }
}

function disableMatrixInputs(isDisabled: boolean) {
    for (let i: number = 0; i < matrixInputs.length; i++) {
        matrixInputs[i].disabled = isDisabled;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    resizeMatrixInput(parseInt(matrixSizeInput.value));
    resultButton.style.display = "none";
});

matrixSizeInput.addEventListener('input', () => {
    resizeMatrixInput(parseInt(matrixSizeInput.value));
});

matrixInputSelect.addEventListener('input', () => {
    let value: number = parseInt(matrixInputSelect.value);
    if (value == 1) {
        disableMatrixInputs(false);
        matrixFileInputWrapper.style.display = "none";
        matrixFileInput.required = false;
        matrixSizeInput.disabled = false;
        matrixSizeInput.required = true;
    }
    if (value == 2) {
        disableMatrixInputs(true);
        matrixFileInputWrapper.style.display = "none";
        matrixFileInput.required = false;
        matrixSizeInput.disabled = false;
        matrixSizeInput.required = true;
    }
    if (value == 3) {
        disableMatrixInputs(true);
        matrixFileInputWrapper.style.display = "block";
        matrixFileInput.required = true;
        matrixSizeInput.disabled = true;
        matrixSizeInput.required = false;
    }
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const matrixSize: number = parseInt(matrixSizeInput.value);
    const matrixFillType: number = parseInt(matrixInputSelect.value);
    const matrixFile: FileList = matrixFileInput.files as FileList;
    const matrixMethod: number = parseInt(methodSelect.value);
    if (matrixFillType == 1) {
        let matrix: number[][] = [];
        for (let i: number = 0; i < matrixSize; i++) {
            let matrixRow: number[] = [];
            for (let j: number = 0; j < matrixSize; j++) {
                matrixRow.push(parseInt(matrixInputs[j+matrixSize*i].value));
            }
            matrix.push(matrixRow);
        }
        window.electronAPI.getMatrix(matrix, matrixMethod);
    } else if (matrixFillType == 2) {
        window.electronAPI.getSize(matrixSize, matrixMethod);
    } else {
        window.electronAPI.getFile(matrixFile[0].path, matrixMethod);
    }
});

resultButton.addEventListener('click', () => {
    window.electronAPI.createFile();
    window.electronAPI.onReadyFile((location: string) => {
        
    })
});

window.electronAPI.onUpdateMatrix((initialMatrix: number[][], inversedMatrix: number[][], difficulty: number) => {
    resizeMatrixInput(inversedMatrix.length);
    matrixOutput.innerHTML = "";
    for (let i: number = 0; i < initialMatrix.length; i++) {
        let matrixRow: HTMLElement = document.createElement('div');
        matrixRow.classList.add("matrix-row");
        matrixRow.innerHTML = "";
        for (let j: number = 0; j < initialMatrix.length; j++) {
            let elementOutput: string = `<span>${inversedMatrix[i][j].toFixed(3)}</span>`;
            matrixInputs[j+initialMatrix.length*i].value = `${initialMatrix[i][j]}`
            matrixRow.innerHTML += elementOutput;
        }
        matrixOutput.appendChild(matrixRow);
    }
    let showDifficulty: string = `<p>Algorithm difficulty: ${difficulty}</p>`;
    matrixOutput.innerHTML += showDifficulty;
    resultButton.style.display = "block";
});

window.electronAPI.onError((message: string) => {
    matrixOutput.innerHTML = `<p>${message}</p>`;
});