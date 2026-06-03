// ─── Custom Error Classes ────────────────────────────────────────────────────

class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

class DivisionByZeroError extends Error {
  constructor() {
    super("Cannot divide by zero");
    this.name = "DivisionByZeroError";
  }
}

// ─── Global Error Handler ────────────────────────────────────────────────────

window.onerror = function (message, source, lineno, colno, error) {
  console.error(
    `[Global onerror] ${message}\n  Source: ${source}\n  Line: ${lineno}, Col: ${colno}`
  );
  showStatus(
    `Global error caught: ${message} (line ${lineno})`,
    "error"
  );
  return true; // prevents default browser error handling
};

window.addEventListener("error", function (event) {
  console.error("[Global addEventListener error]", event.error ?? event.message);
});

// ─── Calculator (try / catch / finally + throw + custom errors) ──────────────

const form = document.querySelector("form");
const output = document.querySelector("output");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Intentionally look up the element by a data-attribute so removing it
  // (e.g. commenting it out in HTML) triggers a realistic null-reference error.
  const firstNumEl = document.querySelector("[data-input='first']");
  const secondNumEl = document.querySelector("[data-input='second']");
  const operatorEl = document.querySelector("#operator");

  try {
    if (!firstNumEl || !secondNumEl) {
      throw new ValidationError(
        "A required input element is missing from the DOM.",
        "input"
      );
    }

    const firstNum = parseFloat(firstNumEl.value);
    const secondNum = parseFloat(secondNumEl.value);
    const operator = operatorEl.value;

    if (isNaN(firstNum) || firstNumEl.value.trim() === "") {
      throw new ValidationError("First number is not valid.", "first-num");
    }
    if (isNaN(secondNum) || secondNumEl.value.trim() === "") {
      throw new ValidationError("Second number is not valid.", "second-num");
    }
    if (operator === "/" && secondNum === 0) {
      throw new DivisionByZeroError();
    }

    let result;
    switch (operator) {
      case "+": result = firstNum + secondNum; break;
      case "-": result = firstNum - secondNum; break;
      case "*": result = firstNum * secondNum; break;
      case "/": result = firstNum / secondNum; break;
      default:  throw new ValidationError(`Unknown operator: ${operator}`, "operator");
    }

    output.textContent = result;
    showStatus(`Result: ${result}`, "ok");

  } catch (err) {
    if (err instanceof DivisionByZeroError) {
      output.textContent = "Error: " + err.message;
      showStatus(`[${err.name}] ${err.message}`, "error");
      console.error(`Caught ${err.name}:`, err.message);
    } else if (err instanceof ValidationError) {
      output.textContent = "Validation error";
      showStatus(`[${err.name}] ${err.message} (field: ${err.field})`, "error");
      console.error(`Caught ${err.name} on field '${err.field}':`, err.message);
    } else {
      output.textContent = "Unexpected error";
      showStatus(`[${err.name}] ${err.message}`, "error");
      console.error("Unexpected error:", err);
    }
  } finally {
    console.log("Calculator operation attempted (finally block ran).");
  }
});

// ─── Console Demo Buttons ────────────────────────────────────────────────────

const sampleData = [
  { name: "Alice", role: "Engineer", errors: 2 },
  { name: "Bob",   role: "Designer", errors: 0 },
  { name: "Carol", role: "Manager",  errors: 5 },
];

const errorBtns = Array.from(document.querySelectorAll("#error-btns > button"));

function getBtn(label) {
  return errorBtns.find((b) => b.textContent.trim() === label);
}

// Console Log
getBtn("Console Log").addEventListener("click", () => {
  console.log("Sample user data:", sampleData);
  showStatus("console.log fired — check DevTools console", "info");
});

// Console Error
getBtn("Console Error").addEventListener("click", () => {
  console.error("Simulated error: failed to fetch /api/data (status 500)");
  showStatus("console.error fired", "error");
});

// Console Count
getBtn("Console Count").addEventListener("click", () => {
  console.count("Console Count button clicked");
  showStatus("console.count fired — click again to increment", "info");
});

// Console Warn
getBtn("Console Warn").addEventListener("click", () => {
  console.warn("Warning: input value is close to the overflow limit.");
  showStatus("console.warn fired", "warn");
});

// Console Assert
getBtn("Console Assert").addEventListener("click", () => {
  // Passing assertion — silent
  console.assert(1 + 1 === 2, "Math is broken (you'll never see this)");
  // Failing assertion — prints to console
  const users = sampleData;
  console.assert(users.length === 0, "Assertion failed: expected empty user list but got %d users", users.length);
  showStatus("console.assert fired (failing assertion visible in console)", "warn");
});

// Console Clear
getBtn("Console Clear").addEventListener("click", () => {
  console.clear();
  showStatus("console.clear fired — console cleared", "info");
});

// Console Dir
getBtn("Console Dir").addEventListener("click", () => {
  const el = document.querySelector("form");
  console.dir(el);
  showStatus("console.dir fired — form element properties in console", "info");
});

// Console dirxml
getBtn("Console dirxml").addEventListener("click", () => {
  const el = document.querySelector("form");
  console.dirxml(el);
  showStatus("console.dirxml fired — form XML tree in console", "info");
});

// Console Group Start
getBtn("Console Group Start").addEventListener("click", () => {
  console.group("User Report");
  console.log("Total users:", sampleData.length);
  sampleData.forEach((u) => {
    console.groupCollapsed(`  ${u.name} (${u.role})`);
    console.log("Errors:", u.errors);
    console.groupEnd();
  });
  showStatus("console.group started — grouped output visible in console", "info");
});

// Console Group End
getBtn("Console Group End").addEventListener("click", () => {
  console.groupEnd();
  showStatus("console.groupEnd called", "info");
});

// Console Table
getBtn("Console Table").addEventListener("click", () => {
  console.table(sampleData);
  showStatus("console.table fired — tabular data in console", "info");
});

// Start Timer
getBtn("Start Timer").addEventListener("click", () => {
  console.time("demo-timer");
  showStatus("Timer started — click End Timer to stop", "info");
});

// End Timer
getBtn("End Timer").addEventListener("click", () => {
  console.timeEnd("demo-timer");
  showStatus("Timer stopped — elapsed time in console", "info");
});

// Console Trace
getBtn("Console Trace").addEventListener("click", () => {
  function inner() { console.trace("Trace from inner()"); }
  function outer() { inner(); }
  outer();
  showStatus("console.trace fired — call stack in console", "info");
});

// Trigger a Global Error
getBtn("Trigger a Global Error").addEventListener("click", () => {
  // Defer so it runs outside any try/catch and bubbles to window.onerror
  setTimeout(() => {
    nonExistentFunction(); // ReferenceError — caught by window.onerror
  }, 0);
  showStatus("Global error triggered — watch console + status bar", "error");
});

// ─── Status bar helper ───────────────────────────────────────────────────────

function showStatus(msg, level = "info") {
  const bar = document.getElementById("status-bar");
  if (!bar) return;
  bar.textContent = msg;
  bar.className = "status-bar " + level;
}
