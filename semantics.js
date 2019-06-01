const {
  Value,
  SymbolTable,
  Block,
  Print,
  FunctionCall,
  FunctionDeclaration,
  Comparison,
  Loop,
  Condition,
  ArithmeticOperation,
  VariableUpdate,
  VariableDeclaration,
  VariableInitialization
} = require('./ast');

const semantics = {
  Lines: block => new Block(block.toAST()),
  Term: function(_) {
    return new Value(this.sourceString.replace(/['"]+/g, ''));
  },
  Name: function(_, _1) {
    return new SymbolTable(this.sourceString);
  },
  Print: (_, _1, value, _2) => new Print(value.toAST()),
  Block: (_, body, _1) => new Block(body.toAST()),
  FunctionArguments: args => args.asIteration().toAST(),
  FunctionCall: (name, _, args, _1) =>
    new FunctionCall(name.toAST(), args.toAST()),
  FunctionDeclaration: (_, name, _1, args, _2, block) =>
    new FunctionDeclaration(name.toAST(), args.toAST(), block.toAST()),
  ConditionArguments_notEqual: (exp1, _, exp2) =>
    new Comparison('notEqual', exp1.toAST(), exp2.toAST()),
  ConditionArguments_equal: (exp1, _, exp2) =>
    new Comparison('equal', exp1.toAST(), exp2.toAST()),
  ConditionArguments_greater: (exp1, _, exp2) =>
    new Comparison('greater', exp1.toAST(), exp2.toAST()),
  ConditionArguments_less: (exp1, _, exp2) =>
    new Comparison('less', exp1.toAST(), exp2.toAST()),
  ConditionArguments_notLess: (exp1, _, exp2) =>
    new Comparison('notLess', exp1.toAST(), exp2.toAST()),
  ConditionArguments_notGreater: (exp1, _, exp2) =>
    new Comparison('notGreater', exp1.toAST(), exp2.toAST()),
  LoopDeclaration: (_, _1, args, _2, block) =>
    new Loop(args.toAST(), block.toAST()),
  ConditionDeclaration: (_, _1, args, _2, exp1, _3, exp2) =>
    new Condition(args.toAST(), exp1.toAST(), exp2.toAST()),
  Expression_plus: (arg1, _, arg2) =>
    new ArithmeticOperation('+', arg1.toAST(), arg2.toAST()),
  Expression_minus: (arg1, _, arg2) =>
    new ArithmeticOperation('-', arg1.toAST(), arg2.toAST()),
  Expression_mul: (arg1, _, arg2) =>
    new ArithmeticOperation('*', arg1.toAST(), arg2.toAST()),
  Expression_div: (arg1, _, arg2) =>
    new ArithmeticOperation('/', arg1.toAST(), arg2.toAST()),
  VariableUpdate: (name, _, exp) => {
    return new VariableUpdate(name.toAST(), exp.toAST());
  },
  VariableInitialization: (_, name, _1, exp) => {
    return new VariableInitialization(name.toAST(), exp.toAST());
  }
};

module.exports = {
  returnSemantics: grammar => grammar.addOperation('toAST', semantics)
};
