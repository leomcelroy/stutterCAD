import * as c from './constraints.js';

//uses context as sub for this

const filterOverlapping = (shapes) => {
  let points = shapes.filter(s => s.shape === "point");
  let notPoints = shapes.filter(s => s.shape !== "point")
  let passingPoints = [];
  let seenIDs = [];

  points.forEach(p => {
    if (seenIDs.indexOf(p.id) === -1) {
      passingPoints.push(p);
      seenIDs.push(p.id);
    }
  });

  let newShapes = notPoints.concat(passingPoints);

  return newShapes;
}

const removeControlsAndClones = (shapes) => shapes.filter(s => !s.isSelfControlPoint && !s.clone);

const arcsCircles = (shapes) => shapes.filter(s => s.shape === "arc" || s.shape === "circle");
const lines = (shapes) => shapes.filter(s => s.shape === "line");
const pointsC = (shapes) => shapes.filter(s => s.shape === "point");


function removeConstraint(index, context) {
  //console.log("pre", JSON.stringify(context.solver.eqs));

  let oldConstraints = context.state.constraints;

  //TODO: beginning of look up table
  if (oldConstraints[index].name === "coincident") {
    //console.log(JSON.stringify(context.solver.vars))
    let [p1, p2] = oldConstraints[index].points;

    let oldID = p2.id;
    let newID = p2.OGid;
    context.solver.setVar(`x${newID}`, context.solver.vars[`x${oldID}`]);
    context.solver.setVar(`y${newID}`, context.solver.vars[`y${oldID}`]);

    // oldConstraints[index].points[0].coincident = false;

    p2.id = p2.OGid;
    p2.coincident = false;
    if (p2.bezierPoint && p1.bezierPoint && !p2.isSelfControlPoint && !p1.isSelfControlPoint)
      p1.otherControlPoint = undefined;
      p2.otherControlPoint = undefined;
  }

  let newConstraintsFirstHalf = oldConstraints.slice(index+1);
  let newConstraintsSecondHalf = oldConstraints.slice(0, index);

  let newConstraints = newConstraintsFirstHalf.concat(newConstraintsSecondHalf);

  return context.setState({constraints: newConstraints});
}

async function asyncUpdate(context) {
  context.updatePoints();
  return context.forceUpdate();
}

async function updateWithConstraints(c, context) {
  await context.setState({ constraints : c });
  return asyncUpdate(context);
  // return context.forceUpdate();
}

function makeHorizontal(context) { //input: any number of points, a line
  let selectedPoints = [];

  let shapes = filterOverlapping(context.state.shapes);
  shapes = removeControlsAndClones(shapes);

  shapes.forEach(shape => {
    if (shape.shape === "point" && shape.selected) {
      selectedPoints.push(shape);
    }
  })

  let horizontalConstraints = [];

  for(let i=0; i < selectedPoints.length - 1; i+=2) {
    let newC = new c.Horizontal(selectedPoints[i], selectedPoints[i+1]);
    horizontalConstraints.push(newC);
  }

  let oldConstraints = context.state.constraints;

  let newConstraints = oldConstraints.concat(horizontalConstraints);

  updateWithConstraints(newConstraints, context);
}

function makeVertical(context) {
  let selectedPoints = [];

  let shapes = filterOverlapping(context.state.shapes);
  shapes = removeControlsAndClones(shapes);

  shapes.forEach(shape => {
    if (shape.shape === "point" && shape.selected) {
      selectedPoints.push(shape);
    }
  })

  let verticalConstraints = [];

  for(let i=0; i < selectedPoints.length - 1; i+=2) {
    let newC = new c.Vertical(selectedPoints[i], selectedPoints[i+1]);
    verticalConstraints.push(newC);
  }

  let oldConstraints = context.state.constraints;

  let newConstraints = oldConstraints.concat(verticalConstraints);

  updateWithConstraints(newConstraints, context);
}

