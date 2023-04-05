
//import * as Blockly from 'blockly/core';
//import * as Blockly from 'https://unpkg.com/blockly/blockly.min.js';

// Create a custom block called 'add_text' that adds
// text to the output div on the sample app.
// This is just an example and you should replace this with your
// own custom blocks.
export const rstats_blocks = Blockly.common.createBlockDefinitionsFromJsonArray([{
  "type": "mutate",
  "message0": "mutate %1",
  "args0": [
    {
      "type": "input_statement",
      "name": "ARGUEMENTS"
    }/*,
    {
      'type': 'input_value',
      'name': 'LIST',
      'check': 'Array',
    },*/
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "Create, modify, and delete columns",
  "helpUrl": "https://dplyr.tidyverse.org/reference/mutate.html"
},
{
  "type": "select",
  "message0": "select %1",
  "args0": [
    {
      'type': 'input_value',
      'name': 'LIST',
      'check': 'Array',
    },
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "Subset columns using their names and types",
  "helpUrl": "https://dplyr.tidyverse.org/reference/select.html",
  "mutator": "arg_join_mutator" // kind works but going to need to fiddle with the code
},
{
  "type": "filter",
  "message0": "filter %1",
  "args0": [
    {
      'type': 'input_value',
      'name': 'LIST',
      'check': 'Array',
    },
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "Subset rows using column values",
  "helpUrl": "https://dplyr.tidyverse.org/reference/filter.html",
  "mutator": "arg_join_mutator" // kind works but going to need to fiddle with the code
},
{
  "type": "summarise",
  "message0": "summarise %1",
  "args0": [
    {
      "type": "input_statement",
      "name": "ARGUEMENTS"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "Summarise each group to fewer rows",
  "helpUrl": "https://dplyr.tidyverse.org/reference/summarise.html"
},
{
  "type": "read_delim",
  "message0": "read_delim %1 %2",
  "args0": [
    {
      "type": "input_value",
      "name": "file"
    },
    {
      "type": "input_statement",
      "name": "ARGUEMENTS"
    }
  ],
  "nextStatement": null,
  "colour": 230,
  "tooltip": "Read a delimited file (including CSV and TSV) into a tibble",
  "helpUrl": "https://readr.tidyverse.org/reference/read_delim.html"
},
{
  "type": "print",
  "message0": "print",
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "     ‘print’ prints its argument and returns it _invisibly_ (via      ‘invisible(x)’).  It is a generic function which means that new      printing methods can be easily added for new ‘class’es.",
  "helpUrl": ""
},
{
  "type": "glimpse",
  "message0": "glimpse",
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip":   " Get a glimpse of your data",
  "helpUrl": ""
},
{
  "type": "na",
  "message0": "na",
  "output": null,
  "colour": 230,
  "tooltip": "     ‘NA’ is a logical constant of length 1 which contains a missing      value indicator.  ‘NA’ can be coerced to any other vector type      except raw.  There are also constants ‘NA_integer_’, ‘NA_real_’,      ‘NA_complex_’ and ‘NA_character_’ of the other atomic vector types      which support missing values: all of these are reserved words in      the R language.",
  "helpUrl": ""
},
// Block for logical operations: 'and', 'or'.
{
  'type': 'logic_operation_first',
  'message0': '%1 %2 %3',
  'args0': [
    {
      'type': 'input_value',
      'name': 'A',
      'check': 'Boolean',
    },
    {
      'type': 'field_dropdown',
      'name': 'OP',
      'options': [
        ['%{BKY_LOGIC_OPERATION_AND}', 'AND'],
        ['%{BKY_LOGIC_OPERATION_OR}', 'OR'],
      ],
    },
    {
      'type': 'input_value',
      'name': 'B',
      'check': 'Boolean',
    },
  ],
  'inputsInline': true,
  'output': 'Boolean',
  'style': 'logic_blocks',
  'helpUrl': '%{BKY_LOGIC_OPERATION_HELPURL}',
  'extensions': ['logic_op_tooltip'],
},
]);

const ARG_JOIN_MUTATOR_MIXIN = {
  /**
   * Create XML to represent number of text inputs.
   * Backwards compatible serialization implementation.
   * @return {!Element} XML storage element.
   * @this {Block}
   */
  mutationToDom: function() {
    const container = Blockly.utils.xml.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  /**
   * Parse XML to restore the text inputs.
   * Backwards compatible serialization implementation.
   * @param {!Element} xmlElement XML storage element.
   * @this {Block}
   */
  domToMutation: function(xmlElement) {
    this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
    this.updateShape_();
  },
  /**
   * Returns the state of this block as a JSON serializable object.
   * @return {{itemCount: number}} The state of this block, ie the item count.
   */
  saveExtraState: function() {
    return {
      'itemCount': this.itemCount_,
    };
  },
  /**
   * Applies the given state to this block.
   * @param {*} state The state to apply to this block, ie the item count.
   */
  loadExtraState: function(state) {
    this.itemCount_ = state['itemCount'];
    this.updateShape_();
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Workspace} workspace Mutator's workspace.
   * @return {!Block} Root block in mutator.
   * @this {Block}
   */
// These are the decompose and compose functions for the lists_create_with block.
decompose: function(workspace) {
  // This is a special sub-block that only gets created in the mutator UI.
  // It acts as our "top block"
  var topBlock = workspace.newBlock('lists_create_with_container');
  topBlock.initSvg();

  // Then we add one sub-block for each item in the list.
  var connection = topBlock.getInput('STACK').connection;
  for (var i = 0; i < this.itemCount_; i++) {
    var itemBlock = workspace.newBlock('lists_create_with_item');
    itemBlock.initSvg();
    connection.connect(itemBlock.previousConnection);
    connection = itemBlock.nextConnection;
  }

  // And finally we have to return the top-block.
  return topBlock;
},

// The container block is the top-block returned by decompose.
compose: function(topBlock) {
  // First we get the first sub-block (which represents an input on our main block).
  var itemBlock = topBlock.getInputTargetBlock('STACK');

  // Then we collect up all of the connections of on our main block that are
  // referenced by our sub-blocks.
  // This relates to the saveConnections hook (explained below).
  var connections = [];
  while (itemBlock && !itemBlock.isInsertionMarker()) {  // Ignore insertion markers!
    connections.push(itemBlock.valueConnection_);
    itemBlock = itemBlock.nextConnection &&
        itemBlock.nextConnection.targetBlock();
  }

  // Then we disconnect any children where the sub-block associated with that
  // child has been deleted/removed from the stack.
  for (var i = 0; i < this.itemCount_; i++) {
    var connection = this.getInput('ADD' + i).connection.targetConnection;
    if (connection && connections.indexOf(connection) == -1) {
      connection.disconnect();
    }
  }

  // Then we update the shape of our block (removing or adding iputs as necessary).
  // `this` refers to the main block.
  this.itemCount_ = connections.length;
  this.updateShape_();

  // And finally we reconnect any child blocks.
  for (var i = 0; i < this.itemCount_; i++) {
    Blockly.Mutator.reconnect(connections[i], this, 'ADD' + i);
  }
},
  /**
   * Store pointers to any connected child blocks.
   * @param {!Block} containerBlock Root block in mutator.
   * @this {Block}
   */
  saveConnections: function(containerBlock) {
    let itemBlock = containerBlock.getInputTargetBlock('STACK');
    let i = 0;
    while (itemBlock) {
      if (itemBlock.isInsertionMarker()) {
        itemBlock = itemBlock.getNextBlock();
        continue;
      }
      const input = this.getInput('ADD' + i);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      itemBlock = itemBlock.getNextBlock();
      i++;
    }
  },
  /**
   * Modify this block to have the correct number of inputs.
   * @private
   * @this {Block}
   */
  updateShape_: function() {
    if (this.itemCount_ && this.getInput('EMPTY')) {
      this.removeInput('EMPTY');
    } else if (!this.itemCount_ && !this.getInput('EMPTY')) {
      this.appendDummyInput('EMPTY')
          .appendField(this.newQuote_(true))
          .appendField(this.newQuote_(false));
    }
    // Add new inputs.
    for (let i = 0; i < this.itemCount_; i++) {
      if (!this.getInput('ADD' + i)) {
        const input = this.appendValueInput('ADD' + i).setAlign(Blockly.Input.RIGHT);
        if (i === 0) {
          input.appendField("Add arguements here."); // Msg['ARG_JOIN_TITLE_CREATEWITH']
        }
      }
    }
    // Remove deleted inputs.
    for (let i = this.itemCount_; this.getInput('ADD' + i); i++) {
      this.removeInput('ADD' + i);
    }
  },
};

const TEXT_JOIN_EXTENSION = function() {
  // Add the quote mixin for the itemCount_ = 0 case.
  this.mixin(QUOTE_IMAGE_MIXIN);
  // Initialize the mutator values.
  this.itemCount_ = 2;
  this.updateShape_();
  // Configure the mutator UI.
  this.setMutator(new Blockly.Mutator(['text_create_join_item'], this));
};

const QUOTE_IMAGE_MIXIN = {
  /**
   * Image data URI of an LTR opening double quote (same as RTL closing double
   * quote).
   * @readonly
   */
  QUOTE_IMAGE_LEFT_DATAURI:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAQAAAAqJXdxAAAA' +
      'n0lEQVQI1z3OMa5BURSF4f/cQhAKjUQhuQmFNwGJEUi0RKN5rU7FHKhpjEH3TEMtkdBSCY' +
      '1EIv8r7nFX9e29V7EBAOvu7RPjwmWGH/VuF8CyN9/OAdvqIXYLvtRaNjx9mMTDyo+NjAN1' +
      'HNcl9ZQ5oQMM3dgDUqDo1l8DzvwmtZN7mnD+PkmLa+4mhrxVA9fRowBWmVBhFy5gYEjKMf' +
      'z9AylsaRRgGzvZAAAAAElFTkSuQmCC',
  /**
   * Image data URI of an LTR closing double quote (same as RTL opening double
   * quote).
   * @readonly
   */
  QUOTE_IMAGE_RIGHT_DATAURI:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAQAAAAqJXdxAAAA' +
      'qUlEQVQI1z3KvUpCcRiA8ef9E4JNHhI0aFEacm1o0BsI0Slx8wa8gLauoDnoBhq7DcfWhg' +
      'gONDmJJgqCPA7neJ7p934EOOKOnM8Q7PDElo/4x4lFb2DmuUjcUzS3URnGib9qaPNbuXvB' +
      'O3sGPHJDRG6fGVdMSeWDP2q99FQdFrz26Gu5Tq7dFMzUvbXy8KXeAj57cOklgA+u1B5Aos' +
      'lLtGIHQMaCVnwDnADZIFIrXsoXrgAAAABJRU5ErkJggg==',
  /**
   * Pixel width of QUOTE_IMAGE_LEFT_DATAURI and QUOTE_IMAGE_RIGHT_DATAURI.
   * @readonly
   */
  QUOTE_IMAGE_WIDTH: 12,
  /**
   * Pixel height of QUOTE_IMAGE_LEFT_DATAURI and QUOTE_IMAGE_RIGHT_DATAURI.
   * @readonly
   */
  QUOTE_IMAGE_HEIGHT: 12,

  /**
   * Inserts appropriate quote images before and after the named field.
   * @param {string} fieldName The name of the field to wrap with quotes.
   * @this {Block}
   */
  quoteField_: function(fieldName) {
    for (let i = 0, input; (input = this.inputList[i]); i++) {
      for (let j = 0, field; (field = input.fieldRow[j]); j++) {
        if (fieldName === field.name) {
          input.insertFieldAt(j, this.newQuote_(true));
          input.insertFieldAt(j + 2, this.newQuote_(false));
          return;
        }
      }
    }
    console.warn(
        'field named "' + fieldName + '" not found in ' + this.toDevString());
  },

  /**
   * A helper function that generates a FieldImage of an opening or
   * closing double quote. The selected quote will be adapted for RTL blocks.
   * @param {boolean} open If the image should be open quote (“ in LTR).
   *                       Otherwise, a closing quote is used (” in LTR).
   * @return {!FieldImage} The new field.
   * @this {Block}
   */
  newQuote_: function(open) {
    const isLeft = this.RTL ? !open : open;
    const dataUri =
        isLeft ? this.QUOTE_IMAGE_LEFT_DATAURI : this.QUOTE_IMAGE_RIGHT_DATAURI;
    return Blockly.fieldRegistry.fromJson({
      type: 'field_image',
      src: dataUri,
      width: this.QUOTE_IMAGE_WIDTH,
      height: this.QUOTE_IMAGE_HEIGHT,
      alt: isLeft ? '\u201C' : '\u201D',
    });
  },
};

/**
 * Wraps TEXT field with images of double quote characters.
 * @this {Block}
 */
const TEXT_QUOTES_EXTENSION = function() {
  this.mixin(QUOTE_IMAGE_MIXIN);
  this.quoteField_('TEXT');
};

Blockly.Extensions.registerMutator("arg_join_mutator",ARG_JOIN_MUTATOR_MIXIN,TEXT_JOIN_EXTENSION);
