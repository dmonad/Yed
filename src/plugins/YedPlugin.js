import { PluginSpec, Transaction } from 'prosemirror-state'
import { Node } from 'prosemirror-model'
import { NodeView, EditorView } from 'prosemirror-view'

/**
 * @callback CreateNodeViewFunction
 * @param {Node} node
 * @param {EditorView} view
 * @param {boolean|function():number} getPos
 */

/**
 * @typedef {object} YedPluginOptions
 * @property {Object<string,CreateNodeViewFunction>} [YedPluginOptions.nodeViews]
 * @property {Array<PluginSpec>} [YedPluginOptions.plugins]
 * @property {function(Transaction, EditorView)|null} [YedPluginOptions.trTransformer]
 */

export class YedPlugin {
  /**
   * @param {YedPluginOptions} opts
   */
  constructor ({ nodeViews = {}, plugins = [], trTransformer = null }) {
    this.nodeViews = nodeViews
    this.plugins = plugins
    this.trTransformer = trTransformer
  }
}

/**
 * @param {YedPluginOptions} opts
 * @return {YedPlugin}
 */
export const createYedPlugin = opts => new YedPlugin(opts)
