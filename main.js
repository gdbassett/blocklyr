import * as R from "./r.js";

//import * as Blockly from 'blockly';
//import * as Blockly from './blockly_compressed.js';
import {blocks} from './blocks/text.js';
import {rstats_blocks} from './blocks/rstats_blocks.js';
//import {generator} from './generators/javascript';
//import {javascriptGenerator} from 'blockly/javascript';
import {save, load} from './serialization.js';
import {toolbox} from './toolbox.js';
import './filereader.js';
//import './index.css';
import {rstatsGenerator} from './generators/rstats.js';


const statusMessage = document.getElementById("status-message")

// Register the blocks and generator with Blockly
Blockly.common.defineBlocks(rstats_blocks);

// Set up UI elements and inject Blockly
const codeDiv = document.getElementById('generatedCode').firstChild;
const outputDiv = document.getElementById('output');
const blocklyDiv = document.getElementById('blocklyDiv');
const ws = Blockly.inject(blocklyDiv, {toolbox});

// This function resets the code and output divs, shows the
// generated code from the workspace, and evals the code.
// In a real application, you probably shouldn't use `eval`.
const runCode = async () => {
  const code = rstatsGenerator.workspaceToCode(ws);
  codeDiv.innerText = code;

  outputDiv.innerText = 'Running code...';

 // eval(code); // commenting out until I can get wasmr working.
  console.log(code);
  //const res = await webR.evalR(code);
   const res = await webRCodeShelter.captureR(code, {
        withAutoprint: true,
        captureStreams: true,
        captureConditions: false
      });
  const ret = res.output.filter(
      evt => evt.type == 'stdout' || evt.type == 'stderr'
    ).map((evt) => evt.data);
  outputDiv.innerText = ret.join('\n');
};

// https://github.com/hrbrmstr/slightly-more-than-minimal/blob/batman/r.js
// this can be accessed everywhere as "webR"
//globalThis.webR = new WebR();
//await globalThis.webR.init();



// Load the initial state from storage and run the code.
load(ws);
runCode();

// Every time the workspace changes state, save the changes to storage.
ws.addChangeListener((e) => {
  // UI events are things like scrolling, zooming, etc.
  // No need to save after one of these.
  if (e.isUiEvent) return;
  save(ws);
});


// Whenever the workspace changes meaningfully, run the code again.
ws.addChangeListener((e) => {
  // Don't run the code when the workspace finishes loading; we're
  // already running it once when the application starts.
  // Don't run the code during drags; we might have invalid state.
  if (e.isUiEvent || e.type == Blockly.Events.FINISHED_LOADING ||
    ws.isDragging()) {
    return;
  }
  runCode();
});

// enable the file input
document.getElementById("file-input").disabled = false;

statusMessage.innerHTML = `🔵 WebR — <code>${await webR.evalRString("R.version.string")}</code> — Loaded!`




