import { wrapIn, setBlockType, chainCommands, toggleMark, exitCode,
  joinUp, joinDown, lift, selectParentNode, markApplies } from 'prosemirror-commands'
import { TextSelection } from 'prosemirror-state'

import * as dom from 'lib0/dom.js'

import { heading, h1, strong, em, codeblock, ul, ol, table, table_cell, table_header, table_row } from './schema.js'

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

export const createReplaceBlockAction = (block, selOffset) => createAction(
  (state, dispatch) => {
    const { $to } = state.selection
    const depth = $to.depth
    const indexAfter = $to.index(depth - 1)
    const can = $to.node(depth - 1).canReplaceWith(indexAfter, indexAfter, block.type)
    if (can && dispatch) {
      const insertPos = $to.before(depth)
      const tr = state.tr.insert(insertPos, block)
      tr.setSelection(TextSelection.create(tr.doc, insertPos + selOffset))
      dispatch(tr)
    }
    return can
  },
  () => false
)

const defaultTable = table.createAndFill({}, [
  table_row.createAndFill({}, [
    table_header.createAndFill(),
    table_header.createAndFill(),
    table_header.createAndFill(),
  ]),
  table_row.createAndFill({}, [
    table_cell.createAndFill(),
    table_cell.createAndFill(),
    table_cell.createAndFill()
  ]),
  table_row.createAndFill({}, [
    table_cell.createAndFill(),
    table_cell.createAndFill(),
    table_cell.createAndFill()
  ])
])

export const actions = {
  strong: createMarkToggleAction(strong),
  em: createMarkToggleAction(em),
  h1: createSetBlockTypeAction(h1),
  h2: createSetBlockTypeAction(heading, { level: 2 }),
  h3: createSetBlockTypeAction(heading, { level: 3 }),
  h4: createSetBlockTypeAction(heading, { level: 4 }),
  h5: createSetBlockTypeAction(heading, { level: 5 }),
  table: createReplaceBlockAction(defaultTable, 3),
  codeblock: createSetBlockTypeAction(codeblock),
  ul: createReplaceBlockAction(ul.createAndFill({}), 3),
  ol: createReplaceBlockAction(ol.createAndFill({}), 3)
}

/**
 * @param {HTMLElement} toolbar
 * @param {any} state
 */
export const updateToolbarActionButtonStates = (toolbar, state) => {
  dom.querySelectorAll(toolbar, '[yed-action]').forEach(b => {
    const actionName = b.getAttribute('yed-action')
    const action = actionName && actions[actionName]
    b.toggleAttribute('active', !!(action && action.isActive(state)))
    b.toggleAttribute('disabled', !(action && action.exec(state)))
  })
}