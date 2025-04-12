import { useContext, useId, useRef } from 'react'
import { useSetAtom } from 'jotai'
import { modalStackAtom } from '@/store/modalStack'
import { CurrentModalContext } from './context'
export function useModal() {
  const id = useId()
  const currentCount = useRef(0)
  const setModalStack = useSetAtom(modalStackAtom)
  return {
    present(props) {
      var _a
      const modalId = `${id}-${currentCount.current++}`
      const modalProps = Object.assign(Object.assign({}, props), {
        id: (_a = props.id) !== null && _a !== void 0 ? _a : modalId,
      })
      setModalStack((stack) => [...stack, modalProps])
      return () => {
        setModalStack((stack) => stack.filter((modal) => modal.id !== modalProps.id))
      }
    },
  }
}
export function useCurrentModal() {
  return useContext(CurrentModalContext)
}
//# sourceMappingURL=hooks.js.map
