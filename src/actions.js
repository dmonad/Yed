import { wrapIn, setBlockType, chainCommands, toggleMark, exitCode,
  joinUp, joinDown, lift, selectParentNode } from 'prosemirror-commands'

import { schema } from './schema.js'

class Action {
  constructor (exec, isActive) {
    this.exec = exec
    this.isActive = isActive
  }
}

const createAction = (exec, isActive) => new Action(exec, isActive)
const createMarkToggleAction = mark => createAction(toggleMark(mark), state => {
  const { from, to } = state.selection
  return state.doc.rangeHasMark(from, to, mark)
})


export const actions = {
  strong: createMarkToggleAction(schema.marks.strong),
  em: createMarkToggleAction(schema.marks.em)
}
