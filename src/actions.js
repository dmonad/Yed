import { wrapIn, setBlockType, chainCommands, toggleMark, exitCode,
  joinUp, joinDown, lift, selectParentNode } from 'prosemirror-commands'

import { schema } from './schema.js'

export const actions = {
  strong: toggleMark(schema.marks.strong),
  em: toggleMark(schema.marks.em)
}
