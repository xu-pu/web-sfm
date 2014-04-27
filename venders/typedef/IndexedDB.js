/*
interface IDBCursor {
    readonly    attribute (IDBObjectStore or IDBIndex) source;
    readonly    attribute IDBCursorDirection           direction;
    readonly    attribute any                          key;
    readonly    attribute any                          primaryKey;
    IDBRequest update (any value);
    void       advance ([EnforceRange] unsigned long count);
    void       continue (optional any key);
    IDBRequest delete ();
};
*/

IDBCursor = function () {};

/**
 * @type {IDBObjectStore|IDBIndex}
 */
IDBCursor.prototype.source = null;

/**
 * @type {string}
 */
IDBCursor.prototype.direction = '';

/**
 * @type {*}
 */
IDBCursor.prototype.key = '';

/**
 * @type {*}
 */
IDBCursor.prototype.primaryKey = '';

/**
 * @param {*} value
 * @returns {IDBRequest}
 */
IDBCursor.prototype.update = function (value) {
  return new IDBRequest();
};

/**
 * @param {number} count
 * @returns {void}
 */
IDBCursor.prototype.advance = function (count) {};

/**
 * @param {*} [key]
 * @returns {void}
 */
IDBCursor.prototype.continue = function (key) {};

/**
 * @returns {IDBRequest}
 */
IDBCursor.prototype.delete = function () {
  return new IDBRequest();
};
/*
interface IDBDatabase : EventTarget {
    readonly        attribute DOMString          name;
    readonly        attribute unsigned long long version;
    readonly        attribute DOMStringList      objectStoreNames;
    IDBObjectStore  createObjectStore (DOMString name, optional IDBObjectStoreParameters optionalParameters);
    void            deleteObjectStore (DOMString name);
    IDBTransaction  transaction ((DOMString or sequence<DOMString>) storeNames, optional IDBTransactionMode mode = "readonly");
    void            close ();
                    attribute EventHandler       onabort;
                    attribute EventHandler       onerror;
                    attribute EventHandler       onversionchange;
};
*/

IDBDatabase = function () {};
IDBDatabase.prototype = new EventTarget();

/**
 * @type {string}
 */
IDBDatabase.prototype.name = "";

/**
 * @type {number}
 */
IDBDatabase.prototype.version = 0;

/**
 * @type {DOMStringList}
 */
IDBDatabase.prototype.objectStoreNames = new DOMStringList();

/**
 * @param {string} name
 * @param {object} [optionalParameters]
 * @param {string|Array} [optionalParameters.keyPath=null]
 * @param {boolean} [optionalParameters.autoIncrement=false]
 * @returns {IDBObjectStore}
 */
IDBDatabase.prototype.createObjectStore = function (name, optionalParameters) {
  return new IDBObjectStore();
};

/**
 * @param name
 * @returns {void}
 */
IDBDatabase.prototype.deleteObjectStore = function (name) {};

/**
 * @param {string|Array} storeNames
 * @param {string} [mode='readonly']
 * @return {IDBTransaction}
 */
IDBDatabase.prototype.transaction = function (storeNames, mode) {
  return new IDBTransaction();
};

/**
 * @returns {void}
 */
IDBDatabase.prototype.close = function () {};

/**
 * @type {Function(Event)}
 */
IDBDatabase.prototype..onabort = null;

/**
 * @type {Function(Event)}
 */
IDBDatabase.prototype.onerror = null;

/**
 * @type {Function(Event)}
 */
IDBDatabase.prototype.onversionchange = null;
/*
[NoInterfaceObject]
interface IDBEnvironment {
    readonly    attribute IDBFactory indexedDB;
};
*/

indexedDB = new IDBFactory();
/*
interface IDBFactory {
    IDBOpenDBRequest open (DOMString name, [EnforceRange] optional unsigned long long version);
    IDBOpenDBRequest deleteDatabase (DOMString name);
    short            cmp (any first, any second);
};
*/

IDBFactory = function () {};

/**
 * @param {string} name
 * @param {number} [version]
 * @returns {IDBOpenDBRequest}
 */
IDBFactory.prototype.open = function (name, version) {
  return new IDBOpenDBRequest();
};

/**
 * @param {string} name
 * @returns {IDBOpenDBRequest}
 */
IDBFactory.prototype.deleteDatabase = function (name) {
  return new IDBOpenDBRequest();
};

/**
 * @param {*} first
 * @param {*} second
 * @returns {number}
 */
IDBFactory.prototype.cmp = function (first, second) {
  return 0;
};
/*
interface IDBIndex {
    readonly    attribute DOMString      name;
    readonly    attribute IDBObjectStore objectStore;
    readonly    attribute any            keyPath;
    readonly    attribute boolean        multiEntry;
    readonly    attribute boolean        unique;
    IDBRequest openCursor (optional any? range, optional IDBCursorDirection direction = "next");
    IDBRequest openKeyCursor (optional any? range, optional IDBCursorDirection direction = "next");
    IDBRequest get (any key);
    IDBRequest getKey (any key);
    IDBRequest count (optional any key);
};
*/

