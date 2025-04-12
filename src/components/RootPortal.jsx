import { createPortal } from 'react-dom'
export function RootPortal({ to = document.body, children }) {
  return createPortal(children, to)
}
//# sourceMappingURL=RootPortal.jsx.map