function distancePL(context) {
  let dist = parseFloat(document.getElementById('distPL').value, 10);

  let selectedLines = [];
  let noSelect = [];
  let selectedPoints = [];
  let shapes = filterOverlapping(context.state.shapes);
  shapes = removeControlsAndClones(shapes);

  shapes.forEach(shape => {
    if (shape.shape === "point" && shape.selected) {
      selectedPoints.push(shape);
    } else if (shape.shape === "line" && shape.selected){
      selectedLines.push(shape);
      shape.pointList.forEach(p => noSelect.push(p))
    }
  })

  selectedPoints = selectedPoints.filter(p => noSelect.indexOf(p) === -1)

  let point = selectedPoints[0];
  let line = selectedLines[0];

  let dc = new c.DistancePointLine(point, line, dist);

  let oldConstraints = context.state.constraints;

  oldConstraints.push(dc);

  updateWithConstraints(oldConstraints, context);
}

function makeX(context) {
  let selectedPoints = [];
  let shapes = filterOverlapping(context.state.shapes);
  shapes = removeControlsAndClones(shapes);

  shapes.forEach(shape => {
    if (shape.shape === "point" && shape.selected) {
      selectedPoints.push(shape);
    }
  })

  let xConstraints = selectedPoints.map(point => {
    return new c.SetX(point, point.point.x)
  })

  let oldConstraints = context.state.constraints;
  let newConstraints = oldConstraints.concat(xConstraints);

  updateWithConstraints(newConstraints, context);
}

function makeY(context) {
  let selectedPoints = [];
  let shapes = filterOverlapping(context.state.shapes);
  shapes = removeControlsAndClones(shapes);

  shapes.forEach(shape => {
    if (shape.shape === "point" && shape.selected) {
      selectedPoints.push(shape);
    }
  })

  let yConstraints = selectedPoints.map(point => {
    return new c.SetY(point, point.point.y)
  })

  let oldConstraints = context.state.constraints;
  let newConstraints = oldConstraints.concat(yConstraints);

  updateWithConstraints(newConstraints, context);
}

function makeFixed(context) {
  let selectedPoints = [];
  let shapes = filterOverlapping(context.state.shapes);
  shapes = removeControlsAndClones(shapes);

  shapes.forEach(shape => {
    if (shape.shape === "point" && shape.selected) {
      selectedPoints.push(shape);
    }
  })

  let constraints = selectedPoints.map(point => {
    return new c.Fixed(point, point.point.x, point.point.y)
  })

  let oldConstraints = context.state.constraints;
  let newConstraints = oldConstraints.concat(constraints);

  updateWithConstraints(newConstraints, context);
}

function makeCoincident(context) {
  //inputs: some number of points, a point and a line, a point and an arc
  let selectedPoints = [];
  let shapes = filterOverlapping(context.state.shapes);
  shapes = removeControlsAndClones(shapes);
  let arcs = arcsCircles(context.state.shapes);

  shapes.forEach(shape => {
    if (shape.shape === "point") {
      if (shape.selected) { //|| shape.overlapping
        selectedPoints.push(shape);
      }
    }
  })

  let firstPoint = selectedPoints[0];

  let coinConstraints = selectedPoints.slice(1).map(point => {
    return new c.Coincident(firstPoint, point)
  })

  let oldConstraints = context.state.constraints;

  let newConstraints = oldConstraints.concat(coinConstraints);

  updateWithConstraints(newConstraints, context);
}

function makeDistance(context){
  let dist = parseFloat(document.getElementById('length').value, 10);

  let selectedPoints = [];
  let shapes = context.state.shapes;
  // let shapes = filterOverlapping(context.state.shapes);
  // shapes = removeControlsAndClones(shapes);
  // console.log(shapes);

  shapes.forEach(shape => {
    if (shape.shape === "point" && shape.selected) {
      selectedPoints.push(shape);
    }
  })

  // console.log(selectedPoints);

  let p1 = selectedPoints[selectedPoints.length - 1]
  let p2 = selectedPoints[selectedPoints.length - 2]
  console.log(p1, p2)

  let newCon = new c.Distance(p1, p2, dist);

  let oldConstraints = context.state.constraints;

  let newConstraints = oldConstraints.concat(newCon);

  updateWithConstraints(newConstraints, context);
}

