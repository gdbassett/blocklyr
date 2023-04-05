//import * as Blockly from 'blockly';
//import * as Blockly from 'https://unpkg.com/blockly/blockly.min.js';

export const rstatsGenerator = new Blockly.Generator('RSTATS');

// https://github.com/google/blockly/blob/bb9f31853dfb2e148ac655a05420c413d083568a/generators/python.js#L77
// https://blocklycodelabs.dev/codelabs/custom-generator/index.html?index=..%2F..index#3
rstatsGenerator.PRECEDENCE = 0;
rstatsGenerator.ORDER_ADDITIVE = 6;
rstatsGenerator.ORDER_MULTIPLICATIVE = 5;
rstatsGenerator.ORDER_EXPONENTIATION = 3;

rstatsGenerator.addReservedWords(
    "if", "else", "repeat", "while", "function", "for", "in", "next", "break",
    "TRUE", "FALSE", "NULL", "Inf", "NaN", "NA", "NA_integer_", "NA_real_", "NA_complex_", "NA_character_");

rstatsGenerator.init = function(workspace) { // copied from python
  // Call Blockly.CodeGenerator's init.
  Object.getPrototypeOf(this).init.call(this);

  /**
   * Empty loops or conditionals are not allowed in Python.
   */
  //this.PASS = this.INDENT + 'pass\n';

  if (!this.nameDB_) {
    this.nameDB_ = new Blockly.Names(this.RESERVED_WORDS_);
  } else {
    this.nameDB_.reset();
  }

  this.nameDB_.setVariableMap(workspace.getVariableMap());
  this.nameDB_.populateVariables(workspace);
  this.nameDB_.populateProcedures(workspace);

  /*
  const defvars = [];
  // Add developer variables (not created or named by the user).
  const devVarList = Variables.allDeveloperVariables(workspace);
  for (let i = 0; i < devVarList.length; i++) {
    defvars.push(
        this.nameDB_.getName(devVarList[i], Names.DEVELOPER_VARIABLE_TYPE) +
        ' = None');
  }

  // Add user variables, but only ones that are being used.
  const variables = Variables.allUsedVarModels(workspace);
  for (let i = 0; i < variables.length; i++) {
    defvars.push(
        this.nameDB_.getName(variables[i].getId(), NameType.VARIABLE) +
        ' = None');
  }

  this.definitions_['variables'] = defvars.join('\n');
  */
  this.isInitialized = true;
};

rstatsGenerator.scrub_ = function(block, code, thisOnly) {
  const nextBlock =
      block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock && !thisOnly) {
    return code + ' |> \n' + rstatsGenerator.blockToCode(nextBlock);
  }
  return code;
};

// 
// logic
//

rstatsGenerator['logic_null'] = function(block) {
  return 'NULL';
};

rstatsGenerator['na'] = function(block) {
  return ['NA', rstatsGenerator.PRECEDENCE];
};

rstatsGenerator['logic_compare'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '"FOO" == "BAR"';
  return [code, rstatsGenerator.PRECEDENCE];
};

rstatsGenerator['text'] = function(block) {
  const textValue = block.getFieldValue('TEXT');
  const code = `"${textValue}"`;
  return [code, rstatsGenerator.PRECEDENCE];
};

rstatsGenerator['math_number'] = function(block) {
  const code = String(block.getFieldValue('NUM'));
  return [code, rstatsGenerator.PRECEDENCE];
};

rstatsGenerator['logic_boolean'] = function(block) {
  const code = (block.getFieldValue('BOOL') == 'TRUE') ? 'TRUE' : 'FALSE';
  return [code, rstatsGenerator.PRECEDENCE];
};

/*
rstatsGenerator['object'] = function(block) {
  const statementMembers =
      rstatsGenerator.statementToCode(block, 'MEMBERS');
  const code = '{\n' + statementMembers + '\n}';
  return [code, rstatsGenerator.PRECEDENCE];
};
*/

// 
// dplyr/tidyverse
// 

