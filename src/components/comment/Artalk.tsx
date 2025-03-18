import { useEffect, useRef } from 'react'
import Artalk from 'artalk'
import 'artalk/dist/Artalk.css'

export function ArtalkComponent({ serverURL }: { serverURL: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const artalk = Artalk.init({
      el: ref.current!, // 挂载的 DOM 元素
      pageKey: '/post/1', // 固定链接
      pageTitle: 'new精致的生活', // 页面标题
      darkMode: true,
      site: 'new精致的生活',
      server: 'https://artalk.casa.itangqiao.top:33333', // 后端地址
    })

    return () => {
      artalk.destroy()
    }
  }, [serverURL])

  return <div ref={ref}></div>
}
