import {ControlPoint, Clone} from '../shapes.js';
import {copy, functionGetAngle, distance, cleanUpShapes, removeMissingConstraints} from '../utils.js';

//need to aid visual for controls
const transformTool = {
  down: (context) => {},

  move: (context) => {
    if (context.state.mousedown === true) {
      let point = context.state.svgMouse;
      let nonPoints = context.state.shapes.filter(x => x.shape !== "point");
      let pivot = context.state.pivot;

      let newShapes = [];
      let copies = [];
      let newConstraints = [];

      if (context.state.transformOperation === "rotate") {
        copies = copy(context, {x:0, y:0}, true, nonPoints);
        newShapes = copies[0];
        newConstraints = copies[1];

        newShapes.forEach(s => {
          if (s.shape === "point") {
            let p = s.point;
            let distanceToPivot = distance(p, pivot);
            let angleWithPivot = functionGetAngle(p, pivot);
            let ogAngle = functionGetAngle({x:context.state.firstPoint.x, y:context.state.firstPoint.y}, pivot);
            let newAngle = functionGetAngle(point, pivot);
            let angle = newAngle - ogAngle;
            let delta = angleWithPivot + Math.PI + angle;

            if (s.clone) {
              s.angle = s.angle + angle;
              //console.log(JSON.stringify(s.angle));
            }

            let newPoint = {x:pivot.x+Math.cos(delta)*distanceToPivot, y:pivot.y+Math.sin(delta)*distanceToPivot};
            s.point = newPoint;

            let id = s.id;
            context.solver.vars[`x${id}`] = newPoint.x;
            context.solver.vars[`y${id}`] = newPoint.y;

            //adjust clone offsets
            if (s instanceof Clone) {
              s.offset = {x:newPoint.x - s.progenitor.point.x, y:newPoint.y - s.progenitor.point.y};
            }
          }
        })
      }

      if (context.state.transformOperation === "move") {
        copies = copy(context, {x:(point.x-pivot.x), y: (point.y-pivot.y)}, true, nonPoints);
        newShapes = copies[0];
        newConstraints = copies[1];
      }

      if (context.state.transformOperation === "moveX") {
        copies = copy(context, {x:(point.x-pivot.x), y:0}, true, nonPoints);
        newShapes = copies[0];
        newConstraints = copies[1];
      }

      if (context.state.transformOperation === "moveY") {
        copies = copy(context, {x:0, y: (point.y-pivot.y)}, true, nonPoints);
        newShapes = copies[0];
        newConstraints = copies[1];
      }

      if (context.state.transformOperation === "scale" || context.state.transformOperation === "scaleX" || context.state.transformOperation === "scaleY") {
        copies = copy(context, {x:0, y:0}, true, nonPoints); //this is beginning of cloning issue
        newShapes = copies[0];
        newConstraints = copies[1];

        let factor = distance(point, pivot)/distance({x:context.state.firstPoint.x, y:context.state.firstPoint.y}, pivot);

        newShapes.forEach(s => {
          if (s.shape === "point") {
            let p = s.point;
            let angle = functionGetAngle(p, pivot) + Math.PI;
            let dist = distance(p, pivot);

            let newPoint, xSign, ySign;
            if (context.state.transformOperation === "scale") {
              xSign = (point.x - pivot.x < 0) ? 1 : -1;
              ySign = (point.y - pivot.y < 0) ? -1 : 1;
              newPoint = {x:pivot.x+Math.cos(angle)*factor*dist*xSign, y:pivot.y+Math.sin(angle)*factor*dist*ySign};

              s.point = newPoint;

              let id = s.id;
              context.solver.vars[`x${id}`] = newPoint.x;
              context.solver.vars[`y${id}`] = newPoint.y;

              if (s instanceof Clone) {
                s.offset = {x:newPoint.x - s.progenitor.point.x, y:newPoint.y - s.progenitor.point.y};
                s.scaleSigns = [factor*xSign*s.scaleSigns[0], factor*ySign*s.scaleSigns[1]];
              }
            } else if (context.state.transformOperation === "scaleX") {
              xSign = (point.x - pivot.x < 0) ? -1 : 1;
              newPoint = {x:pivot.x+Math.cos(angle)*factor*dist*xSign, y:0};

              s.point.x = newPoint.x;

              let id = s.id;
              context.solver.vars[`x${id}`] = newPoint.x;

              if (s instanceof Clone) {
                s.offset.x = newPoint.x - s.progenitor.point.x;
                s.scaleSigns = [factor*xSign*s.scaleSigns[0], factor*1*s.scaleSigns[1]];
              }

            } else if (context.state.transformOperation === "scaleY") {
              ySign = (point.y - pivot.y < 0) ? 1 : -1;
              newPoint = {x:0, y:pivot.y+Math.sin(angle)*factor*dist*ySign};

              s.point.y = newPoint.y;

              let id = s.id;
              context.solver.vars[`y${id}`] = newPoint.y;

              if (s instanceof Clone) {
                s.offset.y = newPoint.y - s.progenitor.point.y;
                s.scaleSigns = [factor*1*s.scaleSigns[0], factor*ySign*s.scaleSigns[1]];
              }
            }
          }
        })
      }

      let oldConstraints = context.state.constraints;
      let constraints = oldConstraints.concat(newConstraints);

      context.setState({
        newShapes, constraints
      });
    }
  },

  up: (context) => {
    if (context.state.newShapes.length > 0) {
      let pointsInShapes = context.state.shapes.filter(x => x.shape !== "point" && x.selected)
                                               .map(x => x.pointList)
                                               .reduce((x,y) => x.concat(y), []);


      let oldShapes = context.state.shapes.filter(s => !(s.selected === true && s.shape !== "point" || pointsInShapes.indexOf(s) > -1));
      let newShapes = context.state.newShapes;
      let newShapes2 = oldShapes.concat(newShapes);
      let newShapes3 = cleanUpShapes(newShapes2); //removes clones with missing lineage and curves with missing points

      context.setState({
        newShapes:[],
      })

      let hiddenConstraints = removeMissingConstraints(newShapes3, context.state.hiddenConstraints);
      let constraints = removeMissingConstraints(newShapes3, context.state.constraints);

      //clean up solver vars
      let newVars = {};
      let presentKeys = newShapes3.map(s => s.OGid);
      let keys = Object.keys(context.solver.vars).filter(k => presentKeys.indexOf(k.slice(1)) > -1);
      keys.forEach(k => {
        newVars[k] = context.solver.vars[k];
      })
      context.solver.vars = newVars;


      context.setState({
        hiddenConstraints,
        constraints,
        shapes: newShapes3
      });
    }

    context.setState({transformOperation:''});
    // context.forceUpdate(); //TODO: Do I want to update here?
  },
}

export {transformTool}
