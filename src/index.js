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

import * as object from 'lib0/object.js'

import { actions } from './actions.js'
import { YedPlugin, CreateNodeViewFunction } from './plugins/YedPlugin.js'
import { codeblockPlugin } from './plugins/codeblock/codeblock.js'
import { placeholderPlugin } from './plugins/placeholder/placeholder.js'
import { toolbarInlinePlugin } from './plugins/toolbar-inline/toolbar-inline.js'
import { toolbarBlockPlugin } from './plugins/toolbar-block/toolbar-block.js'
import { tablePlugin } from './plugins/table/table.js'

export { undo, redo }

/**
 * @typedef {object} YedOptions
 * @property {Y.XmlFragment} YedOptions.type
 * @property {Awareness} YedOptions.awareness
 * @property {Element} [YedOptions.container]
 * @property {HTMLElement} [YedOptions.toolbarInline]
 * @property {HTMLElement} [YedOptions.toolbarBlock]
 * @property {Array<YedPlugin>} [YedOptions.plugins]
 */

export class Yed {
  /**
   * @param {YedOptions} options
   */
  constructor ({ type, awareness, container = dom.element('div'), toolbarInline = dom.element('div'), toolbarBlock = dom.element('div') }) {
    const plugins = [
      ySyncPlugin(type),
      yCursorPlugin(awareness),
      yUndoPlugin(),
      keymap(keymaps),
      inputrules,
      keymap(baseKeymap),
      dropCursor(),
      gapCursor()
    ]
    /** 
     * @type {Object<string,CreateNodeViewFunction>}
     */
    const nodeViews = {}
    const defaultPlugins = [
      codeblockPlugin,
      // placeholderPlugin,
      toolbarInlinePlugin(toolbarInline),
      toolbarBlockPlugin(toolbarBlock),
      tablePlugin
    ]
    defaultPlugins.forEach(plug => {
      plug.plugins.forEach(pmPlug => plugins.push(pmPlug))
      object.forEach(plug.nodeViews, (createView, name) => {
        nodeViews[name] = createView
      })
    })
    const view = new EditorView(container, {
      attributes: {
        class: 'yed'
      },
      state: EditorState.create({
        schema,
        plugins
      }),
      nodeViews
    })
    document.body.addEventListener('mousedown', event => {
      let target = /** @type {Element | null} */ (event.target)
      while (target && target !== document.body) {
        if (target.nodeType === document.ELEMENT_NODE && target.classList.contains('yed-toolbar-inline')) {
          event.preventDefault()
          return
        }
        target = target.parentElement
      }
    })
    document.body.addEventListener('click', event => {
      if (event.target && /** @type {Element} */ (event.target).nodeType === document.ELEMENT_NODE) {
        const actionName = /** @type {Element} */ (event.target).getAttribute('yed-action')
        const action = actions[actionName]
        if (action) {
          view.focus()
          action.exec(view.state, view.dispatch)
          event.preventDefault()
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
