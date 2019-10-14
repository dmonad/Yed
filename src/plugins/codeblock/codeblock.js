
import { Schema } from 'prosemirror-model'
import { exitCode } from 'prosemirror-commands'
import { undo, redo } from 'prosemirror-history'
import { keymap } from 'prosemirror-keymap'
import { EditorState, Selection, TextSelection } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { DOMParser } from 'prosemirror-model'
import { exampleSetup } from 'prosemirror-example-setup'

import * as dom from 'lib0/dom.js'
import * as pair from 'lib0/pair.js'

import CodeMirror from 'codemirror'

import { schema } from '../../schema.js'
import { createYedPlugin } from '../YedPlugin.js'

import * as promise from 'lib0/promise.js'
import * as map from 'lib0/map.js'

const wrapOpts = (p, opt) => p.then(() => promise.resolve(opt))

const importedLangs = new Map()
const importLangFunctions = {
  json: () => wrapOpts(import('codemirror/mode/javascript/javascript.js'), { name: 'javascript', json: true }),
  js: () => wrapOpts(import('codemirror/mode/javascript/javascript.js'), { name: 'javascript', typescript: true }),
  c: () => wrapOpts(import('codemirror/mode/clike/clike.js'), { name: 'clike' }),
  md: () => wrapOpts(import('codemirror/mode/markdown/markdown.js'), { name: 'markdown' }),
  php: () => wrapOpts(import('codemirror/mode/php/php.js'), { name: 'php' }),
  html: () => wrapOpts(import('codemirror/mode/htmlmixed/htmlmixed.js'), { name: 'htmlmixed' }),
  ' ': () => promise.resolve({ name: '' })
}

const importLang = lang => {
  const importFunction = importLangFunctions[lang]
  if (importFunction != null) {
    return map.setIfUndefined(importedLangs, lang, importFunction)
  } else {
    return null
  }
}

const importedLanguages = new Set()

export class CodeBlockView {
  constructor (node, view, getPos) {
    // Store for later
    this.node = node
    this.view = view
    this.getPos = getPos
    this.incomingChanges = false

    // Create a CodeMirror instance
    this.cm = new CodeMirror(null, {
      value: this.node.textContent,
      lineNumbers: true,
      extraKeys: this.codeMirrorKeymap(),
      viewportMargin: Infinity
    })

    // The editor's outer node is our DOM representation
    this.dom = this.cm.getWrapperElement()
    this.languageSelector = dom.element('div', [pair.create('class', 'yed-codeblock-language-selector')], [
      dom.element('label', [], [
        dom.text('Language'),
        dom.element('input', [pair.create('placeholder', 'none'), pair.create('value', ''), pair.create('list', 'yed-codeblock-languages'), pair.create('name', 'codeblock-language')])
      ]),
      dom.element('datalist', [pair.create('id', 'yed-codeblock-languages')], [
        dom.element('option', [pair.create('value', ' ')], [dom.text('None')]),
        dom.element('option', [pair.create('value', 'js')], [dom.text('Javascript')]),
        dom.element('option', [pair.create('value', 'json')], [dom.text('JSON')]),
        dom.element('option', [pair.create('value', 'md')], [dom.text('Markdown')]),
        dom.element('option', [pair.create('value', 'c')], [dom.text('C / C++')]),
        dom.element('option', [pair.create('value', 'php')], [dom.text('PHP')]),
        dom.element('option', [pair.create('value', 'html')], [dom.text('HTML')]),
      ])
    ])
    dom.append(this.dom, [this.languageSelector])
    this.languageSelector.querySelector('input').addEventListener('change', ev => {
      const lang = ev.target.value
      const imp = importLang(lang)
      if (imp) {
        imp.then(mode => {
          importedLanguages.add(lang)
          this.cm.setOption('mode', mode)
        })
      }
    })
    // CodeMirror needs to be in the DOM to properly initialize, so
    // schedule it to update itself
    setTimeout(() => this.cm.refresh(), 20)

    // This flag is used to avoid an update loop between the outer and
    // inner editor
    this.updating = false
    // Track whether changes are have been made but not yet propagated
    this.cm.on('beforeChange', () => this.incomingChanges = true)
    // Propagate updates from the code editor to ProseMirror
    this.cm.on('cursorActivity', () => {
      if (!this.updating && !this.incomingChanges) this.forwardSelection()
    })
    this.cm.on('changes', () => {
      if (!this.updating) {
        this.valueChanged()
        this.forwardSelection()
      }
      this.incomingChanges = false
    })
    this.cm.on('focus', () => this.forwardSelection())
  }
  // }
  // nodeview_forwardSelection{
  forwardSelection () {
    if (!this.cm.hasFocus()) return
    let state = this.view.state
    let selection = this.asProseMirrorSelection(state.doc)
    if (!selection.eq(state.selection)) { this.view.dispatch(state.tr.setSelection(selection)) }
  }
  // }
  // nodeview_asProseMirrorSelection{
  asProseMirrorSelection (doc) {
    let offset = this.getPos() + 1
    let anchor = this.cm.indexFromPos(this.cm.getCursor('anchor')) + offset
    let head = this.cm.indexFromPos(this.cm.getCursor('head')) + offset
    return TextSelection.create(doc, anchor, head)
  }
  // }
  // nodeview_setSelection{
  setSelection (anchor, head) {
    this.cm.focus()
    this.updating = true
    this.cm.setSelection(this.cm.posFromIndex(anchor),
      this.cm.posFromIndex(head))
    this.updating = false
  }
  // }
  // nodeview_valueChanged{
  valueChanged () {
    let change = computeChange(this.node.textContent, this.cm.getValue())
    if (change) {
      let start = this.getPos() + 1
      let tr = this.view.state.tr.replaceWith(
        start + change.from, start + change.to,
        change.text ? schema.text(change.text) : null)
      this.view.dispatch(tr)
    }
  }
  // }
  // nodeview_keymap{
  codeMirrorKeymap () {
    let view = this.view
    let mod = /Mac/.test(navigator.platform) ? 'Cmd' : 'Ctrl'
    return CodeMirror.normalizeKeyMap({
      Up: () => this.maybeEscape('line', -1),
      Left: () => this.maybeEscape('char', -1),
      Down: () => this.maybeEscape('line', 1),
      Right: () => this.maybeEscape('char', 1),
      [`${mod}-Z`]: () => undo(view.state, view.dispatch),
      [`Shift-${mod}-Z`]: () => redo(view.state, view.dispatch),
      [`${mod}-Y`]: () => redo(view.state, view.dispatch),
      'Ctrl-Enter': () => {
        if (exitCode(view.state, view.dispatch)) view.focus()
      }
    })
  }

