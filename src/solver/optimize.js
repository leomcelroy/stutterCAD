import {evaluate} from './myAutoDiff.js';

var numeric = require('numericjs');
var linearAlgebra = require('linear-algebra')(),
    Matrix = linearAlgebra.Matrix;

const EPSILON = 0.0000000000000001;

const lmM = (lambda, lambdaUp, lambdaDown, epsilon, eqs, variables) => {
  let sols = eqs.map(eq => evaluate(eq, variables).double());

  let resM = new Matrix(sols.map(sol => [sol[0]]));
  let jacobianM = new Matrix(sols.map(sol => sol[1]));

  const anyUndefined = numeric.mapreduce('accum += (xi === undefined)','0');
  if (anyUndefined(jacobianM.toArray())) { //TODO: How does this effect time?
    console.log("BUGS, jacobian is no good")
    return variables
  }


  let mT = jacobianM.trans();
  let hApprox = mT.dot(jacobianM);
  let weightedM = Matrix.scalar(hApprox.rows, lambda)
  let gM = hApprox.plus(weightedM);

  let costGradM = mT.dot(resM);

  let ans = numeric.solve(gM.toArray(), costGradM.toArray());

  let c = 0.5 * evaluate(parseComb(eqs), variables).val; // residuals.reduce((acc, cur) => acc + cur**2); // evaluate(parseComb(eqs), variables).val;

  let newVarsN = {};
  Object.keys(variables).forEach( (key,index) => {
    newVarsN[key] = variables[key] - ans[index];
  });

  let [newC, ds] = evaluate(parseComb(eqs), newVarsN).double();
  newC = 0.5 * newC;

  let converged = (newC < epsilon) || ds.every(der => Math.abs(der) < epsilon) || Math.abs(c-newC) < epsilon;
  if (converged) {return newVarsN};

  let newLambda;
  if (newC < c) {
    newLambda = lambda/lambdaDown;
    // console.log("down")
    return lmM(newLambda, lambdaUp, lambdaDown, epsilon, eqs, newVarsN);
  } else {
    newLambda = lambda*lambdaUp;
    // console.log("up")
    return lmM(newLambda, lambdaUp, lambdaDown, epsilon, eqs, variables);
  }
}

const parseComb = eqs => {
  eqs = eqs.map(eq => `(${eq})*(${eq})`);
  return eqs.join("+");
}

const splitAt = (index, array) => {
  let front = array.slice(0,index);
  let back = array.slice(index);
  return [front, back];
}

const solveSystem = (eqns, vars) => {
  if (eqns.length < 1) {return [[], vars]};

  let varsPrime = lmM(1, 10, 10, EPSILON, eqns, vars);


  // -------------- TIMING TESTS -------------------
  // var t0 = performance.now();
  // lmM(1, 10, 10, EPSILON, eqns, vars);
  // var t1 = performance.now();
  //
  // let t2 = performance.now();
  // tensorflowLM(1, 10, 10, EPSILON, eqns, vars);
  // let t3 = performance.now();
  //
  // console.log(`New is ${(t1 - t0) - (t3 - t2)} milliseconds faster`);


  // ------------ CHECK SATISFACTION -----------------
  let scores = eqns.map(eq => evaluate(eq, varsPrime).val**2); //CHANGE PARSER HERE: change to evaluate
  let satisfied = scores.map(score => score < Math.sqrt(EPSILON));

  if (satisfied.every(constraint => constraint === true)) {
    return [satisfied, varsPrime]
  } else {
    let indices = [];
    satisfied.forEach((constraint, index) => {
      if (constraint === false) { indices.push(index)}
    })
    let [front, back] = splitAt(indices[0], eqns);
    let newEqs = front.concat(back.slice(1));

    let [satisfiedPrime, out] = solveSystem(newEqs, varsPrime);

    let [a, b] = splitAt(indices[0], satisfiedPrime);

    return [a.concat([false]).concat(b), out];
  }
}

export{solveSystem, parseComb}
