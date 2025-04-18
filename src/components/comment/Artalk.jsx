import { useEffect, useRef } from 'react'
import Artalk from 'artalk'
import 'artalk/dist/Artalk.css'
export function ArtalkComponent({ serverURL }) {
  const ref = useRef(null)
  useEffect(() => {
    const artalk = Artalk.init({
      el: ref.current,
      pageTitle: 'new精致的生活',
      darkMode: 'auto',
      site: 'new精致的生活',
      server: 'https://artalk.casa.itangqiao.top:33333',
    })
    return () => {
      artalk.destroy()
    }
  }, [serverURL])
  return <div ref={ref}></div>
}
//# sourceMappingURL=Artalk.jsx.map
