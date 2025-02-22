/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 - present Instructure, Inc.
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

const react2dts = require('react-to-typescript-definitions')
const fs = require('fs').promises
const globby = require('globby')

async function run() {
  const paths = await globby(['**/src/*/index.js'])
  // ui-babel-preset defines its own babel plugins too
  // we should use the list from there if we dont move to typeScript
  const babelPlugins = ['optionalChaining', 'nullishCoalescingOperator']
  const tsDefinitions = paths.map((filePath) => {
    try {
      return react2dts.generateFromFile(null, filePath, {
        babylonPlugins: babelPlugins
      })
    } catch (e) {
      console.error(`Error compiling typeScript definitions for "${filePath}"`)
      throw e
    }
  })

  try {
    await fs.mkdir('./types')
  } catch (e) {
    if (e.code !== 'EEXIST') {
      throw e
    }
  }

  const joinedDefinitions = tsDefinitions
    .join('\n')
    // Get rid of all but the first import of React
    .replace(/(?!^)import \* as React from 'react';/g, '')
    // react2dts puts an default export on everything, remove it.
    .replace(/export default class/g, 'export class')

  await fs.writeFile(`./types/index.d.ts`, joinedDefinitions)
}

run()
