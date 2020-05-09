import * as component from 'lib0/component.js'
import { actions } from '../actions.js'
import { log } from '../lib.js'
import * as logging from 'lib0/logging.js'
import * as dcomps from 'd-components'

export const defineYedToolbarInline = component.createComponentDefiner(() => {
  dcomps.defineButton()
  dcomps.defineIconBold()
  dcomps.defineIconItalic()
  dcomps.defineIconLink()
  dcomps.defineIconHighlighter()
  dcomps.defineIconComment()
  return component.createComponent('yed-toolbar-inline', {
    template: `
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
    `,
    style: `
:host {
  background-color: #bbb;
  border-radius: .2rem;
  box-shadow: 0 0 .1rem #000;
  white-space: nowrap;
  width: fit-content;
}
:host > d-button {
  cursor: pointer;
  background-color: #242424;
  --background-color: linear-gradient(to bottom, #242424, rgba(36, 36, 36, 0.89));
  --active-color: #000000;
  --selected-color: #848484;
  height: 2.7rem;
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
:host > d-button > * {
  color: #eee;
}
:host > d-button[active] > * {
  color: #ffa500;
}
:host > d-button:first-child {
  border-left: none;
  border-top-left-radius: .2rem;
  border-bottom-left-radius: .2rem;
}
:host > d-button:last-child {
  border-right: none;
  border-top-right-radius: .2rem;
  border-bottom-right-radius: .2rem;
}
:host > d-button > * {
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
    listeners: {
      [dcomps.buttonPressedEvent]: (event, component) => {
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
console.log(dcomps.buttonPressedEvent)

export const uiaedefineYedToolbarInline = component.createComponentDefiner(() => {
  dcomps.defineButton()
  return component.createComponent('yed-toolbar-inline', {
    template: `
<d-button>b</d-button>
<button type="button" yed-action="strong" title="Bold" aria-label="bold"><b>B</b></button>
<button type="button" yed-action="em" title="Italic" aria-label="italic"><i>I</i></button>
<button type="button" yed-action="link" title="Link" aria-label="link">
  <!--
    @license
    The following SVG image (fa-link by Font Awesome) is "CC BY 4.0"-licensed.
    https://fontawesome.com/license/free
  -->
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path
  fill="currentColor" d="M326.612 185.391c59.747 59.809 58.927 155.698.36
  214.59-.11.12-.24.25-.36.37l-67.2 67.2c-59.27 59.27-155.699 59.262-214.96
  0-59.27-59.26-59.27-155.7 0-214.96l37.106-37.106c9.84-9.84 26.786-3.3
  27.294 10.606.648 17.722 3.826 35.527 9.69 52.721 1.986 5.822.567
  12.262-3.783 16.612l-13.087 13.087c-28.026 28.026-28.905 73.66-1.155
  101.96 28.024 28.579 74.086 28.749 102.325.51l67.2-67.19c28.191-28.191
  28.073-73.757 0-101.83-3.701-3.694-7.429-6.564-10.341-8.569a16.037 16.037
  0 0 1-6.947-12.606c-.396-10.567 3.348-21.456
  11.698-29.806l21.054-21.055c5.521-5.521 14.182-6.199 20.584-1.731a152.482
  152.482 0 0 1 20.522 17.197zM467.547
  44.449c-59.261-59.262-155.69-59.27-214.96 0l-67.2
  67.2c-.12.12-.25.25-.36.37-58.566 58.892-59.387 154.781.36 214.59a152.454
  152.454 0 0 0 20.521 17.196c6.402 4.468 15.064 3.789
  20.584-1.731l21.054-21.055c8.35-8.35 12.094-19.239 11.698-29.806a16.037
  16.037 0 0
  0-6.947-12.606c-2.912-2.005-6.64-4.875-10.341-8.569-28.073-28.073-28.191-73.639
  0-101.83l67.2-67.19c28.239-28.239 74.3-28.069 102.325.51 27.75 28.3 26.872
  73.934-1.155 101.96l-13.087 13.087c-4.35 4.35-5.769 10.79-3.783 16.612
  5.864 17.194 9.042 34.999 9.69 52.721.509 13.906 17.454 20.446 27.294
  10.606l37.106-37.106c59.271-59.259 59.271-155.699.001-214.959z"/></svg>
</button>
<button type="button" yed-action="highlight" title="Highlight" aria-label="highlight">
  <!--
    @license
    The following SVG image (highlighter by Font Awesome) is "CC BY 4.0"-licensed.
    https://fontawesome.com/license/free
  -->
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 544 512">
    <path fill="currentColor" d="M0 479.98L99.92
    512l35.45-35.45-67.04-67.04L0 479.98zm124.61-240.01a36.592 36.592 0 0
    0-10.79 38.1l13.05 42.83-50.93 50.94 96.23 96.23 50.86-50.86 42.74
    13.08c13.73 4.2 28.65-.01 38.15-10.78l35.55-41.64-173.34-173.34-41.52
    35.44zm403.31-160.7l-63.2-63.2c-20.49-20.49-53.38-21.52-75.12-2.35L190.55
    183.68l169.77 169.78L530.27 154.4c19.18-21.74 18.15-54.63-2.35-75.13z">
    </path>
  </svg>
</button>
<button type="button" yed-action="comment" title="Comment" aria-label="comment">
  <!--
    @license
    The following SVG image (fa-comment by Font Awesome) is "CC BY 4.0"-licensed.
    https://fontawesome.com/license/free
  -->
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path fill="currentColor" d="M256 32C114.6 32 0 125.1 0 240c0 49.6 21.4
    95 57 130.7C44.5 421.1 2.7 466 2.2 466.5c-2.2 2.3-2.8 5.7-1.5 8.7S4.8
    480 8 480c66.3 0 116-31.8 140.6-51.4 32.7 12.3 69 19.4 107.4 19.4 141.4
    0 256-93.1 256-208S397.4 32 256 32z"></path>
  </svg>
</button>
    `,
    style: `
:host {
  background-color: #bbb;
  border-radius: .2rem;
  box-shadow: 0 0 .1rem #000;
  white-space: nowrap;
  width: fit-content;
}
:host > button {
  cursor: pointer;
  background-color: #242424;
  background: linear-gradient(to bottom, #242424, rgba(36, 36, 36, 0.89));
  height: 2.7rem;
  min-width: 2.7rem;
  padding: 0;
  border: 0;
  border-left: 1px solid #444;
  border-right: 1px solid #000;
  color: #fff;
  font-weight: bold;
  font-size: 1rem;
  line-height: 2.7rem;
  float: left;
  box-sizing: border-box;
}
:host > button:hover {
  color: #ffa500;
  background: linear-gradient(to bottom, #242424, rgba(36, 36, 36, 0.93));
}
:host > button[active] {
  background: linear-gradient(to bottom, #242424, rgba(0, 0, 0, 0.89));
}
:host > button:first-child {
  border-left: none;
  border-top-left-radius: .2rem;
  border-bottom-left-radius: .2rem;
}
:host > button:last-child {
  border-right: none;
  border-top-right-radius: .2rem;
  border-bottom-right-radius: .2rem;
}
:host > button > svg {
  height: .8rem;
  margin-top: .93rem;
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
:host > button > * {
  user-select: none;
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
