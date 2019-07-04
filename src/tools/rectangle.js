import {Point, Line} from '../shapes.js';
import {Coincident, Vertical, Horizontal} from '../constraints/constraints.js';

const rectangleTool = {
  down: (context) => {
    let point = context.state.svgMouse;
    let oldShapes = context.state.shapes;
    let oldConstraints = context.state.constraints;

    let p1 = new Point({x:point.x, y:point.y}, context.solver);
    let p2 = new Point({x:point.x+2, y:point.y+2}, context.solver);
    let p3 = new Point({x:point.x+1, y:point.y+1}, context.solver);
    let p4 = new Point({x:point.x+1, y:point.y+1}, context.solver);
    let p5 = new Point({x:point.x+1, y:point.y+1}, context.solver);
    let p6 = new Point({x:point.x+1, y:point.y+1}, context.solver);
    let p7 = new Point({x:point.x+1, y:point.y+1}, context.solver);
    let p8 = new Point({x:point.x+1, y:point.y+1}, context.solver);
    let l1 = new Line(p1, p2);
    let l2 = new Line(p3, p4);
    let l3 = new Line(p5, p6);
    let l4 = new Line(p7, p8);

    oldShapes.push(p1);
    oldShapes.push(p2);
    oldShapes.push(p3);
    oldShapes.push(p4);
    oldShapes.push(p5);
    oldShapes.push(p6);
    oldShapes.push(p7);
    oldShapes.push(p8);
    oldShapes.push(l1);
    oldShapes.push(l2);
    oldShapes.push(l3);
    oldShapes.push(l4);

    let v1 = new Vertical(p1, p2);
    let v2 = new Vertical(p5, p6);
    let h1 = new Horizontal(p3, p4);
    let h2 = new Horizontal(p7, p8);
    let c1 = new Coincident(p2, p3);
    let c2 = new Coincident(p4, p5);
    let c3 = new Coincident(p6, p7);
    let c4 = new Coincident(p8, p1);

    oldConstraints.push(v1);
    oldConstraints.push(v2);
    oldConstraints.push(h1);
    oldConstraints.push(h2);
    oldConstraints.push(c1);
    oldConstraints.push(c2);
    oldConstraints.push(c3);
    oldConstraints.push(c4);

    context.setState({
      shapes: oldShapes,
      constraints: oldConstraints,
      isDrawing: true,
    });
  },

  move: (context) => {
    let point = context.state.svgMouse;

    if (context.state.isDrawing) {
      let points = context.state.shapes.filter(s => s.shape === "point");
      let l = points.length;
      let otherPoint = points[l-3];

      let xID = `x${otherPoint.id}`;
      let yID = `y${otherPoint.id}`;

      context.solver.vars[xID] = point.x;
      context.solver.vars[yID] = point.y;

      context.updatePoints();
    }
  },

  up: (context) => {
    context.setState({isDrawing:false});
  },
}

export {rectangleTool}
