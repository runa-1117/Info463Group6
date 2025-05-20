import Keyboard from "simple-keyboard";
import swipe from "swipe-keyboard";
import DollarRecognizer from "./utils/dollarRecognizer";

// CSS
import "simple-keyboard/build/css/index.css";
import "./styles/index.css";

const recognizer = new DollarRecognizer();

// Example "4" gesture points (replace with your actual points for best results)
recognizer.AddGesture("4", [
  { X: 50, Y: 120 }, { X: 80, Y: 60 }, { X: 110, Y: 120 }, { X: 110, Y: 30 }
]);

let keyboard = new Keyboard({
  onChange: input => onChange(input),
  onKeyPress: button => onKeyPress(button),
  useMouseEvents: true,
  modules: [swipe]
});

/**
 * Update simple-keyboard when input is changed directly
 */
document.querySelector(".input").addEventListener("input", event => {
  keyboard.setInput(event.target.value);
});

function onChange(input) {
  document.querySelector(".input").value = input;
  console.log("Input changed", input);
}

function onKeyPress(button) {
  console.log("Button pressed", button);

  /**
   * If you want to handle the shift and caps lock buttons
   */
  if (button === "{shift}" || button === "{lock}") handleShift();
}

function handleShift() {
  let currentLayout = keyboard.options.layoutName;
  let shiftToggle = currentLayout === "default" ? "shift" : "default";

  keyboard.setOptions({
    layoutName: shiftToggle
  });
}

const gestureWordMap = {
  "S": "thanks"
  // New gestures will be added dynamically
};

const gestureCanvas = document.getElementById("gestureCanvas");
const ctx = gestureCanvas.getContext("2d");
let drawing = false;
let points = [];

gestureCanvas.addEventListener("mousedown", (e) => {
  drawing = true;
  points = [];
  ctx.clearRect(0, 0, gestureCanvas.width, gestureCanvas.height);
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
  points.push({ X: e.offsetX, Y: e.offsetY });
});

gestureCanvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  points.push({ X: e.offsetX, Y: e.offsetY });
});

gestureCanvas.addEventListener("mouseup", () => {
  drawing = false;
  ctx.closePath();

  if (points.length > 5) {
    const result = recognizer.Recognize(points);
    if (result.Score > 0.7 && gestureWordMap[result.Name]) {
      // Recognized gesture, append the word to the input field
      const word = gestureWordMap[result.Name];
      const inputElem = document.querySelector(".input");
      const currentValue = inputElem.value;
      const newValue = currentValue
        ? currentValue.trim() + " " + word
        : word;
      keyboard.setInput(newValue);
      inputElem.value = newValue;
    } else {
      // Not recognized, ask user for gesture name and word
      const gestureName = prompt("Gesture not recognized. Enter a name for this gesture (e.g., '4', 'star', etc.):");
      if (gestureName && gestureName.trim().length > 0) {
        const word = prompt(`Enter a word to associate with the gesture "${gestureName.trim()}":`);
        if (word && word.trim().length > 0) {
          recognizer.AddGesture(gestureName.trim(), points);
          gestureWordMap[gestureName.trim()] = word.trim();
          alert(`Gesture "${gestureName.trim()}" saved! Now drawing this gesture will input "${word.trim()}"`);
        }
      }
    }
  }
  setTimeout(() => {
    ctx.clearRect(0, 0, gestureCanvas.width, gestureCanvas.height);
  }, 200);
});
