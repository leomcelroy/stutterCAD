import {solveSystem, parseComb} from './optimize.js';

class Solver {
  constructor(eqs = [], vars = {}) {
    this.eqs = eqs;
    this.vars = vars;
  }

  addEq(eq) {
    return this.eqs.unshift(eq);
  }

  addVar(singleVar) {
    return this.vars.push(singleVar);
  }

  setVar(varName, value) {
    this.vars[varName] = value;
  }

  addPoint(point, id) {
    let xID = `x${id}`;
    let yID = `y${id}`;

    this.vars[xID] = point.x;
    this.vars[yID] = point.y;
  }

  costFunction() {
    return parseComb(this.eqs)
  }

  solve() {
    let loss = this.costFunction();

    let constrainedVars = {};
    Object.entries(this.vars).forEach(([k, v], i) => {
      if (!(loss.indexOf(k) === -1)) {constrainedVars[k] = v;}
    })

    let sols = solveSystem(this.eqs, constrainedVars);

    Object.entries(sols[1]).forEach(([k,v]) => {
      this.vars[k] = v;
    })

    return sols[0]

  }

}

export {Solver}
