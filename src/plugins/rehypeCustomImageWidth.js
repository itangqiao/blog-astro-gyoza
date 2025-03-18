import { visit } from 'unist-util-visit'

export default function rehypeCustomImageWidth() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'img') {
        const altText = node.properties.alt || ''
        const match = altText.match(/^\|(\d+)$/) // 匹配 |100 格式
        if (match) {
          const width = match[1]
          node.properties.width = width
        }
      }
    })
  }
}
