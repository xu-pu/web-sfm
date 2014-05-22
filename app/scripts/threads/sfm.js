'use strict';

// this is the main thread for the Structure from Motion logic
// this thread should only have one instance
// it creates new threads to do asynchronous computation tasks


// operation types
// query
// controll


/**
 * @typedef {{type: string, body: object}} SfmMsg
 */

/**
 * @typedef {{type: string, body: object}} QueryMsg
 */

/**
 * @typedef {{operation: string, body: object}} ControllMsg
 */
