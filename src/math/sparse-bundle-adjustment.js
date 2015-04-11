var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    numeric = require('numeric'),
    sub = numeric.sub,
    dot = numeric.dot,
    transpose = numeric.transpose;

var cord = require('../utils/cord.js'),
    sparse = require('./sparse-matrix'),
    SparseMatrix = sparse.SparseMatrix,
    SparseMatrixBuilder = sparse.SparseMatrixBuilder,
    projection = require('./projections.js'),
    geoUtils = require('./geometry-utils.js'),
    laUtils = require('./la-utils.js');

var DELTA = Math.pow(10, -6);
var ZERO_THRESHOLD = 0;
//var ZERO_THRESHOLD = Math.pow(10, -10);
var CAM_PARAMS = 11; // 3*r, 3*t, f,px,py, k1,k2

//===================================================================


/**
 *
 * @param {CameraParams} cam
 * @returns number[]
 */
exports.flattenCamera = function(cam){
    var r = cam.r, t = cam.t;
    return r.concat(t).concat([cam.f, cam.px, cam.py, cam.k1, cam.k2]);
};


/**
 * @param {number[]} params
 * @returns CameraParams
 */
exports.inflateCamera = function(params){
    return {
        r: params.slice(0,3),
        t: params.slice(3,6),
        f: params[6], px: params[7], py: params[8],
        k1: params[9], k2: params[10]
    };
};


/**
 *
 * @param {CameraParams} cam
 * @returns function
 */
exports.getProjection = function(cam){
    var r = cam.r,
        R = geoUtils.getRotationFromEuler(r[0], r[1], r[2]),
        t = laUtils.toVector(cam.t),
        K = projection.getK(cam.f, cam.px, cam.py);
    return projection.getDistortedProjection(R, t, K, cam.k1, cam.k2);
};

//===================================================================


/**
 *
 * @param camsDict - camID=>Cam
 * @param xDict - trackID=>Vector
 * @param {{ rc: RowCol, ci: int, xi: int }[]} visList -- should in order of X1inCam1 X1inCam2 ...
 * @param {int[]} varCamInd
 * @param {int[]} varPointInd
 */
exports.sba = function(camsDict, xDict, visList, varCamInd, varPointInd){

    var projectionDict = _.mapObject(camsDict, function(val, key){
        return exports.getProjection(val);
    });

    var flattenCams = varCamInd.reduce(function(memo, camInd){
        return memo.concat(exports.flattenCamera(camsDict[camInd]));
    }, []);
    var flatten = varPointInd.reduce(function(memo, pointInd){
        return memo.concat(xDict[pointInd].elements);
    }, flattenCams);

    var result = exports.sparseLMA(func, laUtils.toVector(flatten), Vector.Zero(visList.length), varCamInd.length, varPointInd.length);

    inflateParams(result, camsDict, xDict);


    /**
     * @param {Vector} x
     * @returns Vector
     */
    function func(x){
        var varCamsDict = {},
            varPointsDict = {};

        inflateParams(x, varCamsDict, varPointsDict);

        var varProjectionDict = _.mapObject(varCamsDict, function(val, key){
            return exports.getProjection(val);
        });

        var yArr = visList.map(function(entry){
            var xi = entry.xi, ci = entry.ci, rc = entry.rc;
            var proj = projectionDict[ci] || varProjectionDict[ci];
            var X = varPointsDict[xi] || xDict[xi];
            var x = proj(X);
            return geoUtils.getDistanceRC(rc, cord.img2RC(x));
        });

        return laUtils.toVector(yArr);

    }

    /**
     *
     * @param {Vector} x
     * @param cDict
     * @param pDict
     */
    function inflateParams(x, cDict, pDict){
        var flat = x.elements;
        var offset = 0;
        varCamInd.forEach(function(camInd){
            cDict[camInd] = exports.inflateCamera(flat.slice(offset, offset+CAM_PARAMS));
            offset += CAM_PARAMS;
        });
        varPointInd.forEach(function(pointInd){
            pDict[pointInd] = laUtils.toVector(flat.slice(offset, offset+3));
            offset += 3;
        });
    }

};


//===================================================================


/**
 * Sparse Levenberg-Marqurdt Algorithm, tylered to sba
 *
 * @param {function(Vector):Vector} func - f(vx) => vy
 * @param {Vector} x0 - start point x0[]
 * @param {Vector} target - target
 * @param {int} cams - amount of cameras
 * @param {int} points
 * @return {Vector}
 */