  maybeEscape (unit, dir) {
    let pos = this.cm.getCursor()
    if (this.cm.somethingSelected() ||
        pos.line != (dir < 0 ? this.cm.firstLine() : this.cm.lastLine()) ||
        (unit == 'char' &&
         pos.ch != (dir < 0 ? 0 : this.cm.getLine(pos.line).length))) { return CodeMirror.Pass }
    this.view.focus()
    let targetPos = this.getPos() + (dir < 0 ? 0 : this.node.nodeSize)
    let selection = Selection.near(this.view.state.doc.resolve(targetPos), dir)
    this.view.dispatch(this.view.state.tr.setSelection(selection).scrollIntoView())
    this.view.focus()
  }
  // }
  // nodeview_update{
  update (node) {
    if (node.type != this.node.type) return false
    this.node = node
    let change = computeChange(this.cm.getValue(), node.textContent)
    if (change) {
      this.updating = true
      this.cm.replaceRange(change.text, this.cm.posFromIndex(change.from),
        this.cm.posFromIndex(change.to))
      this.updating = false
    }
    return true
  }
  // }
  // nodeview_end{

  selectNode () { this.cm.focus() }
  stopEvent () { return true }
}

// computeChange{
function computeChange (oldVal, newVal) {
  if (oldVal == newVal) return null
  let start = 0; let oldEnd = oldVal.length; let newEnd = newVal.length
  while (start < oldEnd && oldVal.charCodeAt(start) == newVal.charCodeAt(start)) ++start
  while (oldEnd > start && newEnd > start &&
         oldVal.charCodeAt(oldEnd - 1) == newVal.charCodeAt(newEnd - 1)) { oldEnd--; newEnd-- }
  return { from: start, to: oldEnd, text: newVal.slice(start, newEnd) }
}

function arrowHandler (dir) {
  return (state, dispatch, view) => {
    if (state.selection.empty && view.endOfTextblock(dir)) {
      let side = dir == 'left' || dir == 'up' ? -1 : 1; let $head = state.selection.$head
      let nextPos = Selection.near(state.doc.resolve(side > 0 ? $head.after() : $head.before()), side)
      if (nextPos.$head && nextPos.$head.parent.type.name == 'codeblock') {
        dispatch(state.tr.setSelection(nextPos))
        return true
      }
    }
    return false
  }
}

export const codeblockPlugin = createYedPlugin({
  nodeViews: {
    codeblock: (node, view, getPos) => new CodeBlockView(node, view, getPos)
  },
  plugins: [keymap({
    ArrowLeft: arrowHandler('left'),
    ArrowRight: arrowHandler('right'),
    ArrowUp: arrowHandler('up'),
    ArrowDown: arrowHandler('down')
  })]
})