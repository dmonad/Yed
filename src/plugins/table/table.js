
import { createYedPlugin } from '../YedPlugin.js'
import { TextSelection } from 'prosemirror-state'
import { DecorationSet, Decoration } from 'prosemirror-view'
import { keymap } from 'prosemirror-keymap'
import { columnResizing, tableEditing, goToNextCell } from 'prosemirror-tables'
import { schema } from '../../schema.js'

import * as dom from 'lib0/dom.js'
import * as pair from 'lib0/pair.js'

const createTable = (state, dispatch) => {
  const insertPos = state.selection.$to.after(1)
  const tableNode = schema.nodes.table.createAndFill({}, [
    schema.nodes.table_row.createAndFill({}, [
      schema.nodes.table_header.createAndFill(),
      schema.nodes.table_header.createAndFill(),
      schema.nodes.table_header.createAndFill(),
    ]),
    schema.nodes.table_row.createAndFill({}, [
      schema.nodes.table_cell.createAndFill(),
      schema.nodes.table_cell.createAndFill(),
      schema.nodes.table_cell.createAndFill()
    ]),
    schema.nodes.table_row.createAndFill({}, [
      schema.nodes.table_cell.createAndFill(),
      schema.nodes.table_cell.createAndFill(),
      schema.nodes.table_cell.createAndFill()
    ])
  ])
  const tr = state.tr.insert(insertPos, tableNode)
  tr.setSelection(TextSelection.create(tr.doc, insertPos + 3))
  dispatch(tr)
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