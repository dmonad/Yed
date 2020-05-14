/**
 * This Plugin computes and maintains meta information like "is editor content focused?".
 * It also polyfills some expected behavior. E.g. render a fake selection area if the editor lost focus but is considered focused (e.g. because a tooltip opened we don't want to loose the selection range).
 */

import { createYedPlugin } from '../YedPlugin.js'
import { Plugin, PluginKey } from 'prosemirror-state'
import { DecorationSet, Decoration } from 'prosemirror-view'
import { isEditorFocused, setMeta } from '../../lib.js'

export const fakeSelectionPluginKey = new PluginKey('fake-selection')

export const fakeSelectionPlugin = createYedPlugin({
  plugins: [
    new Plugin({
      key: fakeSelectionPluginKey,
      /**
       * If state is null, do not render fake selection.
       * If state is a selection object, render the selection as a fake selection.
       */
      state: {
        init: () => null,
        apply: (tr, val, prevState, newState) => {
          const renderFakeSelection = tr.getMeta(fakeSelectionPluginKey)
          return renderFakeSelection === null ? null : (renderFakeSelection || val)
        }
      },
      props: {
        decorations (state) {
          const fakeSelection = fakeSelectionPluginKey.getState(state)
          if (fakeSelection) {
            return DecorationSet.create(state.doc, [Decoration.inline(fakeSelection.from, fakeSelection.to, { class: 'yed-fake-selection' }, { inclusiveStart: false, inclusiveEnd: false })])
          }
        }
      }
    })
  ],
  trTransformer: (tr, view) => {
    // if view lost focus, although editor content is still in focus, then take
    // the old selection and render it as fake selection
    const state = view.state
    const isRendering = fakeSelectionPluginKey.getState(state)
    const editorfocused = isEditorFocused(view)
    const viewFocused = view.hasFocus()
    const sel = state.selection
    if (isRendering && viewFocused) {
      tr.setMeta(fakeSelectionPluginKey, null)
    } else if (!isRendering && !viewFocused && editorfocused && !sel.empty) {
      tr.setMeta(fakeSelectionPluginKey, sel)
    }
  }
})
