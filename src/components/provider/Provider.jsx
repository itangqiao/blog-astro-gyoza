import { HeaderMetaInfoProvider } from './HeaderMetaInfoProvider'
import { PageScrollInfoProvider } from './PageScrollInfoProvider'
import { ThemeProvider } from './ThemeProvider'
import { ViewportProvider } from './ViewportProvider'
export function Provider(props) {
  return (
    <>
      <HeaderMetaInfoProvider {...props} />
      <PageScrollInfoProvider />
      <ThemeProvider />
      <ViewportProvider />
    </>
  )
}
//# sourceMappingURL=Provider.jsx.map
