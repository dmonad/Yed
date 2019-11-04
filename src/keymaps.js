import { wrapIn, setBlockType, chainCommands, toggleMark, exitCode,
  joinUp, joinDown, lift, selectParentNode } from 'prosemirror-commands'
import { wrapInList, splitListItem, liftListItem, sinkListItem } from 'prosemirror-schema-list'
import { undo, redo } from 'y-prosemirror'
import { undoInputRule } from 'prosemirror-inputrules'
import * as env from 'lib0/environment.js'
import { strong, em, code, ul, ol, li, blockquote, br, hr, codeblock, heading, p } from './schema.js'

export const keymaps = {}
const bind = (key, cmd) => {
  keymaps[key] = cmd
}

// undo/redo
bind('Mod-z', undo)
bind('Shift-Mod-z', redo)
bind('Backspace', undoInputRule)
if (!env.isMac) bind('Mod-y', redo)

bind('Alt-ArrowUp', joinUp)
bind('Alt-ArrowDown', joinDown)
bind('Mod-BracketLeft', lift)
bind('Escape', selectParentNode)

// bold
bind('Mod-b', toggleMark(strong))
bind('Mod-B', toggleMark(strong))

// italic
bind('Mod-i', toggleMark(em))
bind('Mod-I', toggleMark(em))

// code
bind('Mod-`', toggleMark(code))

// bullet list
bind('Shift-Ctrl-8', wrapInList(ul))

// ordered list
bind('Shift-Ctrl-9', wrapInList(ol))

// blockquote
bind('Ctrl->', wrapIn(blockquote))

const brcmd = chainCommands(exitCode, (state, dispatch) => {
  dispatch(state.tr.replaceSelectionWith(br.create()).scrollIntoView())
  return true
})
bind('Mod-Enter', brcmd)
bind('Shift-Enter', brcmd)
if (env.isMac) bind('Ctrl-Enter', brcmd)

bind('Enter', splitListItem(li))
bind('Mod-[', liftListItem(li))
bind('Mod-]', sinkListItem(li))

bind('Shift-Ctrl-0', setBlockType(p))

bind('Shift-Ctrl-\\', setBlockType(p))

for (let i = 1; i <= 6; i++) bind('Shift-Ctrl-' + i, setBlockType(heading, { level: i }))

bind('Mod-_', (state, dispatch) => {
  dispatch(state.tr.replaceSelectionWith(hr.create()).scrollIntoView())
  return true
})
