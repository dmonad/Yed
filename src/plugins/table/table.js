
import { createYedPlugin } from '../YedPlugin.js'
import { TextSelection } from 'prosemirror-state'
import { DecorationSet, Decoration } from 'prosemirror-view'
import { keymap } from 'prosemirror-keymap'
import { columnResizing, tableEditing, goToNextCell } from 'prosemirror-tables'
import { table, table_cell, table_header, table_row } from '../../schema.js'

import * as dom from 'lib0/dom.js'
import * as pair from 'lib0/pair.js'

export const createTable = (state, dispatch) => {
  const { $to } = state.selection
  const depth = $to.depth
  const indexAfter = $to.index(depth - 1)
  const can = $to.node(depth - 1).canReplaceWith(indexAfter, indexAfter, table)
  if (can && dispatch) {
    const insertPos = $to.before(depth)
    const tableNode = table.createAndFill({}, [
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
    const tr = state.tr.insert(insertPos, tableNode)
    tr.setSelection(TextSelection.create(tr.doc, insertPos + 3))
    dispatch(tr)
  }
  return can
}

export const tablePlugin = createYedPlugin({
  plugins: [
    columnResizing({}),
    tableEditing(),
    keymap({
      'Tab': goToNextCell(1),
      'Shift-Tab': goToNextCell(-1),
      'Ctrl-.': createTable
    })
  ]
})

// @ts-ignore
document.execCommand("enableObjectResizing", false, false)
// @ts-ignore
document.execCommand("enableInlineTableEditing", false, false)