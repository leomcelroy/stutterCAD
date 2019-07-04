import {ControlPoint, Point, Line, Arc, Bezier, Clone} from './shapes.js';
import {Solver} from './solver/solver.js';
import {copy} from './utils.js';

let INITIALSTATE = {
  shapes: [], //will be a list of shapes
  mousedown: false,
  svgMouse: undefined,
  dragging: false,
  workpieceSize: {x:750, y:750},
  pivot: undefined,
  firstPoint: undefined,
  pivotID: undefined,
  constraints: [],
  hiddenConstraints: [],
  tool:"SELECT",
  isDrawing: false,
  mouseOver: false,
  lastClick: 0,
  satisfied: [],
  selectionBox:{x:[0,0], y:[0,0]},
  clipboard: [],
  constraintsClipboard: [],
  newShapes: [], //for transformations
  newConstraints: [],
  transformOperation: '', //for transformations
};

function handleSave(context) { //downloads text file which can be uploaded to recreate drawing
  let filename = document.getElementById('name').value;
  if (filename === "") { filename = "noName"};
  filename = `${filename}.txt`;

  let state = context.state;
  let text = JSON.stringify(state);

  var pom = document.createElement('a');
  pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  pom.setAttribute('download', filename);

  if (document.createEvent) {
      var event = document.createEvent('MouseEvents');
      event.initEvent('click', true, true);
      pom.dispatchEvent(event);
  }
  else {
      pom.click();
  }
}

function handleUpload(context, e) {
  let files = e.target.files;
  let file = files[0];

  context.setState(INITIALSTATE);
  context.solver = new Solver();

  var reader = new FileReader();
  reader.onload = (event) => {
      let file2 = event.target.result;
      let json = JSON.parse(file2);
      let {shapes, constraints} = json;

      //TODO: figure out why this is neccesary, because I was pushing objects into alreadyCopied
      // shapes = shapes.filter(s => s.shape !== "point");
      // let nonFreePoints = shapes.map(shapes => shapes.pointList).reduce((a,b) => a.concat(b), [])
      // let freePoints = shapes.filter(s => s.shape === "point" && nonFreePoints.indexOf(s) === -1);
      // shapes = shapes.concat(freePoints);

      shapes.forEach(s => s.selected = true);
      constraints.forEach(c => {
        c.targets.forEach(t => t.selected = true);
      })

      context.setState({constraints});

      [shapes, constraints] = copy(context, {x:0, y:0}, false, shapes)
      context.setState({shapes, constraints});
      context.updatePoints();
  };

  reader.readAsText(file);
};

export {handleSave, handleUpload};
