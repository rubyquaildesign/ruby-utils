"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var d3 = require("d3");
var lodash_1 = require("lodash");
var bSpline_1 = require("./bSpline");
var MyPolygon_1 = require("./MyPolygon");
function sqr(x) {
    return x * x;
}
function dist2(v, w) {
    return sqr(v[0] - w[0]) + sqr(v[1] - w[1]);
}
function distToSegmentSquared(p, v, w) {
    var l2 = dist2(v, w);
    if (l2 === 0)
        return dist2(p, v);
    var t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
    t = Math.max(0, Math.min(1, t));
    return dist2(p, [v[0] + t * (w[0] - v[0]), v[1] + t * (w[1] - v[1])]);
}
/**
 * Returns Distance betweeen a point and a line
 *
 * @param {[Number,Number]} origin Point
 * @param {[Number,Number]} first line vertice
 * @param {[Number,Number]} second line vertice
 * @returns {Number} Distance
 */
function distToSegment(p, v, w) {
    return Math.sqrt(distToSegmentSquared(p, v, w));
}
exports.distToSegment = distToSegment;
/**
 * Returns the minimum distance between the centroid of a polygon and an edge
 *
 * @param {[Number, Number][]} poly polygon
 *
 */
function getMinDist(poly) {
    var c = d3.polygonCentroid(poly);
    var r = lodash_1.default.range(poly.length).map(function (i) {
        var thisP = poly[i];
        var nextP = poly[(i + 1) % poly.length];
        return distToSegment(c, thisP, nextP);
    });
    return Math.min.apply(Math, r);
}
exports.getMinDist = getMinDist;
function smoothBSpline(polygon, order, resolution) {
    var output = [];
    var polygonAdjusted = polygon.concat(polygon.slice(0, Math.min(order, polygon.length - 1)));
    for (var t = 0; t < 1; t += 1 / resolution) {
        output.push(bSpline_1.default(t, Math.min(order, polygon.length - 1), polygonAdjusted));
    }
    return output;
}
exports.smoothBSpline = smoothBSpline;
function smoothPolygon(polygon, order, resolution) {
    if (lodash_1.default.isArray(polygon[0])) {
        return smoothBSpline(polygon, order, resolution);
    }
    else if (polygon.isComplex) {
        var outPoly = new MyPolygon_1.default();
        outPoly.polygon = smoothBSpline(polygon.polygon, order, resolution);
        outPoly.contours = polygon.contours.map(function (ctr) {
            return smoothBSpline(ctr, order, resolution);
        });
        return outPoly;
    }
    else {
        throw new Error('wat');
    }
}
exports.smoothPolygon = smoothPolygon;
