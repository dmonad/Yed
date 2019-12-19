/* eslint-env browser */

import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { Yed } from '../src/index.js'
import * as dom from 'lib0/dom.js'

const ydoc = new Y.Doc()
const provider = new WebrtcProvider('yed-public', ydoc)
const type = /** @type {Y.XmlFragment} */ (ydoc.get('prosemirror', Y.XmlFragment))

const yed = new Yed({
  container: /** @type {Element} */ (dom.getElementById('editor')),
  type,
  awareness: provider.awareness,
  toolbarInline: /** @type {HTMLElement} */ (dom.querySelector(dom.doc, '.yed-toolbar-inline')),
  toolbarBlock: /** @type {HTMLElement} */ (dom.querySelector(dom.doc, '.yed-toolbar-block'))
})

document.body.insertBefore(yed.container, null)

// @ts-ignore
window.example = { provider, ydoc, type, yed }