rstatsGenerator['mutate'] = function(block) {
  var statements_arguements = rstatsGenerator.statementToCode2(block, 'ARGUEMENTS') || null;
  const targetBlock = block.getInputTargetBlock('ARGUEMENTS');
  let test = rstatsGenerator.blockToCode(targetBlock, true);
  console.log(test);
  // TODO: Assemble JavaScript into code variable.
  var code = 'dplyr::mutate(' + statements_arguements + ')';
  return code;
};

rstatsGenerator['select'] = function(block) {
  //var statements_arguements = rstatsGenerator.statementToCode(block, 'ARGUEMENTS');
  // TODO: Assemble JavaScript into code variable
  const values = [];
  for (let i = 0; i < block.itemCount_; i++) {
    const valueCode = rstatsGenerator.valueToCode(block, 'ADD' + i,
        rstatsGenerator.PRECEDENCE);
    if (valueCode) {
      values.push(valueCode);
    }
  }
  const valueString = values.join(',\n');
  const indentedValueString =
    rstatsGenerator.prefixLines(valueString, rstatsGenerator.INDENT);
  var code = 'dplyr::select(' + indentedValueString + ')';
  return code;
};

rstatsGenerator['filter'] = function(block) {
  var statements_arguements = rstatsGenerator.statementToCode(block, 'ARGUEMENTS');
  // TODO: Assemble JavaScript into code variable.
  const values = [];
  for (let i = 0; i < block.itemCount_; i++) {
    const valueCode = rstatsGenerator.valueToCode(block, 'ADD' + i,
        rstatsGenerator.PRECEDENCE);
    if (valueCode) {
      values.push(valueCode);
    }
  }
  const valueString = values.join(',\n');
  const indentedValueString =
    rstatsGenerator.prefixLines(valueString, rstatsGenerator.INDENT);
  var code = 'dplyr::filter(' + indentedValueString + ')';
  return code;
};

rstatsGenerator['summarise'] = function(block) {
  var statements_arguements = rstatsGenerator.statementToCode2(block, 'ARGUEMENTS');
  // TODO: Assemble JavaScript into code variable.
  var code = 'dplyr::summarise(' + statements_arguements + ')';
  return code;
};

rstatsGenerator['read_delim'] = function(block) {
  var value_file = rstatsGenerator.valueToCode(block, 'file', rstatsGenerator.PRECEDENCE) || 'NULL';
  var statements_arguments = rstatsGenerator.statementToCode2(block, 'ARGUEMENTS') || null;
  //console.log(statements_arguments);
  var code = 'readr::read_delim(' + value_file;
  if (statements_arguments) {
    code =  code + ", " + statements_arguments + ')';
  } else  {
    code = code + ")";
  }
  return code;
};

// 
// base
// 

rstatsGenerator['print'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'print()';
  return code;
};

// 
// variables
// 
rstatsGenerator['variables_get'] = function(block) {
  // Variable getter.
  const code =
      //Python.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
      "`" + rstatsGenerator.nameDB_.getName(block.getFieldValue('VAR'), 'VARIABLE') + "`";
  return [code, rstatsGenerator.PRECEDENCE];
};


rstatsGenerator['variables_set'] = function(block) {
  // Variable setter.
  const argument0 =
      rstatsGenerator.valueToCode(block, 'VALUE', rstatsGenerator.PRECEDENCE) || '0';
  const varName =
      rstatsGenerator.nameDB_.getName(block.getFieldValue('VAR'), 'VARIABLE');
  return '`' + varName + '`' + ' = ' + argument0;
};


// 
// text
// 

rstatsGenerator['text_join'] = function(block) {
  // Variable getter.
  const code =
      //Python.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
      "`" + block.getFieldValue('VAR') + "`";
  return [code, rstatsGenerator.PRECEDENCE];
};

// 
// math
// 

