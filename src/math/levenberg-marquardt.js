'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var getJacobian = require('./jacobian.js'),
    laUtils = require('../math/la-utils.js'),
    sparse = require('../math/sparse-matrix.js'),
    SparseMatrix = sparse.SparseMatrix;

//==========================================


/**
 * Levenberg-Marqurdt Algorithm
 *
 * @param {function(Vector):Vector} func - f(vx) => vy
 * @param {Vector} x0 - start point x0[]
 * @param {Vector} target - target
 * @return {Vector}
 */
module.exports = function(func, x0, target){

    var MAX_STEPS = 100,
        DAMP_BASE = Math.pow(10, -3),
        ZERO_THRESHOLD = Math.pow(10, -15),
        DEFAULT_STEP_BASE = 2;

    var y0 = func(x0),
        xs = x0.elements.length,
        ys = y0.elements.length;

    var     p = x0.dup(),
            y = y0,
        sigma = target.subtract(y0),
            J = getJacobian(func, x0),
            A = J.transpose().x(J),
            g = J.transpose().x(sigma),
         damp = DAMP_BASE*laUtils.matrixInfiniteNorm(A);

    var N, deltaX, newSigma, newX, newY,
             improvement = 0,
        improvementRatio = 0,
                dampStep = DEFAULT_STEP_BASE,
                    done = false,
             stepCounter = 0;

    while (!done && stepCounter < MAX_STEPS) {

        stepCounter++;

        while( !done && !(improvementRatio>0) ) {

            // from p, try to find next step, if rejected, change damping and try again

            N = A.add(Matrix.I(xs).x(damp));

            deltaX = solveEquationSet(N, g);

            if (deltaX.modulus() < ZERO_THRESHOLD* p.modulus()) {
                // end if step is too small
                done = true;
                break;
            }

            newX = p.add(deltaX);
            newY = func(newX);
            newSigma = target.subtract(y);

            improvement = sigma.modulus()-newSigma.modulus();
            improvementRatio = improvement/(deltaX.x(damp).add(g).dot(deltaX));

            if (improvementRatio <= 0) {
                // accept the step, refresh the equation
                damp *= dampStep;
                dampStep *= DEFAULT_STEP_BASE;
            }

        }

        // the newX is accepted
        p = newX;
        y = func(p);
        sigma = target.subtract(y);

        if (!done){

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
            done = true;
        }

    }

    return p;

};


/**
 *
 * @param {Matrix|SparseMatrix} N
 * @param {Vector} g
 * @returns Vector
 */
function solveEquationSet(N, g){
    if (N.isSparse) {

    }
    else {
        return N.inverse().x(g);
    }
}
