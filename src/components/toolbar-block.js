import * as component from 'lib0/component.js'
import { actions } from '../actions.js'
import { log } from '../lib.js'
import * as logging from 'lib0/logging.js'
import * as dcomps from 'd-components'

export const defineYedToolbarBlock = component.createComponentDefiner(() => {
  dcomps.defineIconH2()
  dcomps.defineIconH3()
  dcomps.defineIconTable()
  dcomps.defineIconListOl()
  dcomps.defineIconListUl()
  dcomps.defineIconTable()
  dcomps.defineIconCheckSquare()
  dcomps.defineIconCode()
  dcomps.defineIconQuoteLeft()
  return component.createComponent('yed-toolbar-block', {
    template: `
  <button type="button" yed-action="h2" title="H2" aria-label="h2">
    <d-icon-h2></d-icon-h2>
  </button>
  <button type="button" yed-action="h3" title="H3" aria-label="h3">
    <d-icon-h3>/d-icon-h3>
  </button>
  <button type="button" yed-action="table" title="Table" aria-label="table">
    <d-icon-table></d-icon-table>
  </button>
  <button type="button" yed-action="codeblock" title="Codeblock" aria-label="codeblock">
    <d-icon-code></d-icon-code>
  </button>
  <button type="button" yed-action="ol" title="Ordered list" aria-label="ordered-list">
    <d-icon-list-ol><d-icon-list-ol>
  </button>
  <button type="button" yed-action="ul" title="Unordered list" aria-label="unordered-list">
    <d-icon-list-ul><d-icon-list-ul>
  </button>
  <button type="button" yed-action="list-todo" title="Todo list" aria-label="todo-list">
    <d-icon-check-square><d-icon-check-square>
  </button>
  <button type="button" yed-action="blockquote" title="Blockquote" aria-label="blockquote">
    <d-icon-quote-left><d-icon-quote-left>
  </button>
    `,
    style: `
  :host {
    white-space: normal;
    display: none;
  }
  :host([visible]) {
    display: inline-flex;
    display: none;
  }
  :host::before {
    content: ' '
  }
  :host > * {
    color: #ddd;
  }
  :host::before {
    content: ' ';
    white-space: pre;
    color: inherit;
  }
  button {
    cursor: pointer;
    min-width: 2em;
    padding: 0;
    border: none;
    font: inherit;
    font-size: 1em;
    color: inherit;
    background-color: inherit;
    vertical-align: middle;
    outline: none;
    margin-left: .3em;
  }
  :host > button > * {
    vertical-align: middle;
  }
  :host > button > * {
    height: .9em;
    display: inline-flex;
  }
  :host > button:hover > * {
    padding-bottom: .1em;
    border-bottom: solid .2em currentColor;
    margin-bottom: -.3em;
  }
  :host > button:hover {
    text-decoration: underline;
  }
  :host > button[disabled] {
    display: none;
  }

  button * {
    pointer-events: none;
  }
    `,
    listeners: {
      click: (event, component) => {
        const view = component.state.view
        if (event.target && /** @type {Element} */ (event.target).nodeType === document.ELEMENT_NODE && view) {
          const actionName = /** @type {Element} */ (event.target).getAttribute('yed-action')
          const action = actions[actionName]
          if (action) {
            view.focus()
            action.exec(view.state, view.dispatch)
            event.preventDefault()
          } else if (actionName) {
            log('Action ', logging.RED, '"' + actionName + '" ', logging.UNCOLOR, 'is not recognized.')
          }
        }
      }
    },
    state: { view: null }
  })
})
