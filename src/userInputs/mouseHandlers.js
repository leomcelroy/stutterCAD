import {bezierTool} from '../tools/bezier.js';
import {polylineTool} from '../tools/polyline.js';
import {arcTool} from '../tools/arc.js';
import {selectTool} from '../tools/select.js';
import {pointTool} from '../tools/point.js';
import {rectangleTool} from '../tools/rectangle.js';
import {transformTool} from '../tools/transform.js';
import {circleTool} from '../tools/circle.js';

const TOOLS = {
  SELECT: selectTool,
  POINT: pointTool,
  BEZIER: bezierTool,
  ARC: arcTool,
  POLYLINE: polylineTool,
  RECTANGLE: rectangleTool,
  TRANSFORM: transformTool,
  CIRCLE: circleTool,
}


function handleMouseDown(mouseEvent, context) {
  let d = new Date();

  context.setState({
    mousedown: true,
    lastClick: d.getTime(),
  });

  if (mouseEvent.button !== 0) { //only handle left-clicks
    return;
  }

  let tool = context.state.tool;
  if (Object.keys(TOOLS).indexOf(tool) !== -1) {
    TOOLS[tool].down(context);
  }
}

function handleMouseMove(mouseEvent, context) {
  let tool = context.state.tool;

  if (Object.keys(TOOLS).indexOf(tool) !== -1) {
    TOOLS[tool].move(context);
  }
}

function handleMouseUp(mouseEvent, context) {
  // TODO: figure out a better way to do this or update that hover length accordingly, this is a hack
  let shapes = context.state.shapes;
  let hovered = document.querySelectorAll( ":hover" );
  if (hovered.length <= 10 || context.state.tool !== "SELECT" && shapes.filter(s => s.hover).length > 1) {
    let newShapes = shapes.map(s => {
      s.hover = false;
      return s;
    });

    context.setState({shapes:newShapes});
  }

  context.setState({
    mousedown: false,
    dragging: false,
  })

  let tool = context.state.tool;
  if (Object.keys(TOOLS).indexOf(tool) !== -1) {
    TOOLS[tool].up(context);
  }
}

export {handleMouseDown, handleMouseMove, handleMouseUp}
