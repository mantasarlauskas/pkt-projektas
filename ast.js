class Value {
  constructor(value) {
    this.value = value;
  }

  resolve(scope) {
    return this;
  }
}

class SymbolTable {
  constructor(name) {
    this.name = name;
  }

  resolve(scope) {
    return scope.getSymbol(this.name);
  }
}

class Scope {
  constructor(parent) {
    this.symbolTable = {};
    this.parent = parent ? parent : null;
  }

  setSymbol(sym, obj) {
    this.symbolTable[sym.name] = obj;
    return this.symbolTable[sym.name];
  }

  getSymbol(id) {
    return this.symbolTable[id]
      ? this.symbolTable[id]
      : this.parent
      ? this.parent.getSymbol(id)
      : null;
  }

  createChildScope() {
    return new Scope(this);
  }
}

class Print {
  constructor(value) {
    this.value = value;
  }

  resolve(scope) {
    if (this.value.name) {
      if (!scope.getSymbol(this.value.name)) {
        throw 'Kintamasis ' + this.value.name + ' nerastas!';
      }
      console.log(scope.getSymbol(this.value.name));
    } else {
      console.log(this.value.resolve(scope).value);
    }
    return null;
  }
}

class Block {
  constructor(block) {
    this.block = block;
  }

  resolve(scope) {
    const values = this.block.map(expr => expr.resolve(scope));
    return values.pop();
  }
}

class Slice {
  constructor(variable, index1, index2) {
    this.variable = variable;
    this.index1 = index1;
    this.index2 = index2;
  }

  resolve(scope) {
    const variable = scope.getSymbol(this.variable.name);
    const index1 = parseInt(this.index1.sourceString);
    const index2 = parseInt(this.index2.sourceString);
    if (variable && index1 && index2) {
      if (typeof variable === 'number') var length = parseInt(Math.log10(variable))+1;
      else if (typeof variable === 'string') var length = variable.length;

      if (index2 > length || index1 > length) {
        throw 'Indeksas per didelis';
      } else if (index1 > index2) {
        throw 'pradžios indeksas negali būti didesnis už pabaigos indeksą';
      } else if (index1 < 1 || index2 < 1) {
        throw 'indeksas per mažas';
      }

      if (typeof variable === 'number') {
        var temp = 0;
        for (var i = index2-1; i>=index1-1;i--)  {
          temp *= 10;

          var digit = parseInt(variable/Math.pow(10, i)) % 10;
          // if(digit == 0 && i==index2-1)
          //   temp += 10;
          // else
          temp += digit;
        }

        return new Value(temp);
      }
      else if (typeof variable === 'string') {
        var str = variable
        var res = str.substr(index1-1, index2-index1+1);

        return new Value(res);
      }
    } else {
      throw 'Patikrinkite kintamąjį ir indeksus';
    }
  }
}


class FunctionCall {
  constructor(func, args) {
    this.func = func;
    this.args = args;
  }

  resolve(scope) {
    let func = scope.getSymbol(this.func.name);
    const args = this.args.map(arg => arg.resolve(scope));
    return func.apply(null, args);
  }
}

class FunctionDeclaration {
  constructor(func, params, body) {
    this.func = func;
    this.params = params;
    this.body = body;
  }

  resolve(scope) {
    let body = this.body;
    let params = this.params;
    return scope.setSymbol(new SymbolTable(this.func.name), function() {
      let childScope = scope.createChildScope();
      params.forEach((param, i) => {
        childScope.setSymbol(new SymbolTable(param.name), arguments[i]);
      });
      return body.resolve(childScope);
    });
  }
}

class Comparison {
  constructor(operation, arg1, arg2) {
    this.operation = operation;
    this.arg1 = arg1;
    this.arg2 = arg2;
  }

