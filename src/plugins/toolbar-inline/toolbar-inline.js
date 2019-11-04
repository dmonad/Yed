import { createYedPlugin } from '../YedPlugin.js'
import { updateToolbarActionButtonStates } from '../../actions.js'
import { Plugin, PluginKey } from 'prosemirror-state'
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
 * Compute the top-offset of absEl to relParent.
 *
 * Only call this function if you are sure that absEl is a child of relParent
 * and if relParent is a relatively positioned element!
 *
 * @param {HTMLElement} absEl
 * @param {HTMLElement} relParent
 * @return {number} The Top offset of absEl to relParent
 */
const computeTopOffsetTo = (absEl, relParent) => {
  let offset = 0
  do {
    offset += absEl.offsetTop
    absEl = /** @type {HTMLElement} */ (absEl.offsetParent)
  } while (absEl !== relParent)
  return offset
}

/**
 * @param {HTMLElement} toolbarInline
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
          const hover = !!toolbarRelativePos && view.hasFocus()
          updateToolbarActionButtonStates(toolbarInline, view.state)
          toolbarInline.toggleAttribute('hover', hover)
          if (hover) {
            const selection = getSelection()
            const focusNode = selection && selection.focusNode
            const rect = getSelectionRect()
            if (focusNode && rect) {
              let focusElement = /** @type {HTMLElement} */ (focusNode)
              while (focusElement.parentElement && focusElement.parentElement !== view.dom && (focusElement.nodeType !== document.ELEMENT_NODE || focusElement.nodeName !== 'P')) {
                focusElement = focusElement.parentElement
              }
              const focusElementOffsetTo = computeTopOffsetTo(focusElement, /** @type {HTMLElement} */ (toolbarInline.offsetParent))
              const focusElementRect = focusElement.getBoundingClientRect()
              const toolbarInlineRect = toolbarInline.getBoundingClientRect()
              const topAbove = focusElementOffsetTo - toolbarInlineRect.height
              const top = topAbove > 0 ? topAbove : focusElementOffsetTo + focusElementRect.height
              const left = math.max(5, rect.left + toolbarRelativePos.left - toolbarInlineRect.width / 2)
              toolbarInline.setAttribute('style', `top: ${top}px; left: ${left}px`)
              toolbarInline.classList.toggle('yed-arrow-above', topAbove <= 0)
              toolbarInline.classList.toggle('yed-arrow-below', topAbove > 0)
            } else {
              toolbarInline.toggleAttribute('hover', false)
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
