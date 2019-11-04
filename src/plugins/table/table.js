
import { createYedPlugin } from '../YedPlugin.js'
import { TextSelection } from 'prosemirror-state'
import { DecorationSet, Decoration } from 'prosemirror-view'
import { keymap } from 'prosemirror-keymap'
import { columnResizing, tableEditing, goToNextCell } from 'prosemirror-tables'
import { table, table_cell, table_header, table_row } from '../../schema.js'

export const tablePlugin = createYedPlugin({
  plugins: [
    columnResizing({}),
    tableEditing(),
    keymap({
      'Tab': goToNextCell(1),
      'Shift-Tab': goToNextCell(-1)
    })
  ]
})

// @ts-ignore
document.execCommand("enableObjectResizing", false, false)
// @ts-ignore
document.execCommand("enableInlineTableEditing", false, false)