  resolve(scope) {
    let value1, value2;
    if (this.arg1.name) {
      value1 = scope.getSymbol(this.arg1.name);
    } else {
      value1 = this.arg1.resolve(scope).value;
    }
    if (this.arg2.name) {
      value2 = scope.getSymbol(this.arg2.name);
    } else {
      value2 = this.arg2.resolve(scope).value;
    }

    if (parseFloat(value1) && parseFloat(value2)) {
      value1 = parseFloat(value1);
      value2 = parseFloat(value2);
    }

    if (this.operation == 'notEqual') return new Value(value1 != value1);
    if (this.operation == 'equal') return new Value(value1 == value2);
    if (this.operation == 'greater') return new Value(value1 > value2);
    if (this.operation == 'less') return new Value(value1 < value2);
    if (this.operation == 'notLess') return new Value(value1 >= value2);
    if (this.operation == 'notGreater') return new Value(value1 <= value2);
  }
}

class ArithmeticOperation {
  constructor(operation, arg1, arg2) {
    this.operation = operation;
    this.arg1 = arg1;
    this.arg2 = arg2;
  }

  resolve(scope) {
    let value1, value2;
    if (this.arg1.name) {
      value1 = scope.getSymbol(this.arg1.name);
    } else {
      value1 = this.arg1.resolve(scope).value;
    }
    if (this.arg2.name) {
      value2 = scope.getSymbol(this.arg2.name);
    } else {
      value2 = this.arg2.resolve(scope).value;
    }

    if (parseFloat(value1) && parseFloat(value2)) {
      value1 = parseFloat(value1);
      value2 = parseFloat(value2);

      if (this.operation == '+') return new Value(value1 + value2);
      if (this.operation == '-') return new Value(value1 - value2);
      if (this.operation == '/') return new Value(value1 / value2);
      if (this.operation == '*') return new Value(value1 * value2);
    }
    return new Value(null);
  }
}

class Loop {
  constructor(args, block) {
    this.args = args;
    this.block = block;
  }

  resolve(scope) {
    let count = new Value(null);
    while (true) {
      if (this.args.resolve(scope).value === false) {
        break;
      }
      count = this.block.resolve(scope);
    }
    return count;
  }
}

class Condition {
  constructor(condition, exp1, exp2) {
    this.condition = condition;
    this.exp1 = exp1;
    this.exp2 = exp2;
  }

  resolve(scope) {
    const conditionResult = this.condition.resolve(scope);
    let result = new Value(false);
    if (conditionResult.value == true) {
      result = this.exp1.resolve(scope);
    } else {
      result = this.exp2.resolve(scope);
    }
    return result;
  }
}

class VariableUpdate {
  constructor(variable, value) {
    this.variable = variable;
    this.value = value;
  }

  resolve(scope) {
    const variable = scope.getSymbol(this.variable.name);
    if (variable) {
      const parsedValue = parseFloat(this.value.resolve(scope).value);
      if (typeof variable === 'number' && !parsedValue) {
        throw 'Priskirta netinkama reiksme "Skaicius" tipo kintamajam ' +
          this.variable.name +
          '!';
      } else if (typeof variable === 'string' && parsedValue) {
        throw 'Priskirta netinkama reiksme "Tekstas" tipo kintamajam ' +
          this.variable.name +
          '!';
      }

      return scope.setSymbol(this.variable, this.value.resolve(scope).value);
    } else {
      throw 'Kintamasis ' + this.variable.name + ' nerastas';
    }
  }
}

class VariableInitialization {
  constructor(type, variable, value) {
    this.type = type;
    this.variable = variable;
    this.value = value;
  }

  resolve(scope) {
    const parsedValue = parseFloat(this.value.resolve(scope).value);
    if (this.type === 'Skaicius' && !parsedValue) {
      throw 'Priskirta netinkama reiksme "Skaicius" tipo kintamajam ' +
        this.variable.name +
        '!';
    } else if (this.type === 'Tekstas' && parsedValue) {
      throw 'Priskirta netinkama reiksme "Tekstas" tipo kintamajam ' +
        this.variable.name +
        '!';
    }
    return parsedValue
      ? scope.setSymbol(this.variable, parsedValue)
      : scope.setSymbol(this.variable, this.value.resolve(scope).value);
  }
}

module.exports = {
  Value,
  SymbolTable,
  Scope,
  Print,
  Slice,
  FunctionCall,
  FunctionDeclaration,
  Comparison,
  Loop,
  Condition,
  Block,
  ArithmeticOperation,
  VariableUpdate,
  VariableInitialization
};
