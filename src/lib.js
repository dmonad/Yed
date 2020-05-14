import * as logging from 'lib0/logging.js'
import * as dom from 'lib0/dom.js'
import * as map from 'lib0/map.js'
// eslint-disable-next-line
import { EditorView } from 'prosemirror-view'
import * as eventloop from 'lib0/eventloop.js'
import { EditorState } from 'prosemirror-state'
import { fakeSelectionPluginKey } from './plugins/fake-selection/fake-selection.js'
export { setMeta } from 'y-prosemirror'

export const log = (...args) => logging.print(logging.PURPLE, '[yed] ', logging.UNCOLOR, ...args)

/**
 * @param {any} view
 * @return {boolean}
 */
export const isEditorFocused = view => view.root.activeElement && (view.hasFocus() || dom.isParentOf(view.root, view.root.activeElement))

/**
 * @param {EditorState} state
 * @return {Selection}
 */
export const getEditorSelection = (state) => fakeSelectionPluginKey.getState(state) || state.selection
