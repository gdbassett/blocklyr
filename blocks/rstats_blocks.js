
//import * as Blockly from 'blockly/core';
//import * as Blockly from 'https://unpkg.com/blockly/blockly.min.js';

// Create a custom block called 'add_text' that adds
// text to the output div on the sample app.
// This is just an example and you should replace this with your
// own custom blocks.
Blockly.Blocks['input_item'] = {
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendField('Input');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Represents an input');
    this.contextMenu = false;
  }
};

export const rstats_blocks = Blockly.common.createBlockDefinitionsFromJsonArray([
{
  "type": "c",
  "message0": "c",
  "args0": [
  ],
  "previousStatement": null,
  "nextStatement": null,
  "output": null,
  "colour": 230,
  "tooltip": "Combine Values into a Vector or List",
  "helpUrl": "",
  "mutator": "arg_join_mutator" 
},
{
  "type": "list",
  "message0": "list %1",
  "args0": [
    {
      "type": "input_statement",
      "name": "ARGUEMENTS"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "output": null,
  "colour": 230,
  "tooltip": "Create, modify, and delete columns",
  "helpUrl": "Generic and Dotted Pairs"
},
{
  "type": "mutate",
  "message0": "mutate %1",
  "args0": [
    {
      "type": "input_statement",
      "name": "ARGUEMENTS"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "Create, modify, and delete columns",
  "helpUrl": "https://dplyr.tidyverse.org/reference/mutate.html"
},
{
  "type": "select",
  "message0": "select",
  "args0": [
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "Subset columns using their names and types",
  "helpUrl": "https://dplyr.tidyverse.org/reference/select.html",
  "mutator": "arg_join_mutator" 
},
{
  "type": "filter",
  "message0": "filter",
  "args0": [
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "Subset rows using column values",
  "helpUrl": "https://dplyr.tidyverse.org/reference/filter.html",
  "mutator": "arg_join_mutator" 
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
  //while (itemBlock && !itemBlock.isInsertionMarker()) {  // Ignore insertion markers!
  // switched ^ for v from lists.js blocks
  while (itemBlock) {
    if (itemBlock.isInsertionMarker()) {
      itemBlock = itemBlock.getNextBlock();
      continue
    }
    connections.push(itemBlock.valueConnection_);
    //itemBlock = itemBlock.nextConnection &&
    //    itemBlock.nextConnection.targetBlock();
    // switched ^ for v from lists.js blocks
    itemBlock = itemBlock.getNextBlock();
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
          .appendField("create empty");
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


Blockly.Extensions.registerMutator("arg_join_mutator",ARG_JOIN_MUTATOR_MIXIN, undefined, ['input_item']);
