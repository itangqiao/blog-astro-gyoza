// import Zmage from 'react-zmage'
import Zoom from 'react-medium-image-zoom'
import '../styles/medium-zoom.css';

// export default function ZoomableImage({ src, alt = '', width = '200px' }) {
//   return <Zmage src={src} alt={alt} style={{ width, cursor: 'zoom-in', borderRadius: '8px' }} />
// }

export const ImageZoom = ({ src }: any) => (
  <Zoom>
    <img
      className="object-contain w-auto h-full rounded-lg cursor-pointer object-fit dark:border-zinc-800 hover:opacity-80 max-h-80 grow max-w-80"
      src={src}
      loading="lazy"
      decoding="async"
    />
  </Zoom>
)