exports.sparseLMA = function(func, x0, target, cams, points){

    var MAX_STEPS = 200,
        DAMP_BASE = Math.pow(10, -3),
        ZERO_THRESHOLD = Math.pow(10, -30),
        DEFAULT_STEP_BASE = 2;

    var y0 = func(x0),
        xs = x0.elements.length,
        ys = y0.elements.length;

    //console.log('begin initializing');

    var p = x0.dup(),
        y = y0,
        sigma = target.subtract(y0),
        J = exports.sparseJacobian(func, x0),
        A = J.transpose().x(J),
        g = J.transpose().x(sigma),
        damp = DAMP_BASE*laUtils.matrixInfiniteNorm(A);

    var N, deltaX, newSigma, newX, newY,
        improvement = 0,
        improvementRatio = 0,
        dampStep = DEFAULT_STEP_BASE,
        done = false,
        stepCounter = 0;


    var initError = sigma.modulus(), finalError = initError;

    //console.log('enter main lma loop with error ' + sigma.modulus());

    while (!done && stepCounter < MAX_STEPS) {

        stepCounter++;

        while( !done && !(improvement>0) ) {

            // from p, try to find next step, if rejected, change damping and try again

            //console.log('try to find step ' + stepCounter + ' with damping ' + damp);

            N = A.add(Matrix.I(xs).x(damp));

            deltaX = N.inverse().x(g);

            if (deltaX.modulus() < ZERO_THRESHOLD * p.modulus()) {
                // end if step is too small
                console.log('step too small, end lma');
                done = true;
                break;
            }

            newX = p.add(deltaX);
            newY = func(newX);
            newSigma = target.subtract(newY);

            improvement = sigma.modulus()-newSigma.modulus();
            improvementRatio = improvement/(deltaX.x(damp).add(g).dot(deltaX));

            //console.log('new step calculated, new error ' + newSigma.modulus() + ', improved ' + improvement);

            if (improvement <= 0) {

                //console.log('no improvement, change damp and try again');

                damp *= dampStep;
                dampStep *= DEFAULT_STEP_BASE;
            }

        }

        // the newX is accepted
        p = newX;
        y = func(p);
        sigma = target.subtract(y);
        finalError = sigma.modulus();

        if (!done){

            //console.log('step accepted, refresh the equation');

            // refresh the equation
            J = getJacobian(func, p);
            A = J.transpose().x(J);
            g = J.transpose().x(sigma);

            // reset iteration variables
            damp *= Math.max(1/3, 1-Math.pow(2*improvementRatio-1, 3));
            dampStep = DEFAULT_STEP_BASE;
            improvement = 0;
            improvementRatio = 0;
        }

        if (laUtils.vectorInfiniteNorm(g) < ZERO_THRESHOLD) {

            //console.log('g too small, end lma');

            done = true;
        }

    }

    console.log('lam ended with ' + stepCounter + ' steps, error imporved from ' + initError + ' to ' + finalError);

    return p;

};


//===================================================================

/**
 *
 * @param {Function} func - number[]=>number[]
 * @param {Vector} x
 * @returns SparseMatrixa
 */
exports.sparseJacobian = function(func, x){

    var xx = x.dup(),
        y = func(x),
        xArr = x.elements,
        yArr = y.elements,
        xxArr = xx.elements,
        xs = xArr.length,
        ys = yArr.length;

    var builder = new SparseMatrixBuilder(ys, xs);

    var curY, curYArr, curC, curR, curV;

    for (curC=0; curC<xs; curC++) {
        xxArr[curC] = xxArr[curC] + DELTA;
        curY = func(xx);
        curYArr = curY.elements;
        xxArr[curC] = xxArr[curC] - DELTA;
        for (curR=0; curR<ys; curR++) {
            curV = (curYArr[curR] - yArr[curR]) / DELTA;
            if (curV !== 0) {
                builder.append(curR, curC, curV);
            }
        }
    }

    return builder.evaluate();

};


//===================================================================

/**
 *
 * @param {SparseMatrix} H
 * @param {number[]} sigma
 * @param {int} cams
 * @param {int} points
 * @returns Vector
 */
exports.solveHessian = function(H, sigma, cams, points){

    var offset = cams*CAM_PARAMS,
        sigmaA = sigma.slice(0, offset),
        sigmaB = sigma.slice(offset),
        splited = H.split(offset, offset),
        U = splited.A.toDense(),
        V = splited.C,
        W = splited.B,
        transW = splited.C,
        invV = exports.inverseV(V, points);

    var param1 = sub(U, W.x(invV).x(transW)), // U - W * V-1 * Wt
        param2 = sub(sigmaA, dot(W.x(invV).toDense(), sigmaB)), // sigmaA - W * V-1 * sigmaB
        deltaA = dot(numeric.inv(param1), param2),
        sparseDeltaA = SparseMatrix.fromDenseVector(deltaA),
        sparseSigmaB = SparseMatrix.fromDenseVector(sigmaB),
        deltaB = invV.x(sparseSigmaB.subtract(transW.x(sparseDeltaA))).toDense();

    return laUtils.toVector(deltaA.concat(deltaB));

};


//===================================================================

/**
 * V is block diagnal
 * @param {SparseMatrix} V
 * @param {int} points
 */
exports.inverseV = function(V, points){
    var builder = new SparseMatrixBuilder(V.rows, V.cols);
    var size = 3;
    var offset = 0, cursor;
    for (cursor=0; cursor<points; cursor++) {
        (function(){
            var block = V.getBlock(offset, offset, offset+size, offset+size).toDense();
            var invBlock = numeric.inv(block);
            var r, c;
            for (c=0; c<size; c++) {
                for (r=0; r<size; r++) {
                    builder.append(r+offset, c+offset, invBlock[r][c]);
                }
            }
            offset += size;
        })();
    }

    return builder.evaluate();
};