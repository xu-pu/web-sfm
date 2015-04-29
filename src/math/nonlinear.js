'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var laUtils = require('./la-utils.js'),
    sparse = require('./sparse-matrix'),
    SparseMatrix = sparse.SparseMatrix,
    SparseMatrixBuilder = sparse.SparseMatrixBuilder;

var DELTA = Math.pow(10, -6);

//==========================================


/**
 * Levenberg-Marqurdt Algorithm
 *
 * @param {function(Vector):Vector} func - f(vx) => vy
 * @param {Vector} x0 - start point x0[]
 * @param {Vector} target - target
 * @returns Vector
 */
exports.lma = function(func, x0, target){

    var MAX_STEPS = 200,
        DAMP_BASE = Math.pow(10, -3),
        ZERO_THRESHOLD = Math.pow(10, -30),
        DEFAULT_STEP_BASE = 2;

    //console.log('begin initializing');

    var    y0 = func(x0),
           xs = x0.elements.length,
           ys = y0.elements.length,
            p = x0.dup(),
            y = y0,
        sigma = target.subtract(y0);

    var J, A, g, N,
        damp, improvement, rho, dampStep,
        deltaX, newSigma, newX, newY, normBefore, normAfter,
        done = false,
        stepCounter = 0;

    var initError = sigma.modulus(), finalError = initError;

    //console.log('enter main lma loop with error ' + sigma.modulus());

    while (!done && stepCounter < MAX_STEPS) {

        stepCounter++;

        // refresh the equation
        J = exports.jacobian(func, p);
        A = J.transpose().x(J);
        g = J.transpose().x(sigma);

        if (stepCounter === 1) {
            // init round
            damp = DAMP_BASE*laUtils.matrixInfiniteNorm(A);
        }
        else {
            damp *= Math.max(1/3, 1-Math.pow(2*rho-1, 3));
        }

        dampStep = DEFAULT_STEP_BASE;
        improvement = 0;
        rho = 0;

        while( !done && improvement<=0 ) {

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
            normBefore = sigma.modulus();
            normAfter = newSigma.modulus();
            improvement = normBefore*normBefore - normAfter*normAfter;
            rho = improvement/(deltaX.x(damp).add(g).dot(deltaX));

            //console.log('new step calculated, new error ' + newSigma.modulus() + ', improved ' + improvement);

            if (improvement <= 0) {
                //console.log('no improvement, change damp and try again');
                damp *= dampStep;
                dampStep *= DEFAULT_STEP_BASE;
            }
            else {
                // the newX is accepted
                p = newX;
                y = newY;
                sigma = newSigma;
                finalError = sigma.modulus();
            }

        }

        if (laUtils.vectorInfiniteNorm(g) < ZERO_THRESHOLD) {
            //console.log('g too small, end lma');
            done = true;
        }

    }

    console.log('lam ended with ' + stepCounter + ' steps, error imporved from ' + initError + ' to ' + finalError);

    return p;

};


//========================================================


/**
 * Dense Jacobian Matrix
 * @param {function(Vector):Vector} func - f(vx) => vy
 * @param {Vector} x
 * @returns Matrix
 */
exports.jacobian = function(func, x){

    var y = func(x),
        xx = x.dup(),
        xs = x.elements.length,
        ys = y.elements.length,
        jacobian = Matrix.Zero(ys,xs),
        yNew, xi, yi;

    for (xi=0; xi<xs; xi++) {
        xx.elements[xi] = xx.elements[xi] + DELTA;
        yNew = func(xx);
        xx.elements[xi] = xx.elements[xi] - DELTA;
        for (yi=0; yi<ys; yi++) {
            jacobian.elements[yi][xi] = (yNew.elements[yi] - y.elements[yi]) / DELTA;
        }
    }

    return jacobian;

};


//========================================================


/**
 * Sparse Jacobian Matrix
 * @param {Function} func - Vector=>Vector
 * @param {Vector} x
 * @returns SparseMatrix
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