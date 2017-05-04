/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 Mickael Jeanroy
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';

const _ = require('lodash');
const MagicString = require('magic-string');
const diff = require('diff');
const prettier = require('prettier');

const NAME = 'rollup-plugin-prettier';

module.exports = (options = {}) => {
  let sourceMap;

  return {
    /**
     * Plugin name (used by rollup for error messages and warnings).
     * @type {string}
     */
    name: NAME,

    /**
     * Function called by `rollup` that is used to read the `sourceMap` setting.
     *
     * @param {Object} opts Rollup options.
     * @return {void}
     */
    options(opts = {}) {
      sourceMap = !!opts.sourceMap;
    },

    /**
     * Function called by `rollup` before generating final bundle.
     *
     * @param {string} source Souce code of the final bundle.
     * @return {Object} The result containing a `code` property and, if a enabled, a `map` property.
     */
    transformBundle(source) {
      const output = prettier.format(source, options);

      // No need to do more.
      if (!sourceMap) {
        return {code: output};
      }

      console.log(`[${NAME}] Source-map is enabled, computing diff is required`);
      console.log(`[${NAME}] This may take a moment (depends on the size of your bundle)`);

      const magicString = new MagicString(source);
      const changes = diff.diffChars(source, output);

      let idx = 0;

      _.forEach(changes, (part) => {
        if (part.added) {
          magicString.prependLeft(idx, part.value);
          idx -= part.count;
        } else if (part.removed) {
          magicString.remove(idx, idx + part.count);
        }

        idx += part.count;
      });

      return {
        code: magicString.toString(),
        map: magicString.generateMap({
          hires: true,
        }),
      };
    },
  };
};
