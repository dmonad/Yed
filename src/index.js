import * as dom from 'lib0/dom.js'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Schema, Node, Mark } from 'prosemirror-model' // eslint-disable-line
import { schema } from './schema.js'
import { ySyncPlugin, yCursorPlugin, yUndoPlugin, undo, redo } from 'y-prosemirror'
import { keymap } from 'prosemirror-keymap'
import * as Y from 'yjs'
import { Awareness } from 'y-protocols/awareness.js'
import { keymaps } from './keymaps.js'
import { baseKeymap } from 'prosemirror-commands'
import { dropCursor } from 'prosemirror-dropcursor'
import { gapCursor } from 'prosemirror-gapcursor'
import { inputrules } from './inputrules.js'

export { undo, redo }

import { actions } from './actions.js'

/**
 * @typedef {object} YedPluginOptions
 * @property {Array<Node>} [YedPluginOptions.nodes]
 * @property {Array<Mark>} [YedPluginOptions.marks]
 */

class YedPlugin {
  constructor ({ marks = [], nodes = [] }) {
    this.nodes = nodes
    this.marks = marks
  }
}

/**
 * @typedef {object} YedOptions
 * @property {Y.XmlFragment} YedOptions.type
 * @property {Awareness} YedOptions.awareness
 * @property {Element} [YedOptions.container]
 * @property {Element} [YedOptions.toolbar]
 * @property {Array<YedPlugin>} [YedOptions.plugins]
 */

export class Yed {
  /**
   * @param {YedOptions} options
   */
  constructor ({ type, awareness, container = dom.element('div') , plugins = [], toolbar = dom.element('div') }) {
    const view = new EditorView(container, {
      attributes: {
        class: 'yed'
      },
      state: EditorState.create({
        schema,
        plugins: [
          ySyncPlugin(type),
          yCursorPlugin(awareness),
          yUndoPlugin(),
          keymap(keymaps),
          inputrules,
          keymap(baseKeymap),
          dropCursor(),
          gapCursor()
        ]
      })
    })
    toolbar.addEventListener('click', event => {
      if (event.target) {
        const actionName = /** @type {Element} */ (event.target).getAttribute('yed-action')
        const action = actions[actionName]
        if (action) {
          action(view.state, view.dispatch)
          view.focus()
        }
      }
    })
    /**
     * @type {Element}
     */
    this.container = container
    this.toolbar = toolbar
    this.view = view
  }
}