IDBIndex = function () {};

/**
 * @type {string}
 */
IDBIndex.prototype.name = '';

/**
 * @type {IDBObjectStore}
 */
IDBIndex.prototype.objectStore = new IDBObjectStore();

/**
 * @type {*}
 */
IDBIndex.prototype.keyPath = null;

/**
 * @type {boolean}
 */
IDBIndex.prototype.multiEntry = false;

/**
 * @type {boolean}
 */
IDBIndex.prototype.unique = false;

/**
 * @param {*} [range]
 * @param {string} [direction='next']
 * @returns {IDBRequest}
 */
IDBIndex.prototype.openCursor = function (range, direction) {
  return new IDBRequest();
};

/**
 * @param {*} [range]
 * @param {string} [direction='next']
 * @returns {IDBRequest}
 */
IDBIndex.prototype.openKeyCursor = function (range, direction) {
  return new IDBRequest();
};

/**
 * @param {*} key
 * @returns {IDBRequest}
 */
IDBIndex.prototype.get = function (key) {
  return new IDBRequest();
};

/**
 * @param {*} key
 * @returns {IDBRequest}
 */
IDBIndex.prototype.getKey = function (key) {
  return new IDBRequest();
};

/**
 * @param {*} key
 * @returns {IDBRequest}
 */
IDBIndex.prototype.count = function (key) {
  return new IDBRequest();
};
/*
interface IDBKeyRange {
    readonly    attribute any     lower;
    readonly    attribute any     upper;
    readonly    attribute boolean lowerOpen;
    readonly    attribute boolean upperOpen;
    static IDBKeyRange only (any value);
    static IDBKeyRange lowerBound (any lower, optional boolean open);
    static IDBKeyRange upperBound (any upper, optional boolean open);
    static IDBKeyRange bound (any lower, any upper, optional boolean lowerOpen, optional boolean upperOpen);
};
*/

(function(){

  IDBKeyRange = function () {};

  /**
   * @type {*}
   */
  IDBKeyRange.prototype.lower = null;

  /**
   * @type {*}
   */
  IDBKeyRange.prototype.upper = null;

  /**
   * @type {boolean}
   */
  IDBKeyRange.prototype.lowerOpen = false;

  /**
   * @type {boolean}
   */
  IDBKeyRange.prototype.upperOpen = false;

  /**
   * @param {*} value
   * @returns {IDBKeyRange}
   */
  IDBKeyRange.prototype.only = function (value) {
    return new IDBKeyRange();
  };

  /**
   * @param {*} lower
   * @param {boolean} [open]
   * @returns {IDBKeyRange}
   */
  IDBKeyRange.prototype.lowerBound = function (lower, open) {
    return new IDBKeyRange();
  };

  /**
   * @param {*} upper
   * @param {boolean} [open]
   * @returns {IDBKeyRange}
   */
  IDBKeyRange.prototype.upperBound = function (upper, open) {
    return new IDBKeyRange();
  };

  /**
   * @param {*} lower
   * @param {*} upper
   * @param {boolean} [lowerOpen]
   * @param {boolean} [upperOpen]
   * @returns {IDBKeyRange}
   */
  IDBKeyRange.prototype.bound = function (lower, upper, lowerOpen, upperOpen) {
    return new IDBKeyRange();
  };

  window.IDBKeyRange = new IDBKeyRange();

})();
/*
interface IDBObjectStore {
    readonly    attribute DOMString      name;
    readonly    attribute any            keyPath;
    readonly    attribute DOMStringList  indexNames;
    readonly    attribute IDBTransaction transaction;
    readonly    attribute boolean        autoIncrement;
    IDBRequest put (any value, optional any key);
    IDBRequest add (any value, optional any key);
    IDBRequest delete (any key);
    IDBRequest get (any key);
    IDBRequest clear ();
    IDBRequest openCursor (optional any? range, optional IDBCursorDirection direction = "next");
    IDBIndex   createIndex (DOMString name, (DOMString or sequence<DOMString>) keyPath, optional IDBIndexParameters optionalParameters);
    IDBIndex   index (DOMString name);
    void       deleteIndex (DOMString indexName);
    IDBRequest count (optional any key);
};
*/

IDBObjectStore = function () {};

/**
 * @type {string}
 */
IDBObjectStore.prototype.name = '';

/**
 * @type {*}
 */
IDBObjectStore.prototype.keyPath = null;

/**
 * @type {DOMStringList}
 */
IDBObjectStore.prototype.indexNames = new DOMStringList();

/**
 * @type {IDBTransaction}
 */
IDBObjectStore.prototype.transaction = new IDBTransaction();

/**
 * @type {boolean}
 */
IDBObjectStore.prototype.autoIncrement = false;

/**
 * @param {*} value
 * @param {*} [key]
 * @returns {IDBRequest}
 */
IDBObjectStore.prototype.put = function (value, key) {
  return new IDBRequest();
};

