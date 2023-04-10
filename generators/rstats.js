export const rstatsGenerator = new Blockly.Generator('RSTATS');


// https://github.com/google/blockly/blob/bb9f31853dfb2e148ac655a05420c413d083568a/generators/python.js#L77
// https://blocklycodelabs.dev/codelabs/custom-generator/index.html?index=..%2F..index#3
rstatsGenerator.PRECEDENCE = 0;
rstatsGenerator.ORDER_ATOMIC = 0;             // 0 "" ...
rstatsGenerator.ORDER_COLLECTION = 1;         // tuples, lists, dictionaries
rstatsGenerator.ORDER_STRING_CONVERSION = 1;  // `expression...`
rstatsGenerator.ORDER_MEMBER = 2.1;           // . []
rstatsGenerator.ORDER_FUNCTION_CALL = 2.2;    // ()
rstatsGenerator.ORDER_EXPONENTIATION = 3;     // **
rstatsGenerator.ORDER_UNARY_SIGN = 4;         // + -
rstatsGenerator.ORDER_BITWISE_NOT = 4;        // ~
rstatsGenerator.ORDER_MULTIPLICATIVE = 5;     // * / // %
rstatsGenerator.ORDER_ADDITIVE = 6;           // + -
rstatsGenerator.ORDER_BITWISE_SHIFT = 7;      // << >>
rstatsGenerator.ORDER_BITWISE_AND = 8;        // &
rstatsGenerator.ORDER_BITWISE_XOR = 9;        // ^
rstatsGenerator.ORDER_BITWISE_OR = 10;        // |
rstatsGenerator.ORDER_RELATIONAL = 11;        // in, not in, is, is not,
                                     //     <, <=, >, >=, <>, !=, ==
rstatsGenerator.ORDER_LOGICAL_NOT = 12;       // not
rstatsGenerator.ORDER_LOGICAL_AND = 13;       // and
rstatsGenerator.ORDER_LOGICAL_OR = 14;        // or
rstatsGenerator.ORDER_CONDITIONAL = 15;       // if else
rstatsGenerator.ORDER_LAMBDA = 16;            // lambda
rstatsGenerator.ORDER_NONE = 99;              // (...)

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
/*
rstatsGenerator['logic_compare'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '"FOO" == "BAR"';
  return [code, rstatsGenerator.PRECEDENCE];
};
*/
rstatsGenerator['logic_compare'] = function(block) {
  // Comparison operator.
  const OPERATORS =
      {'EQ': '==', 'NEQ': '!=', 'LT': '<', 'LTE': '<=', 'GT': '>', 'GTE': '>='};
  const operator = OPERATORS[block.getFieldValue('OP')];
  const order = rstatsGenerator.ORDER_RELATIONAL;
  const argument0 = rstatsGenerator.valueToCode(block, 'A', order) || '0';
  const argument1 = rstatsGenerator.valueToCode(block, 'B', order) || '0';
  const code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

rstatsGenerator['logic_boolean'] = function(block) {
  const code = (block.getFieldValue('BOOL') == 'TRUE') ? 'TRUE' : 'FALSE';
  return [code, rstatsGenerator.PRECEDENCE];
};

rstatsGenerator['logic_negate'] = function(block) {
  // Negation.
  const argument0 =
      rstatsGenerator.valueToCode(block, 'BOOL', rstatsGenerator.ORDER_LOGICAL_NOT) || 'TRUE';
  const code = '! ' + argument0;
  return [code, rstatsGenerator.ORDER_LOGICAL_NOT];
};

rstatsGenerator['logic_ternary'] = function(block) {
  // Ternary operator.
  const value_if =
      rstatsGenerator.valueToCode(block, 'IF', rstatsGenerator.ORDER_CONDITIONAL) || 'FALSE';
  const value_then =
      rstatsGenerator.valueToCode(block, 'THEN', rstatsGenerator.ORDER_CONDITIONAL) || 'NULL';
  const value_else =
      rstatsGenerator.valueToCode(block, 'ELSE', rstatsGenerator.ORDER_CONDITIONAL) || 'NULL';
  //const code = value_then + ' if ' + value_if + ' else ' + value_else;
  const code = "ifelse(" + value_if + ", " + value_then + ", " + value_else + ")";
  return [code, rstatsGenerator.ORDER_CONDITIONAL];
};

rstatsGenerator['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  const operator = (block.getFieldValue('OP') === 'AND') ? '&' : '|';
  const order =
      (operator === 'and') ? rstatsGenerator.ORDER_LOGICAL_AND : rstatsGenerator.ORDER_LOGICAL_OR;
  let argument0 = rstatsGenerator.valueToCode(block, 'A', order);
  let argument1 = rstatsGenerator.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'FALSE';
    argument1 = 'FALSE';
  } else {
    // Single missing arguments have no effect on the return value.
    const defaultArgument = (operator === '&') ? 'TRUE' : 'FALSE';
    if (!argument0) {
      argument0 = defaultArgument;
    }
    if (!argument1) {
      argument1 = defaultArgument;
    }
  }
  const code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

rstatsGenerator['logic_operation_first'] = function(block) {
  // Operations 'and', 'or'.
  const operator = (block.getFieldValue('OP') === 'AND') ? '&&' : '||';
  const order =
      (operator === 'and') ? rstatsGenerator.ORDER_LOGICAL_AND : rstatsGenerator.ORDER_LOGICAL_OR;
  let argument0 = rstatsGenerator.valueToCode(block, 'A', order);
  let argument1 = rstatsGenerator.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'FALSE';
    argument1 = 'FALSE';
  } else {
    // Single missing arguments have no effect on the return value.
    const defaultArgument = (operator === '&&') ? 'TRUE' : 'FALSE';
    if (!argument0) {
      argument0 = defaultArgument;
    }
    if (!argument1) {
      argument1 = defaultArgument;
    }
  }
  const code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
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
  //let test = rstatsGenerator.blockToCode(targetBlock, true);
  //console.log(test);
  // TODO: Assemble JavaScript into code variable.
  var code = 'dplyr::mutate(' + statements_arguements + ')';
  return code;
};

