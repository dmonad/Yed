import { createYedPlugin, YedPlugin } from '../YedPlugin.js'
import { Plugin } from 'prosemirror-state'
import { DecorationSet, Decoration } from 'prosemirror-view'
import * as dom from 'lib0/dom.js'

/**
 * @param {Array<HTMLElement>} elems
 * @return {YedPlugin}
 */
export const hiddenWidgetsPlugin = elems => {
  const container = dom.element('div', [], elems)
  return createYedPlugin({
    plugins: [
      new Plugin({
        props: {
          decorations (state) {
            return DecorationSet.create(state.doc, [Decoration.widget(0, container, { side: 99 })])
          }
        }
      })
    ]
  })
}
