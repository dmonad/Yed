import { createYedPlugin, YedPlugin } from '../YedPlugin.js'
import { Plugin } from 'prosemirror-state'
import { DecorationSet, Decoration } from 'prosemirror-view'
import { schema } from '../../schema.js'
import * as dom from 'lib0/dom.js'
import * as pair from 'lib0/pair.js'

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
          if (sel.empty && $to.parent.nodeSize === 2 && $to.parent.type === schema.nodes.paragraph) {
            setTimeout(() => {
              toolbarBlockElement.toggleAttribute('visible', true);
            }, 150)
            return DecorationSet.create(doc, [Decoration.widget($to.pos, toolbarBlockElement, { side: 10 })]) 
          } else {
            toolbarBlockElement.toggleAttribute('visible', false);
          }
        }
      }
    })
  ]
})