rstatsGenerator['select'] = function(block) {
  //var statements_arguements = rstatsGenerator.statementToCode(block, 'ARGUEMENTS');
  // TODO: Assemble JavaScript into code variable
  const values = [];
  //console.log(block);
  //console.log("itemcount is (" + block.itemCount_ + ")");
  for (let i = 0; i < block.itemCount_; i++) {
    const valueCode = rstatsGenerator.valueToCode(block, 'ADD' + i,
        rstatsGenerator.PRECEDENCE);
    //console.log("valueaCode is (" + valueCode + ")");
    if (valueCode) {
      values.push(valueCode);
    }
  }
  const valueString = values.join(',\n');
  //console.log("valuestring is (" + valueString +  ")");
  const indentedValueString =
    rstatsGenerator.prefixLines(valueString, rstatsGenerator.INDENT);
  var code = 'dplyr::select(' + indentedValueString + ')';
  return code;
};

rstatsGenerator['filter'] = function(block) {
  //var statements_arguements = rstatsGenerator.statementToCode(block, 'ARGUEMENTS');
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

rstatsGenerator['glimpse'] = function(block) {
  var code = 'dplyr::glimpse()';
  return code;
};

// 
// verisr
//

rstatsGenerator['getenumCI'] = function(block) {
  var value_veris = rstatsGenerator.valueToCode(block, 'veris', rstatsGenerator.ORDER_ATOMIC) || null;
  var value_enum = rstatsGenerator.valueToCode(block, 'enum', rstatsGenerator.ORDER_ATOMIC) || 'NULL';
  var value_by = rstatsGenerator.valueToCode(block, 'by', rstatsGenerator.ORDER_ATOMIC) || 'NULL';
  var value_na_rm = rstatsGenerator.valueToCode(block, 'na.rm', rstatsGenerator.ORDER_ATOMIC) || 'NULL';
  var value_unk = rstatsGenerator.valueToCode(block, 'unk', rstatsGenerator.ORDER_ATOMIC) || 'FALSE';
  var value_short_names = rstatsGenerator.valueToCode(block, 'short.names', rstatsGenerator.ORDER_ATOMIC) || 'TRUE';
  var value_top = rstatsGenerator.valueToCode(block, 'top', rstatsGenerator.ORDER_ATOMIC) || 'NULL';
  var value_force = rstatsGenerator.valueToCode(block, 'force', rstatsGenerator.ORDER_ATOMIC) || 'TRUE';
  var value_quietly = rstatsGenerator.valueToCode(block, 'quietly', rstatsGenerator.ORDER_ATOMIC) || 'FALSE';
  // TODO: Assemble JavaScript into code variable.
  var code = 'getenumCI(';
  if (value_veris) {
    code = code + value_veris + ", ";
  }
  code = code + value_enum + ',by=' + value_by + ',\n    na.rm=' + value_na_rm + 
    ', unk=' + value_unk + ', short.name=' + value_short_names + ',\n    top=' + value_top +
    ', force=' + value_force + ', quietly=' + value_quietly + ')\n';
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

rstatsGenerator['ls'] = function(block) {
  var code = 'ls()';
  return code;
};

rstatsGenerator['load'] = function(block) {
  var value_file = rstatsGenerator.valueToCode(block, 'file', rstatsGenerator.PRECEDENCE) || 'NULL';
  var value_verbose = rstatsGenerator.valueToCode(block, 'verbose', rstatsGenerator.PRECEDENCE) || 'FALSE';
  //console.log(statements_arguments);
  var code = 'load(' + value_file + ", verbose=" + value_verbose + ")";
  return code;
};

rstatsGenerator['c'] = function(block) {
  // Variable setter.
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
  var code = 'c(' + indentedValueString + ')';
  return [code, rstatsGenerator.PRECEDENCE];
};

rstatsGenerator['list'] = function(block) {
  var statements_arguements = rstatsGenerator.statementToCode2(block, 'ARGUEMENTS') || null;
  const targetBlock = block.getInputTargetBlock('ARGUEMENTS');
  //let test = rstatsGenerator.blockToCode(targetBlock, true);
  //console.log(test);
  // TODO: Assemble JavaScript into code variable.
  var code = 'list(' + statements_arguements + ')';
  return code;
};


// 
// variables
// 
rstatsGenerator['variables_get'] = function(block) {
  // Variable getter.
  // console.log(rstatsGenerator.nameDB_.getName(block.getFieldValue('VAR'), 'VARIABLE'));
  // console.log(rstatsGenerator.nameDB_.getName(block.getFieldValue('VAR'), 'NAME'));
  // console.log(block.getField('VAR').getText());
  const code = "`" + block.getField('VAR').getText() + "`";
  return [code, rstatsGenerator.PRECEDENCE];
};


rstatsGenerator['variables_set'] = function(block) {
  // Variable setter.
  const argument0 =
      rstatsGenerator.valueToCode(block, 'VALUE', rstatsGenerator.PRECEDENCE) || '0';
  const varName = block.getField('VAR').getText();
  return '`' + varName + '`' + ' = ' + argument0;
};


// 
// text
// 

rstatsGenerator['text_join'] = function(block) {
//  // Variable getter.
//  const code =
//      //Python.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
//      "`" + block.getFieldValue('VAR') + "`";
//  return [code, rstatsGenerator.PRECEDENCE];
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
  var code = 'paste0(' + indentedValueString + ')';
  return [code, rstatsGenerator.PRECEDENCE];
};

rstatsGenerator['text'] = function(block) {
  const textValue = block.getFieldValue('TEXT');
  const code = `"${textValue}"`;
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

rstatsGenerator['math_number'] = function(block) {
  const code = String(block.getFieldValue('NUM'));
  return [code, rstatsGenerator.PRECEDENCE];
};

rstatsGenerator['math_change'] = function(block) {
  // Add to a variable in place.
  //Python.definitions_['from_numbers_import_Number'] =
  //    'from numbers import Number';
  const argument0 =
      rstatsGenerator.valueToCode(block, 'DELTA', rstatsGenerator.ORDER_ADDITIVE) || '0';
  const varName =
      rstatsGenerator.nameDB_.getName(block.getFieldValue('VAR'), 'VARIABLE');
  return "`" + varName + '` = `' + varName + "` + " + argument0;
};

// 
// other stuff
// 

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