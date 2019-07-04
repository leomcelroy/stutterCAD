import {sin, cos, tan, asin, acos,
        atan, mul, div, neg, plus, minus,
        exp, sqrt, log, power} from './myAutoDiff.js';

var esprima = require('esprima');

const treeTraversal = (node, vars) => {
  if (node.type === "Literal") {
    return parseFloat(node.raw);
  } else if (node.type === "BinaryExpression") {
    let left = treeTraversal(node.left, vars);
    let right = treeTraversal(node.right, vars);

    // neg
    if (node.operator === "+"){
      return plus(left, right);
    } else if (node.operator === "*"){
      return mul(left, right);
    } else if (node.operator === "/"){
      return div(left, right);
    } else if (node.operator === "-"){
      return minus(left, right);
    } else if (node.operator === "**"){ //TODO: this is only for whole numbers, if negative doesnt work
      return power(left, right);
    }
  } else if (node.type === "Identifier"){ //sub with valder
    let variable = node.name;
    let valder = vars[variable];
    return valder;
  } else if (node.type === "CallExpression"){
    let arg = treeTraversal(node.arguments[0], vars);
    if (node.callee.name === "sin"){
      return sin(arg);
    } else if (node.callee.name === "cos"){
      return cos(arg);
    } else if (node.callee.name === "tan"){
      return tan(arg);
    } else if (node.callee.name === "asin"){ //TODO: the arc functions maybe off
      return asin(arg);
    } else if (node.callee.name === "acos"){
      return acos(arg);
    } else if (node.callee.name === "atan"){
      return atan(arg);
    } else if (node.callee.name === "exp"){
      return exp(arg);
    } else if (node.callee.name === "sqrt"){
      return sqrt(arg);
    } else if (node.callee.name === "log"){
      return log(arg);
    }
  } else if (node.type === "UnaryExpression"){
    let arg = treeTraversal(node.argument, vars);
    if (node.operator === "-") {
      return neg(arg);
    }
  }
}

const calculate = (exp, vars) => {
  let ast = esprima.parse(exp);
  let expression = ast.body[0].expression;
  let ans = treeTraversal(expression, vars);

  return ans;
}

export {calculate};
