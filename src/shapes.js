import React from 'react';
import {Equal} from './constraints/constraints.js';
import {distanceSquared} from './utils.js';

class Shape {
  constructor() {
    this.OGid = '_' + Math.random().toString(36).substr(2, 9); //id
    this.selected = false;
    this.highlight = false;
    this.showConstraints = false;
    this.construction = false;
    this.hover = false;
  }

  selectBoolean(booleanValue) {
    this.selected = (booleanValue === undefined) ? !this.selected : booleanValue;
    this.pointList.forEach(p => {
      p.selectBoolean(this.selected);
    });

    return this.selected;
  }

  svgHighlight() {
    let pathData = this.getPathData();

    let style = {
          fill: "none",
          strokeWidth: "8px",
          stroke: "yellow",
          strokeLinejoin: "round",
          strokeLinecap: "round",
          opacity: ".9"
        }

    return <path d={pathData} style={style}/>
  }

  svgRender(key) { //render function
    let pathData = this.getPathData();

    let color = (this.selected) ? "red" : "black";
    let dashed = (this.construction) ? "4" : "none";

    let style = {
          fill: "none",
          strokeWidth: "3px",
          stroke: color,
          strokeLinejoin: "round",
          strokeLinecap: "round",
          strokeDasharray: dashed,
        }

    return (
      <g
        onMouseOver={() => this.hover = true} onMouseLeave={() => this.hover = false}
        key={key}>
        {this.highlight && this.svgHighlight()}
        <path

          d={pathData}
          style={style}
        />
      </g>
    )
  }
}

class Line extends Shape {
  constructor(p1, p2) {
    super();

    this.shape = 'line';
    this.pointList = [p1, p2];
  }

  getPathData() {
    return "M " + [this.pointList[0].point, this.pointList[1].point].map(p => `${p['x']} ${p['y']}`);
  }

  svgRender(key) { //render function
    let pathData = this.getPathData();

    let color = (this.selected) ? "red" : "black";
    let dashed = (this.construction) ? "4" : "none";

    let style = {
          fill: "none",
          strokeWidth: "3px",
          stroke: color,
          strokeLinejoin: "round",
          strokeLinecap: "round",
          strokeDasharray: dashed,
        }

    let selectedAtAll = this.selected || this.pointList[0].selected || this.pointList[1].selected

    let length = Math.sqrt(distanceSquared(this.pointList[0].point, this.pointList[1].point));

    return (
      <g
        onMouseOver={() => this.hover = true} onMouseOut={() => this.hover = false}
        key={key}>
        {this.highlight && this.svgHighlight()}
        <path

          d={pathData}
          style={style}
          id={`${key}`}/>
        {(selectedAtAll) ? <text dy={"-8"}><textPath href={`#${key}`} startOffset={"50%"}>{Math.round(length*100)/100}</textPath></text> : null}
      </g>
    )
  }

}

class Arc extends Shape {
  constructor(endPoint1, endPoint2, centerPoint, context) {
    super();

    this.shape = 'arc';
    this.pointList = [endPoint1, endPoint2, centerPoint];

    //add hidden constraint to set distance between center and endpoints equal
    let oldConstraints = context.state.hiddenConstraints;

    let l1 = new Line(endPoint1, centerPoint);
    let l2 = new Line(endPoint2, centerPoint);

    let c = new Equal(l1, l2);

    oldConstraints.push(c);
    context.setState({hiddenConstraints:oldConstraints});

  }