/**
 * @param {*} value
 * @param {*} [key]
 * @returns {IDBRequest}
 */
IDBObjectStore.prototype.add = function (value, key) {
  return new IDBRequest();
};

/**
 * @param {*} key
 * @returns {IDBRequest}
 */
IDBObjectStore.prototype.delete = function (key) {
  return new IDBRequest();
};

/**
 * @param {*} key
 * @returns {IDBRequest}
 */
IDBObjectStore.prototype.get = function (key) {
  return new IDBRequest();
};

/**
 * @returns {IDBRequest}
 */
IDBObjectStore.prototype.clear = function () {
  return new IDBRequest();
};

/**
 * @param {*} [range]
 * @param {string} [direction='next']
 * @returns {IDBRequest}
 */
IDBObjectStore.prototype.openCursor = function (range, direction) {
  return new IDBRequest();
};

/**
 * @param {string} name
 * @param {string|Array} keyPath
 * @param {object} [optionalParameters]
 * @param {boolean} [optionalParameters.unique=false]
 * @param {boolean} [optionalParameters.multiEntry=false]
 * @returns {IDBIndex}
 */
IDBObjectStore.prototype.createIndex = function (name, keyPath, optionalParameters) {
  return new IDBIndex();
};

/**
 * @param {string} name
 * @returns {IDBIndex}
 */
IDBObjectStore.prototype.index = function (name) {
  return new IDBIndex();
};

/**
 * @param {string} indexName
 * @returns {void}
 */
IDBObjectStore.prototype.deleteIndex = function (indexName) {};

/**
 * @param {*} [key]
 * @returns {IDBRequest}
 */
IDBObjectStore.prototype.count = function (key) {
  return new IDBRequest();
};
/*
interface IDBOpenDBRequest : IDBRequest {
                attribute EventHandler onblocked;
                attribute EventHandler onupgradeneeded;
};
*/

IDBOpenDBRequest = function () {};
IDBOpenDBRequest.prototype = new IDBRequest();

/**
 * @type {Function(Event)}
 */
IDBOpenDBRequest.prototype.onblocked = null;

/**
 * @type {Function(Event)}
 */
IDBOpenDBRequest.prototype.onupgradeneeded = null;
/*
interface IDBRequest : EventTarget {
    readonly    attribute any                                        result;
    readonly    attribute DOMError                                   error;
    readonly    attribute (IDBObjectStore or IDBIndex or IDBCursor)? source;
    readonly    attribute IDBTransaction                             transaction;
    readonly    attribute IDBRequestReadyState                       readyState;
                attribute EventHandler                               onsuccess;
                attribute EventHandler                               onerror;
};
*/

IDBRequest = function(){};
IDBRequest.prototype = new EventTarget();

/**
 * @type {*}
 */
IDBRequest.prototype.result = null;

/**
 * @type {DOMError}
 */
IDBRequest.prototype.error = new DOMError();

/**
 * @type {IDBObjectStore|IDBIndex|IDBCursor}
 */
IDBRequest.prototype.source = null;

/**
 * @type {IDBTransaction}
 */
IDBRequest.prototype.transaction = new IDBTransaction();

/**
 * @type {String}
 */
IDBRequest.prototype.readyState = '';

/**
 * @type {function(Event)}
 */
IDBRequest.prototype.onsuccess = null;

/**
 * @type {function(Event)}
 */
IDBRequest.prototype.onerror = null;
/*
interface IDBTransaction : EventTarget {
    readonly        attribute IDBTransactionMode mode;
    readonly        attribute IDBDatabase        db;
    readonly        attribute DOMError           error;
    IDBObjectStore  objectStore (DOMString name);
    void            abort ();
                    attribute EventHandler       onabort;
                    attribute EventHandler       oncomplete;
                    attribute EventHandler       onerror;
};
*/

IDBTransaction = function () {};
IDBTransaction.prototype = new EventTarget();

/**
 * @type {string}
 */
IDBTransaction.prototype.mode = '';

/**
 * @type {IDBDatabase}
 */
IDBTransaction.prototype.db = new IDBDatabase();

/**
 * @type {DOMError}
 */
IDBTransaction.prototype.error = new DOMError();

/**
 * @param {string} name
 * @returns {IDBObjectStore}
 */
IDBTransaction.prototype.objectStore = function (name) {
  return new IDBObjectStore();
};

/**
 * @returns {void}
 */
IDBTransaction.prototype.abort = function () {};

/**
 * @type {Function(Event)}
 */
IDBTransaction.prototype.abort.onabort = null;

/**
 * @type {Function(Event)}
 */
IDBTransaction.prototype.oncomplete = null;

/**
 * @type {Function(Event)}
 */
IDBTransaction.prototype.onerror = null;
/*
  These vendor prefixed references are not part of any specification, but
  exist just to avoid errors triggered by static analysis tools like JSHint.
 */

webkitIndexedDB = indexedDB;
webkitIDBKeyRange = IDBKeyRange;

mozIndexedDB = indexedDB;
mozIDBKeyRange = IDBKeyRange;
