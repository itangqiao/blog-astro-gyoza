import { useEffect, useRef } from 'react'
import { init } from '@waline/client'
import '@waline/client/style'
export function Waline({ serverURL }) {
  const ref = useRef(null)
  useEffect(() => {
    const walineInst = init({
      el: ref.current,
      serverURL,
      dark: "[data-theme='dark']",
      login: 'force',
      imageUploader: false,
      search: false,
      locale: {
        placeholder: '发条友善的评论吧（支持 Markdown 语法）…',
      },
      emoji: ['//unpkg.com/@waline/emojis@1.1.0/bilibili'],
    })
    return () => {
      if (ref.current) {
        walineInst === null || walineInst === void 0 ? void 0 : walineInst.destroy()
      }
    }
  }, [serverURL])
  return <div ref={ref}></div>
}
//# sourceMappingURL=Waline.jsx.map
