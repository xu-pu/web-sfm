var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    numeric = require('numeric'),
    sub = numeric.sub,
    dot = numeric.dot,
    transpose = numeric.transpose;

var cord = require('../utils/cord.js'),
    sparse = require('./../math/sparse-matrix'),
    nonlinear = require('./../math/nonlinear.js'),
    SparseMatrix = sparse.SparseMatrix,
    SparseMatrixBuilder = sparse.SparseMatrixBuilder,
    camUtils = require('./../math/projections.js'),
    geoUtils = require('./../math/geometry-utils.js'),
    laUtils = require('./../math/la-utils.js');

//var testUtils = require('../utils/test-utils.js');

var JACOBIAN_DELTA = Math.pow(10, -6);
var CAM_PARAMS = 11; // 3*r, 3*t, f,px,py, k1,k2
var POINT_PARAMS = 3;

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

    var projectionDict = _.mapObject(camsDict, function(val){
        return camUtils.params2P(val);
    });

    var visList = exports.getAffectedVisList(tracks, cams, points, varCamInd, varTrackInd);

    /** @type BundleMetadata */
    var metadata = {
        vislist: visList,
        varcams: varCamInd,
        vartracks: varTrackInd,
        xDict: xDict,
        pDict: projectionDict,
        pVisDict: exports.getPointVisDict(visList, varTrackInd)
    };


    var flattenCams = varCamInd.reduce(function(memo, camInd){
        return memo.concat(camUtils.flattenCameraParams(camsDict[camInd]));
    }, []);

    var flatten = varTrackInd.reduce(function(memo, pointInd){
        return memo.concat(cord.toInhomo3D(xDict[pointInd]).elements);
    }, flattenCams);

    var result = exports.sparseLMA(errorFunc, laUtils.toVector(flatten), Vector.Zero(visList.length), metadata);

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
 * @param {BundleMetadata} metadata
 * @returns {Vector}
 */
