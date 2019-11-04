import { wrapIn, setBlockType, chainCommands, toggleMark, exitCode,
  joinUp, joinDown, lift, selectParentNode, markApplies } from 'prosemirror-commands'

import * as dom from 'lib0/dom.js'

import { createTable } from './plugins/table/table.js'

import { heading, h1, strong, em, codeblock, ul, ol } from './schema.js'

class Action {
  /**
   * @param {function(object, function):void} exec
   * @param {function(object):boolean} isActive
   */
  constructor (exec, isActive) {
    this.exec = exec
    this.isActive = isActive
  }
}

/**
 * @param {function(object, function?):boolean} exec
 * @param {function(object):boolean} isActive
 * @return {Action}
 */
const createAction = (exec, isActive) => new Action(exec, isActive)

const createMarkToggleAction = mark => createAction(
  toggleMark(mark),
  state => {
    const { from, to } = state.selection
    return state.doc.rangeHasMark(from, to, mark)
  }
)

const createSetBlockTypeAction = (nodeType, attrs) => createAction(
  setBlockType(nodeType, attrs),
  state => {
    const { $from, to, node } = state.selection
    if (node) {
      return node.hasMarkup(nodeType, attrs)
    }
    return to <= $from.end() && $from.parent.hasMarkup(nodeType, attrs)
  }
)


export const actions = {
  strong: createMarkToggleAction(strong),
  em: createMarkToggleAction(em),
  h1: createSetBlockTypeAction(h1),
  h2: createSetBlockTypeAction(heading, { level: 2 }),
  h3: createSetBlockTypeAction(heading, { level: 3 }),
  h4: createSetBlockTypeAction(heading, { level: 4 }),
  h5: createSetBlockTypeAction(heading, { level: 5 }),
  table: createAction(createTable, () => false),
  codeblock: createSetBlockTypeAction(codeblock),
  ul: createSetBlockTypeAction(ul),
  ol: createSetBlockTypeAction(ol),
}

/**
 * @param {HTMLElement} toolbar
 * @param {any} state
 */
export const updateToolbarActionButtonStates = (toolbar, state) => {
  dom.querySelectorAll(toolbar, 'button[yed-action]').forEach(b => {
    const actionName = b.getAttribute('yed-action')
    const action = actionName && actions[actionName]
    b.toggleAttribute('active', !!(action && action.isActive(state)))
    b.toggleAttribute('disabled', !(action && action.exec(state)))
  })
}