import * as logging from 'lib0/logging.js'
import * as dom from 'lib0/dom.js'

export const log = (...args) => logging.print(logging.PURPLE, '[yed] ', logging.UNCOLOR, ...args)

/**
 * @param {any} view
 * @return {boolean}
 */
export const isEditorFocused = view => view.root.activeElement && (view.hasFocus() || dom.isParentOf(view.root, view.root.activeElement))
