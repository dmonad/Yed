import { createYedPlugin } from '../YedPlugin.js'
import { updateToolbarActionButtonStates } from '../../actions.js'
import { Plugin, PluginKey } from 'prosemirror-state'
import * as math from 'lib0/math.js'
import * as lib from '../../lib.js'
import * as loop from 'lib0/eventloop.js'

export const toolbarInlinePluginKey = new PluginKey('toolbar-inline')

/**
 * @param {any} view
 * @return {ClientRect | null}
 */
const getSelectionRect = view => {
  const sel = getSelection(view)
  const range = sel && sel.type !== 'None' && sel.getRangeAt(0)
  return range ? range.getBoundingClientRect() : null
}

/**
 * @param {any} view
 * @return {Selection}
 */
const getSelection = view => view._root.getSelection()

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
          const prevPluginState = toolbarInlinePluginKey.getState(prevState)
          const toolbarRelativePos = toolbarInlinePluginKey.getState(view.state).rpos
          const hover = !!toolbarRelativePos && lib.isEditorFocused(view)
          let showToolbarInline = false
          updateToolbarActionButtonStates(toolbarInline.shadowRoot, view.state)
          if (hover) {
            const selRect = getSelectionRect(view)
            const viewSelection = /** @type {any} */ (view.state.selection)
            const textSelectionSlice = viewSelection.content().content
            const textSelection = textSelectionSlice.textBetween(0, textSelectionSlice.size, '', '')
            if (selRect && !viewSelection.empty && textSelection.length > 0) {
              toolbarInline.toggleAttribute('hover', hover)
              const offsetParentRect = /** @type {HTMLElement} */ (toolbarInline.offsetParent).getBoundingClientRect()
              const toolbarInlineRect = toolbarInline.getBoundingClientRect()
              const relTop = selRect.top - offsetParentRect.top
              const topAbove = relTop - toolbarInlineRect.height
              const printAbove = topAbove > 0 && (viewSelection.$anchor.path[1] === viewSelection.$head.path[1] || viewSelection.anchor >= viewSelection.head)
              const top = printAbove ? topAbove : relTop + selRect.height
              const left = selRect.left + toolbarRelativePos.left - toolbarInlineRect.width / 2 - offsetParentRect.left
              // consider the case that left + toolbar.width > renderwidth && never render below left=0
              const leftWidthAdjusted = math.max(0, math.min(left, offsetParentRect.width - toolbarInlineRect.width - 10))
              toolbarInline.setAttribute('style', `top: ${top}px; left: ${leftWidthAdjusted}px`)
              toolbarInline.classList.toggle('yed-arrow-above', !printAbove)
              toolbarInline.classList.toggle('yed-arrow-below', printAbove)
              showToolbarInline = true
            }
          }
          if (!showToolbarInline && prevPluginState.isVisible) {
            setTimeout(() => {
              toolbarInline.toggleAttribute('hover', showToolbarInline)
              view.dispatch(view.state.tr.setMeta(toolbarInlinePluginKey, { isVisible: false, rpos: null }))
            })
          }
        }
      }),
      props: {
        handleDOMEvents: {
          // mousedown: handleSelectionClick,
          mouseup: handleSelectionClick,
          doubleClick: handleSelectionClick
        }
      }
    })
  ]
})

const selectionDebouncer = loop.createDebouncer(200)

const handleSelectionClick = (view, event) => {
  selectionDebouncer(() => {
    const state = view.state
    const selection = state.selection
    const pluginState = toolbarInlinePluginKey.getState(state)
    if (!selection.empty && pluginState.rpos == null && view.hasFocus()) {
      const rect = getSelectionRect(view)
      if (rect) {
        const left = /** @type {MouseEvent} */ (event).clientX - rect.left
        view.dispatch(state.tr.setMeta(toolbarInlinePluginKey, { isVisible: true, rpos: { left } }))
      }
    }
  })
  return false
}
