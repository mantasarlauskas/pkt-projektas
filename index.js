const ohm = require('ohm-js');
const fs = require('fs');
const { Scope } = require('./ast');
const grammar = ohm.grammar(fs.readFileSync('./grammar.ohm').toString());
const semantics = require('./semantics').getSemantics(grammar);
const globalScope = new Scope();

const args = process.argv.slice(2);

const file = fs.readFileSync(args[0]).toString();
const match = grammar.match(file);
if (match.failed()) {
  console.log('Error: ' + match.message);
}
const ret = semantics(match).toAST();
console.log(ret);
ret = ret.resolve(globalScope);