function makeAngle(context){
  let angle = 90 - parseFloat(document.getElementById('angle').value, 10);

  let selectedLines = [];
  let shapes = filterOverlapping(context.state.shapes);
  shapes = removeControlsAndClones(shapes);

  shapes.forEach(shape => {
    if (shape.shape === "line" && shape.selected) {
      selectedLines.push(shape);
    }
  })

  let firstLine = selectedLines[0];

  let perConstraints = selectedLines.slice(1).map(line => {
    return new c.Angle(firstLine, line, angle)
  })

  let oldConstraints = context.state.constraints;

  let newConstraints = oldConstraints.concat(perConstraints);

  updateWithConstraints(newConstraints, context);
}

function makeEqual(context){
  let selectedLines = [];
  let shapes = filterOverlapping(context.state.shapes);
  shapes = removeControlsAndClones(shapes);

  shapes.forEach(shape => {
    if (shape.shape === "line" && shape.selected) {
      selectedLines.push(shape);
    }
  })

  let firstLine = selectedLines[0];

  let perConstraints = selectedLines.slice(1).map(line => {
    return new c.Equal(firstLine, line)
  })

  let oldConstraints = context.state.constraints;

  let newConstraints = oldConstraints.concat(perConstraints);

  updateWithConstraints(newConstraints, context);
}

// function makeAngle(context){
//   let angle = parseInt(document.getElementById('angle').value);
//
//   let selectedLines = [];
//   context.state.shapes.forEach(shape => {
//     if (shape.shape === "line" && shape.selected) {
//       selectedLines.push(shape);
//     }
//   })
//
//   let firstLine = selectedLines[0];
//
//   let newCon = new Angle(firstLine, firstLine, angle);
//
//   let oldConstraints = context.state.constraints;
//
//   let newConstraints = oldConstraints.concat(newCon);
//
//   updateWithConstraints(newConstraints, context);
// }

function makeParallel(context){
  let selectedLines = [];
  let shapes = filterOverlapping(context.state.shapes);
  shapes = removeControlsAndClones(shapes);

  shapes.forEach(shape => {
    if (shape.shape === "line" && shape.selected) {
      selectedLines.push(shape);
    }
  })

  let firstLine = selectedLines[0];

  let parConstraints = selectedLines.slice(1).map(line => {
    return new c.Parallel(firstLine, line)
    //return new Angle(firstLine, line, 90)
  })

  let oldConstraints = context.state.constraints;

  let newConstraints = oldConstraints.concat(parConstraints);

  updateWithConstraints(newConstraints, context);
}

function makePerpendicular(context){
  let selectedLines = [];
  let shapes = filterOverlapping(context.state.shapes);
  shapes = removeControlsAndClones(shapes);

  shapes.forEach(shape => {
    if (shape.shape === "line" && shape.selected) {
      selectedLines.push(shape);
    }
  })

  let firstLine = selectedLines[0];

  let perConstraints = selectedLines.slice(1).map(line => {
    return new c.Perpendicular(firstLine, line)
    //return new Angle(firstLine, line, 0)
  })

  let oldConstraints = context.state.constraints;

  let newConstraints = oldConstraints.concat(perConstraints);

  updateWithConstraints(newConstraints, context);
}


export {updateWithConstraints, distancePL, makeEqual, removeConstraint, makeParallel, makeY, makeX, makeAngle, makeFixed, makeVertical, makeDistance, makePerpendicular, makeHorizontal, makeCoincident}
