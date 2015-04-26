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
    nonlinear = require('./nonlinear.js'),
    SparseMatrix = sparse.SparseMatrix,
    SparseMatrixBuilder = sparse.SparseMatrixBuilder,
    camUtils = require('./projections.js'),
    geoUtils = require('./geometry-utils.js'),
    laUtils = require('./la-utils.js');

var CAM_PARAMS = 11; // 3*r, 3*t, f,px,py, k1,k2
var POINT_PARAMS = 3;
var ZERO_THRESHOLD = 0;
//var ZERO_THRESHOLD = Math.pow(10, -10);

//===================================================================

/**
 *
 * @param camsDict - camID=>CamParams
 * @param xDict - trackID=>Vector (Homogenous)
 * @param {Track[]} tracks
 * @param {int[]} varCamInd
 * @param {int[]} varTrackInd
 */
exports.sba = function(camsDict, xDict, tracks, varCamInd, varTrackInd){

    var cams = _.keys(camsDict).map(function(key){ return parseInt(key, 10); });
    var points = _.keys(xDict).map(function(key){ return parseInt(key, 10); });

    var visList = exports.getAffectedVisList(tracks, cams, points, varCamInd, varTrackInd);

    var projectionDict = _.mapObject(camsDict, function(val){
        return camUtils.params2P(val);
    });

    var flattenCams = varCamInd.reduce(function(memo, camInd){
        return memo.concat(camUtils.flattenCameraParams(camsDict[camInd]));
    }, []);

    var flatten = varTrackInd.reduce(function(memo, pointInd){
        return memo.concat(xDict[pointInd].elements);
    }, flattenCams);

    var result = exports.sparseLMA(errorFunc, laUtils.toVector(flatten), Vector.Zero(visList.length), varCamInd.length, varTrackInd.length);

    assignParams(result, camsDict, xDict);


    /**
     * Params => Error
     * @param {Vector} x
     * @returns Vector
     */
    function errorFunc(x){

        var varCamsDict = {},
            varPointsDict = {};

        assignParams(x, varCamsDict, varPointsDict);

        var varProjectionDict = _.mapObject(varCamsDict, function(val){
            return camUtils.params2P(val);
        });

        var yArr = visList.map(function(entry){
            var xi = entry.xi,
                ci = entry.ci,
                rc = entry.rc,
                P = varProjectionDict[ci] || projectionDict[ci],
                X = varPointsDict[xi] || xDict[xi],
                x = P.x(X);
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
    function assignParams(x, cDict, pDict){
        var flat = x.elements;
        var offset = 0;
        varCamInd.forEach(function(camInd){
            cDict[camInd] = camUtils.inflateCameraParams(flat.slice(offset, offset+CAM_PARAMS));
            offset += CAM_PARAMS;
        });
        varTrackInd.forEach(function(pointInd){
            pDict[pointInd] = laUtils.toVector(flat.slice(offset, offset+3).concat([1]));
            offset += 3;
        });
    }

};



/**
 * SBA Levenberg-Marqurdt Algorithm
 *
 * @param {function(Vector):Vector} func - f(vx) => vy
 * @param {Vector} x0 - start point x0[]
 * @param {Vector} target - target
 * @param {int} cams - amount of cameras
 * @param {int} points
 * @returns Vector
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
        sigmaSparse = SparseMatrix.fromDenseVector(sigma.elements),
        J = nonlinear.sparseJacobian(func, x0),
        Jtrans = J.transpose(),
        A = Jtrans.x(J),
        gSparse = Jtrans.x(sigmaSparse),
        g = laUtils.toVector(gSparse),
        damp = DAMP_BASE*laUtils.sparseInfiniteNorm(A);

    var N, deltaX, newSigma, newX, newY,
        improvement = 0,
        improvementRatio = 0,
        dampStep = DEFAULT_STEP_BASE,
        done = false,
        stepCounter = 0;


    var initError = sigma.modulus(), finalError = initError;

    console.log('enter main lma loop with error ' + sigma.modulus());

    while (!done && stepCounter < MAX_STEPS) {

        stepCounter++;

        while( !done && !(improvement>0) ) {

            // from p, try to find next step, if rejected, change damping and try again

            console.log('try to find step ' + stepCounter + ' with damping ' + damp);

            N = A.add(SparseMatrix.I(xs).times(damp));
            deltaX = exports.solveHessian(N, g, cams, points);
            //deltaX = N.inverse().x(g);

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

            console.log('new step calculated, new error ' + newSigma.modulus() + ', improved ' + improvement);

            if (improvement <= 0) {

                console.log('no improvement, change damp and try again');

                damp *= dampStep;
                dampStep *= DEFAULT_STEP_BASE;
            }

        }

        // the newX is accepted
        p = newX;
        y = func(p);
        sigma = target.subtract(y);
        sigmaSparse = SparseMatrix.fromDenseVector(sigma.elements);
        finalError = sigma.modulus();

        if (!done){

            //console.log('step accepted, refresh the equation');

            // refresh the equation
            J = nonlinear.sparseJacobian(func, p);
            Jtrans = J.transpose();
            A = Jtrans.x(J);
            gSparse = Jtrans.x(sigmaSparse);
            g = laUtils.toVector(gSparse);

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
// Sparse Matrix Utils
//===================================================================

/**
 *
 * @param {SparseMatrix} N
 * @param {Vector} g
 * @param {int} cams
 * @param {int} points
 * @returns Vector
 */
exports.solveHessian = function(N, g, cams, points){

    var gArr = g.elements,
        offset = cams*CAM_PARAMS,
        sigmaA = gArr.slice(0, offset),
        sigmaB = gArr.slice(offset),
        splited = N.split(offset, offset),
        U = splited.A.toDense(),
        V = splited.D,
        W = splited.B,
        transW = splited.C,
        invV = exports.inverseV(V, points);

    var param1 = sub(U, W.x(invV).x(transW).toDense()), // U - W * V-1 * Wt
        param2 = sub(sigmaA, dot(W.x(invV).toDense(), sigmaB)), // sigmaA - W * V-1 * sigmaB
        deltaA = dot(numeric.inv(param1), param2),
        sparseDeltaA = SparseMatrix.fromDenseVector(deltaA),
        sparseSigmaB = SparseMatrix.fromDenseVector(sigmaB),
        deltaB = invV.x(sparseSigmaB.subtract(transW.x(sparseDeltaA))).toDenseVector();

    return laUtils.toVector(deltaA.concat(deltaB));

};


/**
 * V is block diagnal
 * @param {SparseMatrix} V
 * @param {int} points
 * @returns SparseMatrix
 */
exports.inverseV = function(V, points){

    var builder = new SparseMatrixBuilder(V.rows, V.cols);

    var step=POINT_PARAMS-1, offset=0, cursor;
    for (cursor=0; cursor<points; cursor++) {
        (function(){
            var block = V.getBlock(offset, offset, offset+step, offset+step).toDense();
            var invBlock = numeric.inv(block);
            var r, c;
            for (c=0; c<POINT_PARAMS; c++) {
                for (r=0; r<POINT_PARAMS; r++) {
                    builder.append(r+offset, c+offset, invBlock[r][c]);
                }
            }
            offset += POINT_PARAMS;
        })();
    }

    return builder.evaluate();

};


//===================================================================
// View Geometry Utils
//===================================================================


/**
 *
 * @param {number[]} params
 * @param {int} cams
 * @param {int} [points]
 * @returns {{ cams: number[][], points: number[][] }}
 */
exports.spliteParams = function(params, cams, points){
    points = points||0;
    var offset = CAM_PARAMS*cams;
    var cs = _.range(cams).map(function(i){
        return params.slice(CAM_PARAMS*i, CAM_PARAMS*(i+1));
    });
    var ps = _.range(points).map(function(i){
        return params.slice(offset+POINT_PARAMS*i, offset+POINT_PARAMS*(i+1));
    });
    return { cams: cs, points: ps };
};


/**
 *
 * @param {Track[]} tracks
 * @param {int[]} visCamInds
 * @param {int[]} visTrackInds
 * @returns VisList
 */
exports.getVisList = function(tracks, visCamInds, visTrackInds){
    return visTrackInds.reduce(function(memo, trackID){
        var track = tracks[trackID];
        track.forEach(function(view){
            if (visCamInds.indexOf(view.cam) !== -1) {
                memo.push({ ci: view.cam, xi: trackID, rc: view.point });
            }
        });
        return memo;
    }, []);
};


/**
 * Generate vislist including cameras and tracks affected by varCam and varTrack
 * @param {Track[]} tracks
 * @param {int[]} cams
 * @param {int[]} points
 * @param {int[]} varCamInd
 * @param {int[]} varTrackInd
 * @returns VisList
 */
exports.getAffectedVisList = function(tracks, cams, points, varCamInd, varTrackInd){

    var affectedCamInd = varTrackInd.reduce(function(memo, trackInd){
            tracks[trackInd].forEach(function(view){
                var camInd = view.cam;
                if (memo.indexOf(camInd) === -1 && cams.indexOf(camInd) != -1) {
                    memo.push(camInd);
                }
            });
            return memo;
        }, varCamInd.slice()),

        affectedTrackInd = points.reduce(function(memo, trackInd){
            if (memo.indexOf(trackInd) === -1) {
                var isVisiable = tracks[trackInd].some(function(view){
                    return varCamInd.some(function(camInd){
                        return view.cam === camInd;
                    });
                });
                if (isVisiable) {
                    memo.push(trackInd);
                }
            }
            return memo;
        }, varTrackInd.slice());

    return exports.getVisList(tracks, affectedCamInd, affectedTrackInd);

};
