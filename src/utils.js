import {ControlPoint, Point, Line, Bezier, Arc, Clone, Circle} from './shapes.js';
import * as C from './constraints/constraints.js';

function clone(context) { //copies selected shapes
  let newClipboard = [];
  let alreadyCopied = [];

  const create = {
    point: (p, solver) => {
      if (alreadyCopied.indexOf(p) === -1) {
        let pos = {x:p.point.x, y:p.point.y}; //set offset here
        let ns = new Clone(pos, p, {x:0, y:0}); //set offset here
        ns.selectBoolean(true);
        newClipboard.push(ns);
        alreadyCopied.push(p)
        return ns;
      }
    },
    line: (l, solver) => {
      let newPoints = l.pointList.map(p => create["point"](p, solver));
      let ns = new Line(newPoints[0], newPoints[1]);
      if (l.construction) {ns.construction = true}
      ns.selectBoolean(true);
      newClipboard.push(ns);
      return ns;
    },
    bezier: (b, solver) => {

    },
    arc: (a, solver) => {
      console.log("arcs can not be cloned because they rely on a hidden constraint")
    }
  }

  let points = [];

  context.state.shapes.forEach(s => {
    if (s.shape === "point") {
      points.push(s);
    } else if (s.selected) {
      create[s.shape](s, context.solver);
    }
  })

  points.forEach(s => {
    if (s.selected) {
      create[s.shape](s, context.solver);
    }
  })

  return newClipboard;
}

function copy(context,
              offset = {x:0, y:0}, //for transformations
              selected = true,
              toCopy = context.state.shapes) { //copies selected shapes, maybe it should just copy what it is passed, oh well

  let newClipboard = [];
  let alreadyCopied = [];
  // let constraintsToReplace = context.state.constraints.filter(c => c.targets.every(t => t.selected && toCopy.indexOf(t) > -1));
  let pointsInShapes = toCopy.map(x => x.pointList).reduce((x,y) => x.concat(y), []);
  let shapesOfInterestAndPoints = toCopy.concat(pointsInShapes).map(s => s.OGid);
  let constraintsToReplace = context.state.constraints.filter(c => c.targets.every(t => t.selected && shapesOfInterestAndPoints.indexOf(t.OGid) > -1));
  let shapeMap = {};

  const create = {
    point: (p, solver) => {
      if (alreadyCopied.indexOf(p.OGid) === -1) {
        let pos = {x:p.point.x+offset.x, y:p.point.y+offset.y};
        let ns = new Point(pos, solver);
        if (p.clone) {
          ns = new Clone(pos, p.progenitor, {x:p.offset.x + offset.x, y:p.offset.y + offset.y}, p.angle, p.scaleSigns)
        }
        ns.selectBoolean(selected);
        newClipboard.push(ns);
        alreadyCopied.push(p.OGid)
        shapeMap[p.OGid] = ns;
        return ns;
      }
    },
    line: (l, solver) => {
      let newPoints = l.pointList.map(p => create["point"](p, solver));
      let ns = new Line(newPoints[0], newPoints[1]);
      if (l.construction) {ns.construction = true}
      ns.selectBoolean(selected);
      newClipboard.push(ns);
      shapeMap[l.OGid] = ns;
      return ns
    },
    bezier: (b, solver) => {

    },
    arc: (a, solver, context) => {
      let newPoints = a.pointList.map(p => create["point"](p, solver));
      let ns = new Arc(newPoints[0], newPoints[1], newPoints[2], context);
      if (a.construction) {ns.construction = true}
      ns.selectBoolean(selected);
      newClipboard.push(ns);
      shapeMap[a.OGid] = ns;
      return ns
    },
    circle: (c, solver) => {
      let newPoints = c.pointList.map(p => create["point"](p, solver));
      let ns = new Circle(newPoints[0], newPoints[1]);
      if (c.construction) {ns.construction = true}
      ns.selectBoolean(selected);
      newClipboard.push(ns);
      shapeMap[c.OGid] = ns;
      return ns
    }
  }

  let points = [];

  toCopy.forEach(s => {
    if (s.shape === "point") {
      points.push(s);
    } else if (s.selected) {
      create[s.shape](s, context.solver, context);
    }
  })

  points.forEach(s => {
    if (s.selected) {
      create[s.shape](s, context.solver);
    }
  })

  //this is for reviving uploads
  newClipboard.forEach(s => {
    if (s.clone && shapeMap[s.progenitor.OGid]) {
      s.progenitor = shapeMap[s.progenitor.OGid];
    }
  })

  let newCs = [];

  constraintsToReplace.forEach(c => {
    let targets = c.targets.map(t => shapeMap[t.OGid]);
    let dist = c.dist;
    let angle = c.angle;
    let x = c.x;
    let y = c.y;

    let newC;
    switch(c.name) {
      case "coincident":
        newC = new C.Coincident(targets[0], targets[1]);
        break;
      case 'coincidentLine':
        newC = new C.DistancePointLine(targets[0], targets[1], dist);
        break;
      case 'setX':
        newC = new C.SetX(targets[0], x);
        if (context.state.transformOperation !== '') { newC = false; }
        break;
      case 'setY':
        newC = new C.SetY(targets[0], y);
        if (context.state.transformOperation !== '') { newC = false; }
        break;
      case 'fixed':
        newC = new C.Fixed(targets[0], x, y);
        if (context.state.transformOperation !== '') { newC = false; }
        break;
      case 'distance':
        newC = new C.Distance(targets[0], targets[1], dist);
        break;
      case 'equal':
        newC = new C.Equal(targets[0], targets[1]);
        break;
      case 'vertical':
        newC = new C.Vertical(targets[0], targets[1]);
        if (context.state.transformOperation[0] === "r" || context.state.transformOperation[0] === "s") { newC = false; }
        break;
      case 'horizontal':
        newC = new C.Horizontal(targets[0], targets[1]);
        if (context.state.transformOperation[0] === "r" || context.state.transformOperation[0] === "s") { newC = false; }        break;
      case 'parallel':
        newC = new C.Parallel(targets[0], targets[1]);
        break;
      case 'perpendicular':
        newC = new C.Perpendicular(targets[0], targets[1]);
        break;
      case 'angle':
        newC = new C.Angle(targets[0], targets[1], angle);
        break;
      default:
        break;
    }

    newCs.push(newC);
  })

  newCs = newCs.filter(c => c !== false);
  if (context.state.transformOperation.slice(0,5) === "scale") {
    newCs = newCs.filter(c => c.name === "coincident")
  }

  return [newClipboard, newCs];
}