rstatsGenerator['math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  const OPERATORS = {
    'ADD': [' + ', rstatsGenerator.ORDER_ADDITIVE],
    'MINUS': [' - ', rstatsGenerator.ORDER_ADDITIVE],
    'MULTIPLY': [' * ', rstatsGenerator.ORDER_MULTIPLICATIVE],
    'DIVIDE': [' / ', rstatsGenerator.ORDER_MULTIPLICATIVE],
    'POWER': [' ** ', rstatsGenerator.ORDER_EXPONENTIATION],
  };
  const tuple = OPERATORS[block.getFieldValue('OP')];
  const operator = tuple[0];
  const order = tuple[1];
  const argument0 = rstatsGenerator.valueToCode(block, 'A', order) || '0';
  const argument1 = rstatsGenerator.valueToCode(block, 'B', order) || '0';
  const code = argument0 + operator + argument1;
  return [code, rstatsGenerator.PRECEDENCE];
  // In case of 'DIVIDE', division between integers returns different results
  // in Python 2 and 3. However, is not an issue since Blockly does not
  // guarantee identical results in all languages.  To do otherwise would
  // require every operator to be wrapped in a function call.  This would kill
  // legibility of the generated code.
};



// 
// Statement to code
// Duplicating this because I need both pipe and command joins
// 
rstatsGenerator.statementToCode2 = function(block, name) {
    const targetBlock = block.getInputTargetBlock(name);
    let code = this.blockToCode2(targetBlock);
    // Value blocks must return code and order of operations info.
    // Statement blocks must only return code.
    if (typeof code !== 'string') {
      throw TypeError(
          'Expecting code from statement block: ' +
          (targetBlock && targetBlock.type));
    }
    if (code) {
      code = this.prefixLines((code), this.INDENT);
    }
    return code;
  }

 /**
   * Generate code for the specified block (and attached blocks).
   * The generator must be initialized before calling this function.
   *
   * @param block The block to generate code for.
   * @param opt_thisOnly True to generate code for only this statement.
   * @returns For statement blocks, the generated code.
   *     For value blocks, an array containing the generated code and an
   * operator order value.  Returns '' if block is null.
   */
  rstatsGenerator.blockToCode2 = function(block, opt_thisOnly) {
    if (this.isInitialized === false) {
      console.warn(
          'CodeGenerator init was not called before blockToCode was called.');
    }
    if (!block) {
      return '';
    }
    if (!block.isEnabled()) {
      // Skip past this block if it is disabled.
      return opt_thisOnly ? '' : this.blockToCode2(block.getNextBlock());
    }
    if (block.isInsertionMarker()) {
      // Skip past insertion markers.
      return opt_thisOnly ? '' : this.blockToCode2(block.getChildren(false)[0]);
    }

    const func = this[block.type];
    if (typeof func !== 'function') {
      throw Error(
          'Language "' + this.name_ + '" does not know how to generate ' +
          'code for block type "' + block.type + '".');
    }
    // First argument to func.call is the value of 'this' in the generator.
    // Prior to 24 September 2013 'this' was the only way to access the block.
    // The current preferred method of accessing the block is through the second
    // argument to func.call, which becomes the first parameter to the
    // generator.
    let code = func.call(block, block);
    if (Array.isArray(code)) {
      // Value blocks return tuples of code and operator order.
      if (!block.outputConnection) {
        throw TypeError('Expecting string from statement block: ' + block.type);
      }
      return [this.scrub_(block, code[0], opt_thisOnly), code[1]];
    } else if (typeof code === 'string') {
      if (this.STATEMENT_PREFIX && !block.suppressPrefixSuffix) {
        code = this.injectId(this.STATEMENT_PREFIX, block) + code;
      }
      if (this.STATEMENT_SUFFIX && !block.suppressPrefixSuffix) {
        code = code + this.injectId(this.STATEMENT_SUFFIX, block);
      }
      return this.scrub2_(block, code, opt_thisOnly);
    } else if (code === null) {
      // Block has handled code generation itself.
      return '';
    }
    throw SyntaxError('Invalid code generated: ' + code);
  }

rstatsGenerator.scrub2_ = function(block, code, thisOnly) {
  const nextBlock =
      block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock && !thisOnly) {
    return code + ', \n' + rstatsGenerator.blockToCode(nextBlock);
  }
  return code;
};