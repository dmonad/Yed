import { createYedPlugin, YedPlugin } from '../YedPlugin.js'
import { Plugin } from 'prosemirror-state'
import { DecorationSet, Decoration } from 'prosemirror-view'
import { p } from '../../schema.js'
import { updateToolbarActionButtonStates } from '../../actions.js'

/**
 * @param {HTMLElement} toolbarBlockElement
 * @return {YedPlugin}
 */
export const toolbarBlockPlugin = toolbarBlockElement => createYedPlugin({
  plugins: [
    new Plugin({
      props: {
        decorations (state) {
          const doc = state.doc
          const sel = state.selection
          const $to = sel.$to
          if (sel.empty && $to.parent.nodeSize === 2 && $to.parent.type === p) {
            updateToolbarActionButtonStates(toolbarBlockElement.shadowRoot, state)
            toolbarBlockElement.toggleAttribute('visible', true)
            return DecorationSet.create(doc, [Decoration.widget($to.pos, toolbarBlockElement, { side: 10, key: 'yed-toolbar-block', ignoreSelection: true })])
          } else {
            toolbarBlockElement.toggleAttribute('visible', false)
          }
        }
      }
    })
  ]
})