const functionAverageX = (total, amount, index, array) => {
  if (index === 1) {
    total = total.x;
  }
  total += amount.x;
  if( index === array.length-1 ) {
    return total/array.length;
  } else {
    return total;
  }
};

const functionAverageY = (total, amount, index, array) => {
  if (index === 1) {
    total = total.y;
  }
  total += amount.y;
  if( index === array.length-1 ) {
    return total/array.length;
  }else {
    return total;
  }
};

const distance = (p1, p2) => {
  return Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
}

const distanceSquared = (p1, p2) => {
  return (p1.x - p2.x)**2 + (p1.y - p2.y)**2;
}

const functionGetAngle = (p1, p2) => {return Math.atan2(p2.y - p1.y, p2.x - p1.x);}

const cleanUpShapes = (shapes) => {
  //helper function
  const ogProg = (clone, lineage = []) => {
    let prog = clone.progenitor;
    lineage.push(prog);

    if (prog instanceof Clone) {
      return ogProg(prog, lineage);
    }

    return lineage;
  }

  // remove clones that are missing progenitors, maybe progentior should be switched though
  let newShapes = shapes.filter(x => {
    if (x instanceof Clone) {
      let lineage = ogProg(x);
      return lineage.every(prog => shapes.indexOf(prog) > -1);
      // return true;
    } else {
      return true;
    }
  })

    // remove shapes that are missing points
  let newShapes2 = newShapes.filter(x => {
    if (x.shape !== "point") {
      return x.pointList.every(p => newShapes.indexOf(p) > -1);
    } else {
      return true;
    }
  })

  return newShapes2;
}

const removeMissingConstraints = (newShapes, constraints) => {
  let points = newShapes.map(x => x.pointList).reduce((x,y) => x.concat(y), []);

  let newConstraints = constraints.filter(c => c.points.every(p => points.indexOf(p) > -1));

  return newConstraints
};

export {clone, copy, functionAverageX, functionAverageY, distance, functionGetAngle, cleanUpShapes, distanceSquared, removeMissingConstraints}
