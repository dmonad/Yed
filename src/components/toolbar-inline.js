import * as component from 'lib0/component.js'
import { actions } from '../actions.js'
import { log } from '../lib.js'
import * as logging from 'lib0/logging.js'
import * as dom from 'lib0/dom.js'
import * as dcomps from 'd-components'
import * as pair from 'lib0/pair.js'

export const defineYedToolbarInline = component.createComponentDefiner(() => {
  dcomps.defineButton()
  dcomps.defineIconBold()
  dcomps.defineIconItalic()
  dcomps.defineIconLink()
  dcomps.defineIconHighlighter()
  dcomps.defineIconComment()
  dcomps.defineInputText()
  return component.createComponent('yed-toolbar-inline', {
    template: `
<div id="actions">
  <d-button yed-action="strong" title="Bold" aria-label="bold"><d-icon-bold></d-icon-bold></d-button>
  <d-button yed-action="em" title="Italic" aria-label="italic"><d-icon-italic></d-icon-italic></d-button>
  <d-button yed-action="link" title="Link" aria-label="link">
    <d-icon-link></d-icon-link>
  </d-button>
  <d-button yed-action="highlight" title="Highlight" aria-label="highlight">
    <d-icon-highlighter></d-icon-highlighter>
  </d-button>
  <d-button yed-action="comment" title="Comment" aria-label="comment">
    <d-icon-comment></d-icon-comment>
  </d-button>
</div>
<div id="link-menu">
  <d-input-text id="link-menu-input" placeholder="https://" label="Show Label" show-label grow><a id="link-menu-link" href="#" slot="icon" target="_blank"><d-icon-link></d-icon-link></a></d-input-text>
</div>
    `,
    style: `
:host {
  color: #eee;
  border-radius: .2rem;
  box-shadow: 0 0 .1rem #000;
  white-space: nowrap;
  width: fit-content;
  background-color: #242424;
  outline: none;
}
:host > * {
  display: none;
}
:host([menu="actions"]) #actions {
  display: block;
  height: 2.7rem;
}
:host([menu="link-menu"]) #link-menu {
  display: block;
  height: 2rem;
}
#link-menu > * {
  height: 100%;
  color: #ccc;
}
#link-menu-input > [slot="icon"] {
  vertical-align: -.33em;
  color: #60a7ff;
  height: 0.7em;
  display: inline-block;
}

#link-menu-input > [slot="icon"] > * {
  height: inherit;
}

#link-menu-input > [slot="input"] {
  font-size: x-small;
}

#link-menu-input {
  padding: 0 .5rem;
  min-width: 20em;
  max-width: 50em;
}

#actions {
  width: fit-content;
}
#actions > d-button {
  cursor: pointer;
  --background-color: linear-gradient(to bottom, #444444, #48484848);
  --active-color: #000000;
  --selected-color: #848484;
  height: 100%;
  min-width: 2.7rem;
  padding: 0;
  border: 0;
  border-left: 1px solid #444;
  border-right: 1px solid #000;
  font-weight: bold;
  font-size: 1rem;
  line-height: 2.7rem;
  float: left;
  box-sizing: border-box;
  display: inline;
  text-align: center;
}
#actions > d-button[disabled] {
  display: none;
}
#actions > d-button[active] > * {
  color: white;
}
#actions > d-button:first-child {
  border-left: none;
  border-top-left-radius: .2rem;
  border-bottom-left-radius: .2rem;
}
#actions > d-button:last-child {
  border-right: none;
  border-top-right-radius: .2rem;
  border-bottom-right-radius: .2rem;
}
#actions > d-button > * {
  height: .8rem;
  margin-top: .93rem;
  display: inline;
}
:host(.yed-arrow-above) {
  /* remove arrow height from calculation */
  margin-top: .4rem;
}
:host(.yed-arrow-below) {
  /* remove arrow height from calculation */
  margin-top: -.4rem;
}
:host(.yed-arrow-below)::after, :host(.yed-arrow-above)::after {
  position: absolute;
  content: '';
  display: block;
  height: 0;
  width: 0;
  left: 50%;
  bottom: -.3rem;
  margin-left: -.2rem;
  border-left: .3rem solid transparent;
  border-right: .3rem solid transparent;
  border-top: .3rem solid #333; /* the gradient color roughly ends at color #333 */
}
:host(.yed-arrow-above)::after {
  border-top: none;
  border-bottom: .3rem solid #242424; /* use the initial bottom color here */
  bottom: initial;
  top:-.3rem;
}
:host {
  position: absolute;
  display: none;
}
:host([hover]) {
  display: block;
  z-index: 5;
}
    `,
    attrs: {
      menu: 'string',
      hover: 'bool'
    },
    childStates: {
      '#link-menu-input': ({ linkMenuInput }) => ({ value: linkMenuInput })
    },
    onStateChange: (state, prevState, component) => {
      if (state.menu === 'link-menu') {
        // @ts-ignore
        dom.setAttributes(dom.querySelector(component.shadowRoot, '#link-menu-link'), [pair.create('href', state.linkMenuInput || '#')])
      }
    },
    listeners: {
      mousedown: interceptMouseEvents,
      mouseup: interceptMouseEvents,
      [dcomps.dinput]: (event, component) => {
        if (/** @type {HTMLElement} */ (event.target).id === 'link-menu-input') {
          component.updateState({ linkMenuInput: event.detail.value || null })
        }
      },
      [dcomps.buttonPressedEvent]: (event, component) => {
        const view = component.state.view
        if (event.target && /** @type {Element} */ (event.target).nodeType === document.ELEMENT_NODE && view) {
          const actionName = /** @type {Element} */ (event.target).getAttribute('yed-action')
          const action = actions[actionName]
          if (action) {
            const isExeced = action.exec(view.state, view.dispatch)
            if (isExeced && actionName === 'link') {
              component.updateState({ menu: 'link-menu' })
              // @ts-ignore
              component.shadowRoot.querySelector('#link-menu input').focus()
            } else {
              view.focus()
            }
          } else if (actionName) {
            log('Action ', logging.RED, '"' + actionName + '" ', logging.UNCOLOR, 'is not recognized.')
          }
        }
      }
    },
    state: { view: null, menu: 'actions', hover: false, linkMenuInput: null }
  })
})

const interceptMouseEvents = (event, component) => {
  if (component.state.menu === 'actions') {
    component.state.view.focus()
  } else {
    return false
  }
}
