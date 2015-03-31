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

/**
 *
 * @param {CameraParams[]} cams
 * @param {Vector[]} Xs
 * @param {{ rc: RowCol, cam: int, Xi: int }[]} visList -- should in order of X1inCam1 X1inCam2 ...
 */
exports.sba = function(cams, Xs, visList){

    var sizeList = ???;

    var MAX_STEPS = 200,
        DAMP_BASE = Math.pow(10, -3),
        ZERO_THRESHOLD = Math.pow(10, -30),
        DEFAULT_STEP_BASE = 2;

    var target = Vector.Zero(visList.length),
        x0 = Vector.create(flattenParams(cams, Xs)),
        y0 = func(x0),
        xs = x0.elements.length,
        ys = y0.elements.length;

    //console.log('begin initializing');

    var p = x0.dup(),
        y = y0,
        sigma = target.subtract(y0),
        J = exports.sparseJacobian(func, x0),
        transJ = J.transpose(),
        A = transJ.x(J),
        g = transJ.x(sigma),
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

            //deltaX = N.inverse().x(g);
            deltaX = exports.solveHessian(N, g, cams.length, sizeList);

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
            J = exports.sparseJacobian(func, p);
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


    /**
     * @param {Vector} x
     * @returns Vector
     */
    function func(x){
        var params = x.elements;
        var cursor = 0;
        var projections = cams.map(function(){
            cursor += CAM_PARAMS;
            return inflateCamera(params.slice(cursor-CAM_PARAMS, cursor))
        });
        var currentXs = Xs.map(function(){
            cursor += 3;
            return Vector.create(params.slice(cursor-3, cursor));
        });

        return Vector.create(
            visList.map(function(entry){
                var rc = entry.rc;
                var proj = projections[entry.cam];
                var X = currentXs[entry.Xi];
                var x = proj(X);
                return geoUtils.getDistanceRC(rc, cord.img2RC(x));
            }));
    }


    /**
     *
     * @param {CameraParams[]} cams
     * @param {Vector[]} points
     * @returns number[]
     */
    function flattenParams(cams, points){
        var c = cams.reduce(function(memo, cam){
            var r = cam.r, t = cam.t;
            return memo.concat(r.concat(t).concat([cam.f, cam.px, cam.py, cam.k1, cam.k2]));
        }, []);
        return points.reduce(function(memo, p){
            return memo.concat(p.elements);
        }, c);
    }


    function inflateCamera(params){
        var R = geoUtils.getRotationFromEuler(params[0], params[1], params[2]),
            t = Vector.create(params.slice(3, 6)),
            K = projection.getK(params[6],params[7],params[8]),
            k1 = params[9],
            k2 = params[10];
        return projection.getDistortedProjection(R, t, K, k1, k2);
    }

};


exports.sparseLMA = function(){

};


/**
 *
 * @param {Function} func - number[]=>number[]
 * @param {number[]} x
 * @returns SparseMatrixa
 */
exports.sparseJacobian = function(func, x){

    var y = func(x),
        xx = x.slice(),
        xs = x.length,
        ys = y.length;

    var builder = new SparseMatrixBuilder(ys, xs);

    var curY, curC, curR, curV;

    for (curC=0; curC<xs; curC++) {
        xx[curC] = xx[curC] + DELTA;
        curY = func(xx);
        xx[curC] = xx[curC] - DELTA;
        for (curR=0; curR<ys; curR++) {
            curV = (curY[curR] - y[curR]) / DELTA;
            if (curV !== 0) {
                builder.append(curR, curC, curV);
            }
        }
    }

    return builder.evaluate();

};


/**
 *
 * @param {SparseMatrix} H
 * @param {number[]} sigma
 * @param {int} cams
 * @param {int[]} sizes
 */
exports.solveHessian = function(H, sigma, cams, sizes){

    var offset = cams*CAM_PARAMS,
        sigmaA = sigma.slice(0, offset),
        sigmaB = sigma.slice(offset),
        splited = H.split(offset, offset),
        U = splited.A.toDense(),
        V = splited.C,
        W = splited.B,
        transW = splited.C,
        invV = exports.inverseV(V, sizes);

    var param1 = sub(U, W.x(invV).x(transW)), // U - W * V-1 * Wt
        param2 = sub(sigmaA, dot(W.x(invV).toDense(), sigmaB)), // sigmaA - W * V-1 * sigmaB
        deltaA = dot(numeric.inv(param1), param2),
        sparseDeltaA = SparseMatrix.fromDenseVector(deltaA),
        sparseSigmaB = SparseMatrix.fromDenseVector(sigmaB),
        deltaB = invV.x(sparseSigmaB.subtract(transW.x(sparseDeltaA))).toDense();

    return transpose(deltaA.concat(deltaB));

};


/**
 * V is block diagnal
 * @param {SparseMatrix} V
 * @param {int[]} sizes
 */
exports.inverseV = function(V, sizes){
    var builder = new SparseMatrixBuilder(V.rows, V.cols);
    var offset = 0;
    sizes.forEach(function(size){
        var block = V.getBlock(offset, offset, offset+size, offset+size).toDense();
        var invBlock = numeric.inv(block);
        var r, c;
        for (c=0; c<size; c++) {
            for (r=0; r<size; r++) {
                builder.append(r+offset, c+offset, invBlock[r][c]);
            }
        }
        offset += size;
    });
    return builder.evaluate();
};