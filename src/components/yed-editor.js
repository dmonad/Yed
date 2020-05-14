
import * as component from 'lib0/component.js'
import * as dom from 'lib0/dom.js'
import * as pair from 'lib0/pair.js'
import { Yed } from '../Yed.js'

import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { style } from '../../dist/style.js'
import { defineYedToolbarBlock } from './toolbar-block.js'
import { defineYedToolbarInline } from './toolbar-inline.js'

export const defineYedComponent = component.createComponentDefiner(() => {
  const BlockToolbar = defineYedToolbarBlock()
  const InlineToolbar = defineYedToolbarInline()
  return component.createComponent('yed-editor', {
    template: '<div id="editor"></div>',
    style: `
:host {
  position: relative;
  display: block;
}
#editor {
  position: relative;
}
${style}
    `,
    onStateChange: (state, prevState, component) => {
      if (prevState === null) {
        const ydoc = new Y.Doc()
        const provider = new WebrtcProvider('yed-public', ydoc)
        const type = /** @type {Y.XmlFragment} */ (ydoc.get('prosemirror', Y.XmlFragment))
        const editor = /** @type {HTMLDivElement} */ (dom.querySelector(/** @type {ShadowRoot} */ (component.shadowRoot), '#editor'))
        const toolbarBlock = /** @type {HTMLDivElement} */ (new BlockToolbar())
        const toolbarInline = /** @type {HTMLDivElement} */ (new InlineToolbar())
        dom.setAttributes(toolbarInline, [pair.create('tabindex', '0')])
        dom.appendChild(editor, toolbarInline)
        const yed = new Yed({
          container: editor,
          type,
          awareness: provider.awareness,
          toolbarInline,
          toolbarBlock
        })
        // @ts-ignore
        toolbarBlock.updateState({ view: yed.view })
        // @ts-ignore
        toolbarInline.updateState({ view: yed.view })
      }
    }
  })
})
