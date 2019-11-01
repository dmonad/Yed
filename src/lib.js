import * as logging from 'lib0/logging.js'

export const log = (...args) => logging.print(logging.PURPLE, `[yed] `, logging.UNCOLOR, ...args)
