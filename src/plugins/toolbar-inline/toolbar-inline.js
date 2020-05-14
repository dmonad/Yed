/* eslint-env browser */

import { createYedPlugin } from '../YedPlugin.js'
import { updateToolbarActionButtonStates } from '../../actions.js'
import { fakeSelectionPluginKey } from '../fake-selection/fake-selection.js'
import { Plugin, PluginKey, Selection, EditorState } from 'prosemirror-state'
import * as math from 'lib0/math.js'
import * as lib from '../../lib.js'
import * as loop from 'lib0/eventloop.js'
import { EditorView } from 'prosemirror-view'

export const toolbarInlinePluginKey = new PluginKey('toolbar-inline')

/**
 * Also considers if a fake-selection is active and renders that instead.
 *
 * @param {EditorView} view
 * @param {Selection} selection
 * @return {ClientRect | null}
 */
const getSelectionRect = (view, selection) => {
  const anchor = view.domAtPos(selection.anchor)
  const head = view.domAtPos(selection.head)
  const range = new Range()
  range.setStart(anchor.node, anchor.offset)
  range.setEnd(head.node, head.offset)
  return range.getBoundingClientRect()
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
          const isVisible = (changeState && changeState.isVisible && !!changeState.rpos) || (!changeState && val.isVisible && !lib.getEditorSelection(newState).empty)
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
          updateToolbarActionButtonStates(toolbarInline.shadowRoot || toolbarInline, view.state)
          if (hover) {
            const editorSelection = lib.getEditorSelection(view.state)
            const selRect = getSelectionRect(view, editorSelection)
            const textSelectionSlice = editorSelection.content().content
            const textSelection = textSelectionSlice.textBetween(0, textSelectionSlice.size, '', '')
            if (selRect && !editorSelection.empty && textSelection.length > 0) {
              if (!toolbarInline.state.hover) {
                toolbarInline.updateState({ hover: true, menu: 'actions' })
              }
              const offsetParentRect = /** @type {HTMLElement} */ (toolbarInline.offsetParent).getBoundingClientRect()
              const toolbarInlineRect = toolbarInline.getBoundingClientRect()
              const relTop = selRect.top - offsetParentRect.top
              const topAbove = relTop - toolbarInlineRect.height
              const printAbove = topAbove > 0 && (editorSelection.$anchor.path[1] === editorSelection.$head.path[1] || editorSelection.anchor >= editorSelection.head)
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
            console.log('editorfocused: ', lib.isEditorFocused(view))
            toolbarInline.updateState({ hover: false, focused: false })
            lib.setMeta(view, toolbarInlinePluginKey, { isVisible: false, rpos: null })
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
    const selection = lib.getEditorSelection(view.state)
    const pluginState = toolbarInlinePluginKey.getState(state)
    if (!selection.empty && pluginState.rpos == null && view.hasFocus()) {
      const rect = getSelectionRect(view, selection)
      if (rect) {
        const left = /** @type {MouseEvent} */ (event).clientX - rect.left
        lib.setMeta(view, toolbarInlinePluginKey, { isVisible: true, rpos: { left } })
      }
    }
  })
  return false
}
