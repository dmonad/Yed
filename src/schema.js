import { Schema } from 'prosemirror-model'

const brDOM = ['br']

const calcYchangeDomAttrs = (attrs, domAttrs = {}) => {
  domAttrs = Object.assign({}, domAttrs)
  if (attrs.ychange !== null) {
    domAttrs.ychange_user = attrs.ychange.user
    domAttrs.ychange_state = attrs.ychange.state
  }
  return domAttrs
}

const ychange = { default: null }

export const nodes = {
  doc: {
    content: 'block+'
  },

  paragraph: {
    attrs: { ychange },
    content: 'inline*',
    group: 'block',
    parseDOM: [{ tag: 'p' }],
    toDOM (node) { return ['p', calcYchangeDomAttrs(node.attrs), 0] }
  },

  blockquote: {
    attrs: { ychange },
    content: 'block+',
    group: 'block',
    defining: true,
    parseDOM: [{ tag: 'blockquote' }],
    toDOM (node) { return ['blockquote', calcYchangeDomAttrs(node.attrs), 0] }
  },

  horizontal_rule: {
    attrs: { ychange },
    group: 'block',
    parseDOM: [{ tag: 'hr' }],
    toDOM (node) {
      return ['hr', calcYchangeDomAttrs(node.attrs)]
    }
  },

  heading: {
    attrs: {
      level: { default: 1 },
      ychange
    },
    content: 'inline*',
    group: 'block',
    defining: true,
    parseDOM: [{ tag: 'h1', attrs: { level: 1 } },
      { tag: 'h2', attrs: { level: 2 } },
      { tag: 'h3', attrs: { level: 3 } },
      { tag: 'h4', attrs: { level: 4 } },
      { tag: 'h5', attrs: { level: 5 } },
      { tag: 'h6', attrs: { level: 6 } }],
    toDOM (node) { return ['h' + node.attrs.level, calcYchangeDomAttrs(node.attrs), 0] }
  },

  code_block: {
    attrs: { ychange },
    content: 'text*',
    marks: '',
    group: 'block',
    code: true,
    defining: true,
    parseDOM: [{ tag: 'pre', preserveWhitespace: 'full' }],
    toDOM (node) { return ['pre', calcYchangeDomAttrs(node.attrs), ['code', 0]] }
  },

  text: {
    group: 'inline'
  },

  image: {
    inline: true,
    attrs: {
      ychange,
      src: {},
      alt: { default: null },
      title: { default: null }
    },
    group: 'inline',
    draggable: true,
    parseDOM: [{ tag: 'img[src]',
      getAttrs (dom) {
        return {
          src: dom.getAttribute('src'),
          title: dom.getAttribute('title'),
          alt: dom.getAttribute('alt')
        }
      } }],
    toDOM (node) {
      const domAttrs = {
        src: node.attrs.src,
        title: node.attrs.title,
        alt: node.attrs.alt
      }
      return ['img', calcYchangeDomAttrs(node.attrs, domAttrs)]
    }
  },

  hard_break: {
    inline: true,
    group: 'inline',
    selectable: false,
    parseDOM: [{ tag: 'br' }],
    toDOM () { return brDOM }
  }
}

const emDOM = ['em', 0]; const strongDOM = ['strong', 0]; const codeDOM = ['code', 0]

// :: Object [Specs](#model.MarkSpec) for the marks in the schema.
export const marks = {
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
    toDOM (node) { return ['a', node.attrs, 0] }
  },

  em: {
    parseDOM: [{ tag: 'i' }, { tag: 'em' }, { style: 'font-style=italic' }],
    toDOM () { return emDOM }
  },

  strong: {
    parseDOM: [{ tag: 'strong' },
      // This works around a Google Docs misbehavior where
      // pasted content will be inexplicably wrapped in `<b>`
      // tags with a font-weight normal.
      { tag: 'b', getAttrs: node => node.style.fontWeight !== 'normal' && null },
      { style: 'font-weight', getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null }],
    toDOM () { return strongDOM }
  },

  code: {
    parseDOM: [{ tag: 'code' }],
    toDOM () { return codeDOM }
  },

  ychange: {
    attrs: {
      user: { default: null },
      state: { default: null }
    },
    inclusive: false,
    parseDOM: [{ tag: 'ychange' }],
    toDOM (node) {
      return ['ychange', { ychange_user: node.attrs.user, ychange_state: node.attrs.state }, 0]
    }
  }
}

export const schema = new Schema({ nodes, marks })
