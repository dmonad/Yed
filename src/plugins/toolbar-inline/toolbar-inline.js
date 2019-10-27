import { createYedPlugin } from '../YedPlugin.js'
import { actions } from '../../actions.js'
import { Plugin, PluginKey } from 'prosemirror-state'
import { DecorationSet, Decoration, EditorView } from 'prosemirror-view'
import * as dom from 'lib0/dom.js'
import * as pair from 'lib0/pair.js'
import * as object from 'lib0/object.js'
import * as math from 'lib0/math.js'

export const toolbarInlinePluginKey = new PluginKey('toolbar-inline')

/**
 * @return {ClientRect | null}
 */
const getSelectionRect = () => {
  const sel = getSelection()
  const range = sel && sel.getRangeAt(0)
  return range ? range.getBoundingClientRect() : null
}

/**
 * @param {Element} toolbarInline
 */
export const toolbarInlinePlugin = toolbarInline => createYedPlugin({
  plugins: [
    new Plugin({
      key: toolbarInlinePluginKey,
      state: {
        init: () => ({ isVisible: false }),
        apply: (tr, val, prevState, newState) => {
          const changeState = tr.getMeta(toolbarInlinePluginKey)
          const isVisible = (changeState && changeState.isVisible && !!changeState.rpos) || (val.isVisible && !newState.selection.empty)
          const rpos = isVisible ? ((changeState && changeState.rpos) || val.rpos) : null
          return { isVisible, rpos }
        }
      },
      view: _ => ({
        update: (view, prevState) => {
          const toolbarRelativePos = toolbarInlinePluginKey.getState(view.state).rpos 
          const show = !!toolbarRelativePos && view.hasFocus()
          toolbarInline.toggleAttribute('show', show)
          if (show) {
            const selection = getSelection()
            const focusNode = selection && selection.focusNode
            const rect = getSelectionRect()
            if (focusNode && rect) {
              let focusElement = /** @type {Element} */ (focusNode)
              while (focusElement.parentElement && focusElement.nodeType !== document.ELEMENT_NODE && focusElement.nodeName !== 'P') {
                focusElement = focusElement.parentElement
              }
              const focusElementRect = focusElement.getBoundingClientRect()
              const topAbove = focusElementRect.top - toolbarInline.getBoundingClientRect().height - 15
              const top = topAbove > 0 ? topAbove : focusElementRect.top + focusElementRect.height + 15
              const left = math.max(0, rect.left + toolbarRelativePos.left - toolbarInline.getBoundingClientRect().width / 2)
              toolbarInline.setAttribute('style', `top: ${top}px; left: ${left}px`)
              toolbarInline.classList.toggle('yed-arrow-above', topAbove <= 0)
              toolbarInline.classList.toggle('yed-arrow-below', topAbove > 0)
            } else {
              toolbarInline.toggleAttribute('show', false)
            }
          }
        }
      }),
      props: {
        handleDOMEvents: {
          mouseup: handleSelectionClick,
          doubleClick: handleSelectionClick
        }
      }
    })
  ]
})

const handleSelectionClick = (view, event) => {
  setTimeout(() => {
    const state = view.state
    const selection = state.selection
    if (!selection.empty && view.hasFocus()) {
      const rect = getSelectionRect()
      if (rect) {
        const left = /** @type {MouseEvent} */ (event).clientX - rect.left
        view.dispatch(state.tr.setMeta(toolbarInlinePluginKey, { isVisible: true, rpos: { left } }))
      }
    }
  }, 0)
  return false
}
