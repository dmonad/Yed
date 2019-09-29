import { wrapIn, setBlockType, chainCommands, toggleMark, exitCode,
        joinUp, joinDown, lift, selectParentNode } from 'prosemirror-commands'
import { wrapInList, splitListItem, liftListItem, sinkListItem } from 'prosemirror-schema-list'
import { undo, redo } from 'y-prosemirror'
import { undoInputRule } from 'prosemirror-inputrules'
import * as env from 'lib0/environment.js'
import { schema } from './schema.js'

export const keymaps = {}
const bind = (key, cmd) => {
  keymaps[key] = cmd
}

// undo/redo
bind("Mod-z", undo)
bind("Shift-Mod-z", redo)
bind("Backspace", undoInputRule)
if (!env.isMac) bind("Mod-y", redo)

bind("Alt-ArrowUp", joinUp)
bind("Alt-ArrowDown", joinDown)
bind("Mod-BracketLeft", lift)
bind("Escape", selectParentNode)

// bold
bind("Mod-b", toggleMark(schema.marks.strong))
bind("Mod-B", toggleMark(schema.marks.strong))

// italic
bind("Mod-i", toggleMark(schema.marks.em))
bind("Mod-I", toggleMark(schema.marks.em))

// code
bind("Mod-`", toggleMark(schema.marks.code))

// bullet list
bind("Shift-Ctrl-8", wrapInList(schema.nodes.bullet_list))

// ordered list
bind("Shift-Ctrl-9", wrapInList(schema.nodes.ordered_list))

// blockquote
bind("Ctrl->", wrapIn(schema.nodes.blockquote))

// hard-break in paragraph
const br = schema.nodes.hard_break
const brcmd = chainCommands(exitCode, (state, dispatch) => {
  dispatch(state.tr.replaceSelectionWith(br.create()).scrollIntoView())
  return true
})
bind("Mod-Enter", brcmd)
bind("Shift-Enter", brcmd)
if (env.isMac) bind("Ctrl-Enter", brcmd)

const listitem = schema.nodes.list_item
bind("Enter", splitListItem(listitem))
bind("Mod-[", liftListItem(listitem))
bind("Mod-]", sinkListItem(listitem))

bind("Shift-Ctrl-0", setBlockType(schema.nodes.paragraph))

bind("Shift-Ctrl-\\", setBlockType(schema.nodes.code_block))

for (let i = 1; i <= 6; i++) bind("Shift-Ctrl-" + i, setBlockType(schema.nodes.heading, {level: i}))

bind("Mod-_", (state, dispatch) => {
  dispatch(state.tr.replaceSelectionWith(schema.nodes.horizontal_rule.create()).scrollIntoView())
  return true
})