  getPathData() {
    let points = this.pointList;
    let start = points[0].point;
    let end = points[1].point;
    let center = points[2].point;

    let radius = Math.sqrt(distanceSquared(center, end));

    function  radian( ux, uy, vx, vy ) {
        var  dot = ux * vx + uy * vy;
        var  mod = Math.sqrt( ( ux * ux + uy * uy ) * ( vx * vx + vy * vy ) );
        var  rad = Math.acos( dot / mod );
        if( ux * vy - uy * vx < 0.0 ) {
            rad = -rad;
        }
        return rad;
    }

    function svgArcToCenterParam(x1, y1, rx, ry, phi, fA, fS, x2, y2) {
        var cx, cy, startAngle, deltaAngle, endAngle;
        var PIx2 = Math.PI * 2.0;

        if (rx < 0) {
            rx = -rx;
        }
        if (ry < 0) {
            ry = -ry;
        }

        var s_phi = Math.sin(phi);
        var c_phi = Math.cos(phi);
        var hd_x = (x1 - x2) / 2.0; // half diff of x
        var hd_y = (y1 - y2) / 2.0; // half diff of y
        var hs_x = (x1 + x2) / 2.0; // half sum of x
        var hs_y = (y1 + y2) / 2.0; // half sum of y

        // F6.5.1
        var x1_ = c_phi * hd_x + s_phi * hd_y;
        var y1_ = c_phi * hd_y - s_phi * hd_x;

        // F.6.6 Correction of out-of-range radii
        //   Step 3: Ensure radii are large enough
        var lambda = (x1_ * x1_) / (rx * rx) + (y1_ * y1_) / (ry * ry);
        if (lambda > 1) {
            rx = rx * Math.sqrt(lambda);
            ry = ry * Math.sqrt(lambda);
        }

        var rxry = rx * ry;
        var rxy1_ = rx * y1_;
        var ryx1_ = ry * x1_;
        var sum_of_sq = rxy1_ * rxy1_ + ryx1_ * ryx1_; // sum of square

        var coe = Math.sqrt(Math.abs((rxry * rxry - sum_of_sq) / sum_of_sq));
        if (fA === fS) { coe = -coe; }

        // F6.5.2
        var cx_ = coe * rxy1_ / ry;
        var cy_ = -coe * ryx1_ / rx;

        // F6.5.3
        cx = c_phi * cx_ - s_phi * cy_ + hs_x;
        cy = s_phi * cx_ + c_phi * cy_ + hs_y;

        var xcr1 = (x1_ - cx_) / rx;
        var xcr2 = (x1_ + cx_) / rx;
        var ycr1 = (y1_ - cy_) / ry;
        var ycr2 = (y1_ + cy_) / ry;

        // F6.5.5
        startAngle = radian(1.0, 0.0, xcr1, ycr1);

        // F6.5.6
        deltaAngle = radian(xcr1, ycr1, -xcr2, -ycr2);
        while (deltaAngle > PIx2) { deltaAngle -= PIx2; }
        while (deltaAngle < 0.0) { deltaAngle += PIx2; }
        if (fS === false || fS === 0) { deltaAngle -= PIx2; }
        endAngle = startAngle + deltaAngle;
        while (endAngle > PIx2) { endAngle -= PIx2; }
        while (endAngle < 0.0) { endAngle += PIx2; }

        var outputObj = { /* cx, cy, startAngle, deltaAngle */
            cx: cx,
            cy: cy,
            startAngle: startAngle,
            deltaAngle: deltaAngle,
            endAngle: endAngle,
            clockwise: (fS === true || fS === 1)
        }

        return outputObj;
    }

    var result10 = svgArcToCenterParam(start.x, start.y, radius, radius, 0, 1, 0, end.x, end.y);
    // var result01 = svgArcToCenterParam(start.x, start.y, radius, radius, 0, 0, 1, end.x, end.y);

    let supposedC10 = {x:result10.cx, y:result10.cy};

    let arcType = (distanceSquared(supposedC10, center) < 1) ? "0 1,0" : "0 0,0";

    return `M${start.x},${start.y} A${radius},${radius} ${arcType} ${end.x},${end.y}`
  }
}

class Point extends Shape {
  constructor(startingPoint, solver) {
    super();

    let initId = '_' + Math.random().toString(36).substr(2, 9); //id

    this.shape = 'point';
    this.point = startingPoint;
    this.pointList = [startingPoint];

    this.id = initId; //id

    this.coincident = false;
    this.OGid = initId;

    this.bezierPoint = false; //TODO: move control points of bezier point
    this.controlPoints = []; // is control point if isSelfControlPoint === false and is controlled point if isSelfControlPoint === true

    if (solver) { solver.addPoint(this.point, this.id) };

    // this.solver = solver; // is it faster to not store the point here but to look it up in the solver
  }

  overPoint(point) {
    if (distanceSquared(point, this.point) < 5) {
      return true;
    } else {
      return false;
    }
  }

  selectBoolean(booleanValue) {
    return this.selected = (booleanValue === undefined) ? !this.selected : booleanValue;
  }

  setPoint(newPoint) {
    this.point.x = newPoint.x;
    this.point.y = newPoint.y;
  }

  svgHighlight(key) {
    let style = {
          fill: "yellow",
          opacity: "0.9"
        }

    return <circle cx={this.point.x} cy={this.point.y} r="7" style={style}/>
  }

  getPathData() {return false} //this is for exporting svgs

  svgRender(key) { //render function
    let color = (this.selected) ? "red" : "black";

    // <circle cx={this.solver.vars[`x${this.id}`]} cy={this.solver.vars[`y${this.id}`]} r="5" fill={color}/>

    return (
      <g onMouseOver={() => this.hover = true} onMouseOut={() => this.hover = false} key={key}>
        {this.highlight && this.svgHighlight()}
        <circle cx={this.point.x} cy={this.point.y} r="5" fill={color}/>
      </g>
    )
  }
}

class ControlPoint extends Point {
  constructor(startingPoint, offset = {x:0, y:0}) {
    super(startingPoint); //optional offset is for initialization

    this.controlled = undefined;
    this.pair = undefined;
    this.joint = "symmetric";
    this.visible = false;
    this.offset = offset;

    //TODO: are these added to solver?
  }

  selectBoolean(booleanValue) {
    if(!this.visible){return};
    return this.selected = (booleanValue === undefined) ? !this.selected : booleanValue;
  }

  makePair(point) {
    this.pair = point;
    point.pair = this;
  }

