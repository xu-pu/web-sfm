//=================================================
// Declare Types
//=================================================


/**
 * @typedef {{ R: Matrix, t: Vector, focal: number, P: Matrix, height: number, width: number }} CalibratedCamera
 */


/**
 * @typedef {number[][]} PatchSample
 */


/**
 * @typedef {{R: number[][], t: number[], focal: number}} BundlerCamera
 */


/**
 * @typedef {{row: number, col: number}} RowCol
 */


/**
 * @typedef {{x: number, y: number}} XY
 */


/**
 * @typedef {Vector} HomoPoint3D
 */


/**
 * @typedef {Vector} HomoPoint2D
 */


/**
 * @typedef {number[]} EulerAngles
 */


/**
 * @typedef {{ features1: Feature[], features2: Feature[], cam2: Camera, cam2: Camera }} TwoViewMetadata
 */


/**
 * @typedef {{ x1: Vector, x2: Vector }} PointMatch
 */


/**
 * @typedef {{ height: number, width: number }} Camera
 */


//=================================================
// SIFT related types
//=================================================


/**
 * @typedef {{row: number, col: number, vector: number[]}} Feature
 */


/**
 * @typedef {{img, sigma: number}} DoG
 */


/**
 * @typedef {{img, sigma: number}} Scale
 */


/**
 * @typedef {{ row: number, col: number, layer: number, value: number }} Subpixel
 */