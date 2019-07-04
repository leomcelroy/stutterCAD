import {Point, Arc} from '../shapes.js';

const arcTool = {
  down: (context) => {
    let point = context.state.svgMouse;
    let oldShapes = context.state.shapes;

    let e1 = new Point({x:point.x, y:point.y}, context.solver);
    let e2 = new Point({x:point.x+2, y:point.y+2}, context.solver);
    let c = new Point({x:point.x+1, y:point.y+1}, context.solver);
    let arc = new Arc(e1, e2, c, context); // needs context for setting hiddenConstraints

    oldShapes.push(e1);
    oldShapes.push(e2);
    oldShapes.push(c);
    oldShapes.push(arc);

    context.setState({
      shapes: oldShapes,
      isDrawing: true,
    });
  },

  move: (context) => {
    let point = context.state.svgMouse;

    if (context.state.isDrawing) {
      let arcs = context.state.shapes.filter(s => s.shape === "arc");
      let l = arcs.length;
      let lastArc = arcs[l-1];

      let Xe1 = lastArc.pointList[0].point.x;
      let Ye1 = lastArc.pointList[0].point.y;

      let xIDe2 = `x${lastArc.pointList[1].id}`;
      let yIDe2 = `y${lastArc.pointList[1].id}`;
      let xIDc = `x${lastArc.pointList[2].id}`;
      let yIDc = `y${lastArc.pointList[2].id}`;

      context.solver.vars[xIDe2] = point.x;
      context.solver.vars[yIDe2] = point.y;
      context.solver.vars[xIDc] = (point.x + Xe1)/2;
      context.solver.vars[yIDc] = (point.y + Ye1)/2;

      context.updatePoints();
    }
  },

  up: (context) => {
    context.setState({isDrawing:false});
  },
}

export {arcTool}