  svgRender(key) { //render function
    let color = (this.selected) ? "red" : "blue";
    let pathData = "M " + [this.point, this.controlled.point].map(p => `${p['x']} ${p['y']}`);

    let style = {
          fill: "none",
          strokeWidth: "3px",
          stroke: "lightgrey",
          strokeLinejoin: "dashed",
          strokeLinecap: "round",
          strokeDasharray:"5,5",
        }

    return (
      this.visible && <g key={key}>
                        {this.highlight && this.svgHighlight()}
                        <path d={pathData} style={style}/>
                        <circle onMouseOver={() => this.hover = true} onMouseOut={() => this.hover = false} cx={this.point.x} cy={this.point.y} r="5" fill={color}/>
                      </g>
    )
  }
}

class Clone extends Point {
  constructor(startingPoint, progenitor, offset = {x:0, y:0}, angle = 0, signs = [1, 1]) {
    super(startingPoint);

    this.progenitor = progenitor;
    this.offset = offset; //TODO: adjust this value
    this.clone = true;
    this.angle = angle;
    this.scaleSigns = signs;
  }

  svgRender(key) { //render function
    let color = (this.selected) ? "red" : "green";

    // <circle cx={this.solver.vars[`x${this.id}`]} cy={this.solver.vars[`y${this.id}`]} r="5" fill={color}/>

    return (
      <g onMouseOver={() => this.hover = true} onMouseOut={() => this.hover = false} key={key}>
        {this.highlight && this.svgHighlight()}
        <circle cx={this.point.x} cy={this.point.y} r="5" fill={color}/>
      </g>
    )
  }
}

class Circle extends Shape {
  constructor(c, p1) {
    super();

    this.shape = "circle";
    this.pointList = [c, p1];
  }

  getPathData() {return false} //this is for exporting svgs

  radius() {
    return Math.sqrt(distanceSquared(this.pointList[0].point, this.pointList[1].point));
  }

  svgHighlight(key) { //render function
    let r = this.radius();

    let style = {
          fill: "none",
          strokeWidth: "8px",
          stroke: "yellow",
          strokeLinejoin: "round",
          strokeLinecap: "round",
          opacity: "0.9"
        }

    return <circle cx={this.pointList[0].point.x} cy={this.pointList[0].point.y} r={`${r}`} style={style}/>
  }

  svgRender(key) { //render function
    let color = (this.selected) ? "red" : "black";
    let dashed = (this.construction) ? "4" : "none";

    let r = this.radius();

    let style = {
          fill: "none",
          strokeWidth: "3px",
          stroke: color,
          strokeLinejoin: "round",
          strokeLinecap: "round",
          strokeDasharray: dashed,
        }

    return (
      <g key={key} onMouseOver={() => this.hover = true} onMouseOut={() => this.hover = false}>
        {this.highlight && this.svgHighlight()}
        <circle cx={this.pointList[0].point.x} cy={this.pointList[0].point.y} r={`${r}`} style={style}/>
      </g>
    )
  }
}

class Bezier extends Shape {
  constructor(p1, c1, c2, p2) {
    super();

    this.shape = 'bezier';
    this.pointList = [p1, c1, c2, p2];

    p1.bezierPoint = true;
    c1.bezierPoint = true;
    c2.bezierPoint = true;
    p2.bezierPoint = true;

    p1.controlPoints.push(c1);
    p2.controlPoints.push(c2);
    c1.controlled = p1;
    c2.controlled = p2;
  }

  extend(newPoint1, newPoint2, newPoint3) {
    let l = this.pointList.length
    let lastPoint = this.pointList[l-1];
    let lastControlPoint = this.pointList[l-2];

    // TODO: modify point properties here
    newPoint1.bezierPoint = true;
    newPoint2.bezierPoint = true;
    newPoint3.bezierPoint = true;

    newPoint1.isSelfControlPoint = true;
    newPoint2.isSelfControlPoint = true;

    lastPoint.controlPoints.push(newPoint1);
    newPoint3.controlPoints.push(newPoint2);
    newPoint1.controlled = lastPoint;
    newPoint2.controlled = newPoint3;

    // pairs to control points
    newPoint1.makePair(lastControlPoint);

    //why did this work when push was above the TODO comment?
    this.pointList.push(newPoint1);
    this.pointList.push(newPoint2);
    this.pointList.push(newPoint3);
  }

  getPathData() {
    let ps = this.pointList;
    let l = ps.length-1;
    let d = "M ";

    for (let i=0; i <= l; i+=3){
      if (i === 0){
        d += `${ps[i].point.x} ${ps[i].point.y}`
      } else {
        d += ` C ${ps[i-2].point.x} ${ps[i-2].point.y},${ps[i-1].point.x} ${ps[i-1].point.y},${ps[i].point.x} ${ps[i].point.y}`
      }
    }

  return d;
  }

}

export {Point, Line, Bezier, ControlPoint, Arc, Clone, Circle};
