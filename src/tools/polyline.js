import {Point, Line} from '../shapes.js';
import {Coincident} from '../constraints/constraints.js';

const polylineTool = {
  down: (context) => {
    let point = context.state.svgMouse;
    let oldShapes = context.state.shapes;

    if (!context.state.isDrawing) {

      let newPoint1 = new Point({x:point.x, y:point.y}, context.solver);
      let newPoint2 = new Point({x:point.x, y:point.y}, context.solver);
      let line = new Line(newPoint1, newPoint2);

      oldShapes.push(line);
      oldShapes.push(newPoint1);
      oldShapes.push(newPoint2);

      context.setState({
        shapes: oldShapes,
        isDrawing: true,
        firstPoint: newPoint1,
      });
    } else { //TODO: add auto constraints (check!), auto closing (check!), and length display
      let lastPoint = oldShapes[oldShapes.length - 1];
      let firstPoint = context.state.firstPoint;

      let closed = Math.abs(firstPoint.point.x - lastPoint.point.x) < 10 && Math.abs(firstPoint.point.y - lastPoint.point.y) < 10;

      if (closed) {
        let oldConstraints = context.state.constraints;
        let newCoin = new Coincident(lastPoint, firstPoint);
        oldConstraints.push(newCoin);

        context.setState({
          isDrawing: false,
          constraints: oldConstraints,
        });

        context.updatePoints();
      } else {

        let newPoint1 = new Point({x:point.x, y:point.y}, context.solver);
        let newPoint2 = new Point({x:point.x, y:point.y}, context.solver);
        let line = new Line(newPoint1, newPoint2);

        oldShapes.push(line);
        oldShapes.push(newPoint1);
        oldShapes.push(newPoint2);

        let oldConstraints = context.state.constraints;
        let newCoin = new Coincident(newPoint1, lastPoint);
        oldConstraints.push(newCoin);

        context.setState({
          shapes: oldShapes,
          constraints: oldConstraints,
        });
      }
    }
  },

  move: (context) => {
    let point = context.state.svgMouse;

    if (context.state.isDrawing) {
      let lines = context.state.shapes.filter(s => s.shape === "line");
      let l = lines.length;
      let lastLine = lines[l-1];

      let xID = `x${lastLine.pointList[1].id}`;
      let yID = `y${lastLine.pointList[1].id}`;

      context.solver.vars[xID] = point.x;
      context.solver.vars[yID] = point.y;

      context.updatePoints();
    }
  },

  up: (context) => {},
}

export {polylineTool}
