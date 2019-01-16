/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2017-2019 Mickael Jeanroy
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

const path = require('path');
const prettier = require('prettier');
const RollupPluginPrettier = require('../dist/rollup-plugin-prettier.js');
const verifyWarnLogsBecauseOfSourcemap = require('./utils/verify-warn-logs-because-of-source-map.js');
const verifyWarnLogsNotTriggered = require('./utils/verify-warn-logs-not-triggered.js');

describe('RollupPluginPrettier', () => {
  beforeEach(() => {
    spyOn(console, 'warn');
  });

  it('should create the plugin with a name', () => {
    const plugin = new RollupPluginPrettier();
    expect(plugin.name).toBe('rollup-plugin-prettier');
    expect(plugin.getSourcemap()).toBeNull();
  });

  it('should run esformatter without sourcemap by default', () => {
    const plugin = new RollupPluginPrettier();
    const code = 'var foo=0;var test="hello world";';
    const result = plugin.reformat(code);

    verifyWarnLogsNotTriggered();
    expect(result.map).not.toBeDefined();
    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should run prettier with sourcemap (lowercase)', () => {
    const plugin = new RollupPluginPrettier({sourcemap: true});
    const code = 'var foo=0;var test="hello world";';
    const result = plugin.reformat(code);

    expect(plugin.getSourcemap()).toBe(true);

    verifyWarnLogsBecauseOfSourcemap();
    expect(result.map).toBeDefined();
    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should run prettier with sourceMap (camelcase)', () => {
    const plugin = new RollupPluginPrettier({sourceMap: true});
    const code = 'var foo=0;var test="hello world";';
    const result = plugin.reformat(code);

    expect(plugin.getSourcemap()).toBe(true);

    verifyWarnLogsBecauseOfSourcemap();
    expect(result.map).toBeDefined();
    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should run prettier with sourcemap if it has been enabled', () => {
    const plugin = new RollupPluginPrettier();
    expect(plugin.getSourcemap()).toBeNull();

    // Enable sourcemap explicitely.
    plugin.enableSourcemap();

    const code = 'var foo=0;var test="hello world";';
    const result = plugin.reformat(code);

    expect(plugin.getSourcemap()).toBe(true);

    verifyWarnLogsBecauseOfSourcemap();
    expect(result.map).toBeDefined();
    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should run prettier with sourcemap enable in reformat', () => {
    const plugin = new RollupPluginPrettier({sourcemap: false});
    const code = 'var foo=0;var test="hello world";';
    const result = plugin.reformat(code, true);

    expect(plugin.getSourcemap()).toBe(false);

    verifyWarnLogsBecauseOfSourcemap();
    expect(result.map).toBeDefined();
    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should run prettier without sourcemap enable in reformat', () => {
    const plugin = new RollupPluginPrettier({sourcemap: true});
    const code = 'var foo=0;var test="hello world";';
    const result = plugin.reformat(code, false);

    expect(plugin.getSourcemap()).toBe(true);

    verifyWarnLogsNotTriggered();
    expect(result.map).not.toBeDefined();
    expect(result.code).toBe(
        'var foo = 0;\n' +
        'var test = "hello world";\n'
    );
  });

  it('should run prettier using config file from given current working directory', () => {
    const cwd = path.join(__dirname, 'fixtures');
    const options = {cwd};
    const plugin = new RollupPluginPrettier(options);

    spyOn(prettier, 'format').and.callThrough();

    const code = 'var foo = 0;';
    const result = plugin.reformat(code);

    expect(options).toEqual({cwd});
    expect(result.code).toBe('var foo = 0;\n');
    expect(prettier.format).toHaveBeenCalledWith(code, {
      parser: 'babylon',
      singleQuote: true,
      tabWidth: 2,
    });
  });
});