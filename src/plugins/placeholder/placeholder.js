import { createYedPlugin } from '../YedPlugin.js'
import { Plugin } from 'prosemirror-state'
import { DecorationSet, Decoration } from 'prosemirror-view'
import * as dom from 'lib0/dom.js'
import * as pair from 'lib0/pair.js'

const placeholderElement = dom.element('span', [pair.create('class', 'yed-placeholder')], [dom.text('Type here..')])

export const placeholderPlugin = createYedPlugin({
  plugins: [
    new Plugin({
      props: {
        decorations (state) {
          const doc = state.doc
          if (doc.content.size < 3) {
            return DecorationSet.create(doc, [Decoration.widget(1, placeholderElement)])
          }
        }
      }
    })
  ]
})