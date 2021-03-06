/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
var CustomStackTrace = require('./classes/custom-stack-trace.js');

/**
 * A function which returns a closure which itself creates a JSON representation
 * of an array of callSites generated by an Error stack trace. Since many errors
 * may be created and only some requiring a string-ification of the entire
 * callsite list it advantageous from a performance perspective to evaluate
 * this string-ification when only actually necessary and not per error
 * generated. When calling the enclosing function an array of CallSites must
 * be supplied othwise an empty JSON array will be returned.
 * @function extractStructuredCallList
 * @param {Array<CallSite>} structuredStackTrace - an array of CallSite objects
 * @returns {Function} - a closure which produces a JSON representation of an
 *  array of CallSites
 */
function extractStructuredCallList(structuredStackTrace) {

  /**
   * A function which walks the structuredStackTrace variable of its parent
   * and produces a JSON representation of the array of CallSites.
   * @function
   * @inner
   * @returns {String} - A JSON representation of the array of CallSites
   */

  return function() {
    var structuredCallList = [];
    var index = 0;

    if (!Array.isArray(structuredStackTrace)) {

      return JSON.stringify(structuredCallList);
    }

    for (index; index < structuredStackTrace.length; index += 1) {

      structuredCallList.push({
        functionName : structuredStackTrace[index].getFunctionName(),
        methodName : structuredStackTrace[index].getMethodName(),
        fileName : structuredStackTrace[index].getFileName(),
        lineNumber : structuredStackTrace[index].getLineNumber(),
        columnNumber : structuredStackTrace[index].getColumnNumber()
      });
    }

    return JSON.stringify(structuredCallList);
  };
}

/**
 * A function which is built to override the Error.prepareStackTraceError
 * builtin formatter. This substitution produces a object with the last frames
 * file-path, line number and function name. Additionally a fourth property,
 * named stringifyStucturedCallList contains a function which can produce the
 * entirety of the stack trace in JSON form when called.
 * @function prepareStackTraceError
 * @param {Error} err - an instantiation of the Error class
 * @param {Array<CallSite>} structuredStackTrace - an array of CallSite objects
 * @returns {CustomStackTrace} - A custom stack trace instance
 */
function prepareStackTraceError(err, structuredStackTrace) {
  var returnObj = new CustomStackTrace();
  var topFrame = {};

  if (!Array.isArray(structuredStackTrace)) {

    return returnObj;
  }
  // Get the topframe of the CallSite array
  topFrame = structuredStackTrace[0];

  returnObj.setFilePath(topFrame.getFileName())
      .setLineNumber(topFrame.getLineNumber())
      .setFunctionName(topFrame.getFunctionName())
      .setStringifyStructuredCallList(
          extractStructuredCallList(structuredStackTrace));

  return returnObj;
}

module.exports = {
  extractStructuredCallList : extractStructuredCallList,
  prepareStackTraceError : prepareStackTraceError
};
