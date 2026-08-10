const screen = document.querySelector(".calculator__screen");
const keys = document.querySelector(".calculator__keys");
const themeInputs = document.querySelectorAll('input[name="theme"]');

const calculator = {
  displayValue: "0",
  firstValue: null,
  operator: null,
  waitingForSecondValue: false,
};

const formatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 10,
});

function formatDisplay(value) {
  if (value === "Error") {
    return value;
  }

  const [integer, decimal] = value.split(".");
  const formattedInteger = formatter.format(Number(integer));
  return decimal === undefined
    ? formattedInteger
    : `${formattedInteger}.${decimal}`;
}

function updateScreen() {
  screen.textContent = formatDisplay(calculator.displayValue);
}

function inputDigit(digit) {
  const { displayValue, waitingForSecondValue } = calculator;

  if (waitingForSecondValue) {
    calculator.displayValue = digit;
    calculator.waitingForSecondValue = false;
    return;
  }

  calculator.displayValue = displayValue === "0" ? digit : displayValue + digit;
}

function inputDecimal() {
  if (calculator.waitingForSecondValue) {
    calculator.displayValue = "0.";
    calculator.waitingForSecondValue = false;
    return;
  }

  if (!calculator.displayValue.includes(".")) {
    calculator.displayValue += ".";
  }
}

function deleteDigit() {
  if (calculator.waitingForSecondValue || calculator.displayValue === "Error") {
    calculator.displayValue = "0";
    calculator.waitingForSecondValue = false;
    return;
  }

  calculator.displayValue =
    calculator.displayValue.length > 1
      ? calculator.displayValue.slice(0, -1)
      : "0";
}

function resetCalculator() {
  calculator.displayValue = "0";
  calculator.firstValue = null;
  calculator.operator = null;
  calculator.waitingForSecondValue = false;
}

function calculate(firstValue, secondValue, operator) {
  if (operator === "+") {
    return firstValue + secondValue;
  }

  if (operator === "-") {
    return firstValue - secondValue;
  }

  if (operator === "x") {
    return firstValue * secondValue;
  }

  if (operator === "/") {
    return secondValue === 0 ? NaN : firstValue / secondValue;
  }

  return secondValue;
}

function handleOperator(nextOperator) {
  const inputValue = Number(calculator.displayValue);

  if (calculator.operator && calculator.waitingForSecondValue) {
    calculator.operator = nextOperator;
    return;
  }

  if (calculator.firstValue === null) {
    calculator.firstValue = inputValue;
  } else if (calculator.operator) {
    const result = calculate(
      calculator.firstValue,
      inputValue,
      calculator.operator,
    );

    if (Number.isNaN(result) || !Number.isFinite(result)) {
      calculator.displayValue = "Error";
      calculator.firstValue = null;
      calculator.operator = null;
      calculator.waitingForSecondValue = true;
      return;
    }

    calculator.displayValue = String(Number(result.toFixed(10)));
    calculator.firstValue = result;
  }

  calculator.waitingForSecondValue = true;
  calculator.operator = nextOperator;
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme === "1" ? "" : theme;
  localStorage.setItem("calculator-theme", theme);
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  if (button.dataset.key) {
    button.dataset.key === "."
      ? inputDecimal()
      : inputDigit(button.dataset.key);
  }

  if (button.dataset.operator) {
    handleOperator(button.dataset.operator);
  }

  if (button.dataset.action === "delete") {
    deleteDigit();
  }

  if (button.dataset.action === "reset") {
    resetCalculator();
  }

  if (button.dataset.action === "equals" && calculator.operator) {
    handleOperator(calculator.operator);
    calculator.operator = null;
  }

  updateScreen();
});

themeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    applyTheme(input.value);
  });
});

window.addEventListener("keydown", (event) => {
  const keyMap = {
    Enter: "equals",
    Escape: "reset",
    Backspace: "delete",
    "*": "x",
  };

  if (/^\d$/.test(event.key)) {
    inputDigit(event.key);
  } else if (event.key === ".") {
    inputDecimal();
  } else if (["+", "-", "/", "*"].includes(event.key)) {
    handleOperator(keyMap[event.key] || event.key);
  } else if (keyMap[event.key] === "equals" && calculator.operator) {
    handleOperator(calculator.operator);
    calculator.operator = null;
  } else if (keyMap[event.key] === "reset") {
    resetCalculator();
  } else if (keyMap[event.key] === "delete") {
    deleteDigit();
  } else {
    return;
  }

  event.preventDefault();
  updateScreen();
});

const savedTheme = localStorage.getItem("calculator-theme") || "1";
const savedInput = document.querySelector(
  `input[name="theme"][value="${savedTheme}"]`,
);

if (savedInput) {
  savedInput.checked = true;
  applyTheme(savedTheme);
}

updateScreen();
