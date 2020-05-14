import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import globals from 'rollup-plugin-node-globals'
import { terser } from 'rollup-plugin-terser'

// If truthy, it expects all y-* dependencies in the upper directory.
// This is only necessary if you want to test and make changes to several repositories.
const localImports = process.env.LOCALIMPORTS

if (localImports) {
  console.info('Using local imports')
}

const customModules = new Set([
  'y-websocket',
  'y-prosemirror'
])

/**
 * @type {Set<any>}
 */
const customLibModules = new Set([
  'lib0',
  'y-protocols'
])

// @ts-ignore We use this for debugging
const debugResolve = {
  resolveId (importee) {
    if (localImports) {
      if (importee === 'yjs') {
        return `${process.cwd()}/../yjs/src/index.js`
      }
      if (importee === 'd-components') {
        return `${process.cwd()}/../${importee}/src/index.js`
      }
      if (customModules.has(importee.split('/')[0])) {
        return `${process.cwd()}/../${importee}/src/${importee}.js`
      }
      if (customLibModules.has(importee.split('/')[0])) {
        return `${process.cwd()}/../${importee}`
      }
    }
    return null
  }
}

const optBuildResolve = {
  resolveId (importee) {
    switch (importee) {
      case 'prosemirror-keymap':
      case 'prosemirror-commands':
      case 'prosemirror-dropcursor':
      case 'prosemirror-schema-list':
        return `${process.cwd()}/node_modules/${importee}/src/${importee.slice(12)}.js`
      case 'prosemirror-state':
      case 'prosemirror-view':
      case 'prosemirror-model':
      case 'prosemirror-inputrules':
      case 'prosemirror-gapcursor':
      case 'prosemirror-transform':
        return `${process.cwd()}/node_modules/${importee}/src/index.js`
      default:
        return null
    }
  }
}

const minificationPlugins = process.env.PRODUCTION ? [terser({
  module: true,
  compress: {
    hoist_vars: true,
    module: true,
    passes: 5,
    pure_getters: true,
    unsafe_comps: true,
    unsafe_undefined: true
  },
  mangle: {
    toplevel: true
  }
})] : []

const plugins = [
  debugResolve,
  // optBuildResolve,
  nodeResolve({
    mainFields: ['module', 'browser', 'main'],
    preferBuiltins: false
  }),
  commonjs(),
  globals(),
  ...minificationPlugins
]

export default [{
  input: './demo/demo.js',
  output: {
    dir: './demo/dist',
    format: 'esm',
    sourcemap: true,
    globals: {
      'crypto': 'null'
    }
  },
  plugins
}]