exports.sparseLMA = function(func, x0, target, metadata){

    var cams = metadata.varcams.length,
        points = metadata.vartracks.length;

    var MAX_STEPS = 20,
        DAMP_BASE = Math.pow(10, -3),
             ZERO = Math.pow(10, -30),
        STEP_BASE = 2;

    var     y0 = func(x0),
            xs = x0.elements.length,
            ys = y0.elements.length,
             p = x0.dup(),
             y = y0,
         sigma = target.subtract(y0),
        sigmaS = SparseMatrix.fromDenseVector(sigma.elements);

    var J, Jt, A, gS, g, N,
        deltaX, newSigma, newX, newY, normBefore, normAfter,
        improvement=0, rho=0, damp=0, dampStep = STEP_BASE,
        done = false,
        stepCounter = 0;

    //testUtils.promiseSaveSparse('/home/sheep/Code/sparse-graph.hessian.png', A);
    //testUtils.promiseSaveSparse('/home/sheep/Code/sparse-graph.jacobian.png', J);
    var initError = Math.pow(sigma.modulus(), 2), finalError = initError;

    //console.log('enter main lma loop with error ' + initError);

    while (!done && stepCounter < MAX_STEPS) {

        stepCounter++;

        // refresh the equation
         J = exports.sbaJacobian(func, p, metadata);
        Jt = J.transpose();
         A = Jt.x(J);
        gS = Jt.x(sigmaS);
         g = laUtils.toVector(gS);

        if (stepCounter === 1) {
            // init round
            damp = DAMP_BASE*laUtils.sparseInfiniteNorm(A);
        }
        else {
            damp *= Math.max(1/3, 1-Math.pow(2*rho-1, 3));
        }

        improvement = 0;
        rho = 0;
        dampStep = STEP_BASE;

        while( !done && improvement<=0 ) {

            // from p, try to find next step, if rejected, change damping and try again

            //console.log('try to find step ' + stepCounter + ' with damping ' + damp);

            N = A.add(SparseMatrix.I(xs).times(damp));
            deltaX = exports.solveHessian(N, g, cams, points);

            if (deltaX.modulus() < ZERO * p.modulus()) {
                // end if step is too small
                console.log('step too small, end lma');
                done = true;
                break;
            }

            newX = p.add(deltaX);
            newY = func(newX);
            newSigma = target.subtract(newY);

            normBefore = sigma.modulus();
            normAfter = newSigma.modulus();
            improvement = normBefore*normBefore - normAfter*normAfter;
            rho = improvement/(deltaX.x(damp).add(g).dot(deltaX));

            //console.log('new step calculated, new error ' + normAfter*normAfter + ', improved ' + improvement);

            if (improvement <= 0) {
                //console.log('no improvement, change damp and try again');
                damp *= dampStep;
                dampStep *= STEP_BASE;
            }
            else {
                // the newX is accepted
                p = newX;
                y = newY;
                sigma = newSigma;
                sigmaS = SparseMatrix.fromDenseVector(sigma.elements);
                finalError = Math.pow(sigma.modulus(), 2);
            }

        }

        if (laUtils.vectorInfiniteNorm(g) < ZERO) {
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

    if (cams===0 && points===0) {
        throw "No parameter";
    }

    if (cams===0) {
        var gS = SparseMatrix.fromDenseVector(g.elements);
        return laUtils.toVector(exports.inverseV(N, points).x(gS));
    }

    if (points===0) {
        return laUtils.toMatrix(N).inverse().x(g);
    }

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

/**
 *
 * @param {function} func
 * @param {Vector} p
 * @param {BundleMetadata} metadata
 * @returns {SparseMatrix}
 */
exports.sbaJacobian = function(func, p, metadata){

    var varCamInd = metadata.varcams,
        varPointInd = metadata.vartracks,
        vislist = metadata.vislist,
        xDict = metadata.xDict,
        pDict = metadata.pDict,
        pVisDict = metadata.pVisDict;

    var pArr = p.elements,
        y0 = func(p),
        y0Arr = y0.elements;

    var parsed = exports.spliteParams(pArr, varCamInd.length, varPointInd.length),
        parsedCams = parsed.cams,
        parsedPoints = parsed.points;

    var varProjectionDict = varCamInd.reduce(function(memo, camID, i){
            memo[camID] = camUtils.params2P(camUtils.inflateCameraParams(parsedCams[i]));
            return memo;
        }, {}),
        varPointDict = varPointInd.reduce(function(memo, trackID, i){
            memo[trackID] = laUtils.toVector(parsedPoints[i].concat([1]));
            return memo;
        }, {});


    /**
     *
     * @param {int} i
     * @reutrns {Matrix}
     */
    function getP(i){
        return varProjectionDict[i] || pDict[i];
    }

    /**
     *
     * @param {int} i
     * @returns {Vector}
     */
    function getX(i){
        return varPointDict[i] || xDict[i];
    }

    //=======================
    // Build Sparse Jacobian
    //=======================

    var builder = new SparseMatrixBuilder(y0Arr.length, pArr.length);

    varCamInd.forEach(function(camID, i){
        var params = parsedCams[i];
        _.range(POINT_PARAMS).forEach(function(offset){
            var paramIndex = CAM_PARAMS*i + offset;
            var paramArr = params.slice();
            paramArr[offset] += JACOBIAN_DELTA;
            var camparam = camUtils.inflateCameraParams(paramArr);
            var P = camUtils.params2P(camparam);

            vislist.forEach(function(entry, curY){

                var xi = entry.xi,
                    ci = entry.ci,
                    rc = entry.rc;

                if (ci !== camID) { return; }

                var X = getX(xi),
                    x = P.x(X),
                    dist = geoUtils.getDistanceRC(rc, cord.img2RC(x)),
                    yi = y0Arr[curY];

                builder.append(curY, paramIndex, (dist-yi)/JACOBIAN_DELTA);

            });

        });
    });

    varPointInd.forEach(function(trackID, i){
        var params = parsedPoints[i];
        var trackVis = pVisDict[trackID];
        _.range(POINT_PARAMS).forEach(function(offset){
            var paramIndex = CAM_PARAMS*varCamInd.length + POINT_PARAMS*i + offset;
            var paramArr = params.slice();
            paramArr[offset] += JACOBIAN_DELTA;
            var X = laUtils.toVector(paramArr.concat([1]));

            trackVis.forEach(function(curY){

                var entry = vislist[curY];

                var xi = entry.xi,
                    ci = entry.ci,
                    rc = entry.rc;

                if (xi !== trackID) { return; }

                var P = getP(ci),
                    x = P.x(X),
                    dist = geoUtils.getDistanceRC(rc, cord.img2RC(x)),
                    yi = y0Arr[curY];

                builder.append(curY, paramIndex, (dist-yi)/JACOBIAN_DELTA);

            });

        });
    });

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
 * @returns {VisView[]}
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
 *
 * @param {VisList} vislist
 * @param {int[]} points
 * @returns {Object}
 */
exports.getPointVisDict = function(vislist, points){
    return vislist.reduce(function(memo, entry, i){
        var xi = entry.xi;
        if (points.indexOf(xi) !== -1) {
            memo[xi].push(i);
        }
        return memo;
    }, points.reduce(function(memo, xi){
        memo[xi] = [];
        return memo;
    }, {}));
};


/**
 * Generate vislist including cameras and tracks affected by varCam and varTrack
 * @param {Track[]} tracks
 * @param {int[]} cams
 * @param {int[]} points
 * @param {int[]} varCamInd
 * @param {int[]} varTrackInd
 * @returns {VisList}
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