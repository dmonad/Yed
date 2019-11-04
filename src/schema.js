import { Schema } from 'prosemirror-model'
import { tableNodes as createTableNodes } from 'prosemirror-tables'
import * as object from 'lib0/object.js'

const calcYchangeDomAttrs = (attrs, domAttrs = {}) => {
  domAttrs = object.assign({}, domAttrs)
  if (attrs.ychange !== null) {
    domAttrs.ychange_user = attrs.ychange.user
    domAttrs.ychange_state = attrs.ychange.state
  }
  return domAttrs
}

const ychangeDefault = { default: null }

export const nodesSpec = {
  doc: {
    content: 'h1 | h1 (block | heading)* p'
  },

  p: {
    attrs: { ychange: ychangeDefault },
    content: 'inline*',
    group: 'block',
    parseDOM: [{ tag: 'p' }],
    toDOM: node => ['p', calcYchangeDomAttrs(node.attrs), 0]
  },

  blockquote: {
    attrs: { ychange: ychangeDefault },
    content: 'block+',
    group: 'block',
    defining: true,
    parseDOM: [{ tag: 'blockquote' }],
    toDOM: node => ['blockquote', calcYchangeDomAttrs(node.attrs), 0]
  },

  hr: {
    attrs: { ychange: ychangeDefault },
    group: 'block',
    parseDOM: [{ tag: 'hr' }],
    toDOM: node => ['hr', calcYchangeDomAttrs(node.attrs)]
  },

  h1: {
    attrs: {
      ychange: ychangeDefault
    },
    content: 'inline*',
    defining: true,
    parseDOM: [
      { tag: 'h1' },
    ],
    toDOM: () => ['h1', 0]
  },

  heading: {
    attrs: {
      level: { default: 1 },
      ychange: ychangeDefault
    },
    content: 'inline*',
    defining: true,
    parseDOM: [
      { tag: 'h2', attrs: { level: 2 } },
      { tag: 'h3', attrs: { level: 3 } },
      { tag: 'h4', attrs: { level: 4 } },
      { tag: 'h5', attrs: { level: 5 } },
      { tag: 'h6', attrs: { level: 6 } }],
    toDOM: node => ['h' + node.attrs.level, calcYchangeDomAttrs(node.attrs), 0]
  },


  codeblock: {
    attrs: { ychange: ychangeDefault },
    content: 'text*',
    marks: '',
    group: 'block',
    code: true,
    defining: true,
    parseDOM: [{ tag: 'pre', preserveWhitespace: 'full' }],
    toDOM: node => ['pre', calcYchangeDomAttrs(node.attrs), ['code', 0]]
  },

  text: {
    group: 'inline'
  },

  img: {
    inline: true,
    attrs: {
      ychange: ychangeDefault,
      src: {},
      alt: { default: null },
      title: { default: null }
    },
    group: 'inline',
    draggable: true,
    parseDOM: [{
      tag: 'img[src]',
      getAttrs: dom => ({
        src: dom.getAttribute('src'),
        title: dom.getAttribute('title'),
        alt: dom.getAttribute('alt')
      })
    }],
    toDOM: node =>
      ['img', calcYchangeDomAttrs(node.attrs, {
        src: node.attrs.src,
        title: node.attrs.title,
        alt: node.attrs.alt
      })]
  },

  li: {
    parseDOM: [{ tag: 'li' }],
    toDOM: () => ['li', 0],
    content: 'block+',
    defining: true
  },

  ol: {
    parseDOM: [{ tag: 'ol' }],
    toDOM: () => ['ol', 0],
    content: "li+",
    group: 'block'
  },

  ul: {
    parseDOM: [{ tag: 'ul' }],
    toDOM: () => ['ul', 0],
    content: "li+",
    group: 'block'
  },

  br: {
    inline: true,
    group: 'inline',
    selectable: false,
    parseDOM: [{ tag: 'br' }],
    toDOM: () => ['br']
  }
}

const marksSpec = {
  link: {
    attrs: {
      href: {},
      title: { default: null }
    },
    inclusive: false,
    parseDOM: [{ tag: 'a[href]',
      getAttrs (dom) {
        return { href: dom.getAttribute('href'), title: dom.getAttribute('title') }
      } }],
    toDOM: node => ['a', node.attrs, 0]
  },

  em: {
    parseDOM: [{ tag: 'i' }, { tag: 'em' }, { style: 'font-style=italic' }],
    toDOM: () => ['em', 0]
  },

  strong: {
    parseDOM: [{ tag: 'strong' },
      // This works around a Google Docs misbehavior where
      // pasted content will be inexplicably wrapped in `<b>`
      // tags with a font-weight normal.
      { tag: 'b', getAttrs: node => node.style.fontWeight !== 'normal' && null },
      { style: 'font-weight', getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null }],
    toDOM: () => ['strong', 0]
  },

  code: {
    parseDOM: [{ tag: 'code' }],
    toDOM: () => ['code', 0]
  },

  ychange: {
    attrs: {
      user: { default: null },
      state: { default: null }
    },
    inclusive: false,
    parseDOM: [{ tag: 'ychange' }],
    toDOM: node =>
      ['ychange', { ychange_user: node.attrs.user, ychange_state: node.attrs.state }, 0]
  }
}

const tableNodes = createTableNodes({
  tableGroup: "block",
  cellContent: "block+",
  cellAttributes: {
    background: {
      default: null,
      getFromDOM: dom => /** @type {HTMLElement} */ (dom).style.backgroundColor || null,
      setDOMAttr: (value, attrs) => {
        if (value) {
          attrs.style = (attrs.style || "") + `background-color: ${value};`
        }
      }
    }
  }
})

// @ts-ignore
export const schema = new Schema({ nodes: object.assign(nodesSpec, tableNodes), marks: marksSpec })
export const nodes = schema.nodes
export const marks = schema.marks

const {
  p, doc, blockquote, hr, heading, codeblock, text, img, br, ul, ol, li, table, table_cell, table_row, table_header, h1
} = nodes

export { p, doc, blockquote, hr, heading, codeblock, text, img, br, ul, ol, li, table, table_cell, table_row, table_header, h1 }

const {
  link, em, strong, code, ychange
} = marks

export { link, em, strong, code, ychange }
