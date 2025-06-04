import { useEffect, useState, useCallback, useMemo } from 'react'
import { ImageZoom } from '../components/ImageZoom.tsx'

interface Resource {
  name: string
  filename: string
  externalLink?: string
}

interface Memo {
  id: string
  content: string
  createTime: string
  resources?: Resource[]
}

const MemoList = () => {
  const [allMemos, setAllMemos] = useState<Memo[]>([]) // 存储所有数据
  const [displayedMemos, setDisplayedMemos] = useState<Memo[]>([]) // 当前显示的数据
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [displayCount, setDisplayCount] = useState(10) // 当前显示数量
  const [loadingMore, setLoadingMore] = useState(false)

  const ITEMS_PER_LOAD = 10 // 每次加载显示的数量

  // 获取备忘录数据
  const fetchMemos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('https://memos.casa.itangqiao.top:33333/api/v1/memos')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const allMemos = data.memos || []

      // 一次性获取所有数据，然后在前端实现分页显示
      setAllMemos(allMemos)
      setDisplayedMemos(allMemos.slice(0, 10)) // 初始显示前10条
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败')
    } finally {
      setLoading(false)
    }
  }, [])

  // 初始加载
  useEffect(() => {
    fetchMemos()
  }, [fetchMemos])

  // 加载更多（前端分页）
  const loadMore = useCallback(() => {
    if (loadingMore || displayCount >= allMemos.length) return

    setLoadingMore(true)

    // 模拟加载延迟，提供更好的用户体验
    setTimeout(() => {
      const newDisplayCount = Math.min(displayCount + ITEMS_PER_LOAD, allMemos.length)
      setDisplayedMemos(allMemos.slice(0, newDisplayCount))
      setDisplayCount(newDisplayCount)
      setLoadingMore(false)
    }, 300)
  }, [allMemos, displayCount, loadingMore])

  // 判断是否还有更多数据
  const hasMore = displayCount < allMemos.length

  // 滚动监听 - 懒加载
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 1000 && // 提前1000px触发
        !loadingMore &&
        hasMore
      ) {
        loadMore()
      }
    }

    const throttledHandleScroll = throttle(handleScroll, 200)
    window.addEventListener('scroll', throttledHandleScroll)

    return () => window.removeEventListener('scroll', throttledHandleScroll)
  }, [loadMore, loadingMore, hasMore])

  // 节流函数
  function throttle<T extends (...args: any[]) => any>(func: T, delay: number): T {
    let timeoutId: NodeJS.Timeout | null = null
    let lastExecTime = 0

    return ((...args: Parameters<T>) => {
      const currentTime = Date.now()

      if (currentTime - lastExecTime > delay) {
        func(...args)
        lastExecTime = currentTime
      } else {
        if (timeoutId) clearTimeout(timeoutId)
        timeoutId = setTimeout(
          () => {
            func(...args)
            lastExecTime = Date.now()
          },
          delay - (currentTime - lastExecTime),
        )
      }
    }) as T
  }

  // 优化的日期格式化函数
  const formatDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return '无效日期'
      }
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return '无效日期'
    }
  }, [])

  // 优化的内容格式化函数
  const formatContent = useCallback((content: string) => {
    if (!content) return ''
    return content
      .replace(/\n/g, '<br />')
      .replace(/-/g, '&nbsp;&nbsp;•&nbsp;')
      .replace(/\t/g, '&nbsp;&nbsp;')
  }, [])

  // 生成图片URL的函数
  const getImageUrl = useCallback((resource: Resource) => {
    return (
      resource.externalLink ||
      `https://memos.casa.itangqiao.top:33333/file/${resource.name}/${resource.filename}`
    )
  }, [])

  // 备忘录项组件 - 使用 memo 优化
  const MemoItem = useMemo(() => {
    return ({ memo, index }: { memo: Memo; index: number }) => (
      <div
        className="mb-10 border-b border-gray-800 border-solid animate-fadeIn"
        key={memo.id || index}
      >
        <p className="text-sm text-gray-500">{formatDate(memo.createTime)}</p>

        <div
          className="py-2 mb-2 text-base leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatContent(memo.content) }}
        />

        {memo.resources && memo.resources.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {memo.resources.map((resource, idx) => (
              <div key={`${memo.id}-${idx}`} className="flex-shrink-0">
                <ImageZoom
                  className="overflow-hidden transition-shadow duration-200 bg-black rounded-lg shadow-md hover:shadow-lg"
                  src={getImageUrl(resource)}
                  alt={`图片 ${idx + 1}`}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }, [formatDate, formatContent, getImageUrl])

  // 加载状态组件
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-8">
      <div className="w-8 h-8 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      <span className="ml-2 text-gray-500">加载中...</span>
    </div>
  )

  // 错误状态
  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="mb-4 text-red-500">加载失败: {error}</p>
        <button
          onClick={() => {
            setError(null)
            setDisplayCount(10)
            fetchMemos()
          }}
          className="px-4 py-2 text-white transition-colors bg-blue-500 rounded hover:bg-blue-600"
        >
          重新加载
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 初始加载状态 */}
      {loading && displayedMemos.length === 0 && <LoadingSpinner />}

      {/* 备忘录列表 */}
      {displayedMemos.length > 0 && (
        <div>
          {displayedMemos.map((memo, index) => (
            <MemoItem key={memo.id || index} memo={memo} index={index} />
          ))}
        </div>
      )}

      {/* 加载更多状态 */}
      {loadingMore && <LoadingSpinner />}

      {/* 没有更多数据 */}
      {!hasMore && displayedMemos.length > 0 && (
        <div className="py-8 text-center text-gray-500">
          已经到底了 ~ (共 {allMemos.length} 条记录)
        </div>
      )}

      {/* 空状态 */}
      {!loading && displayedMemos.length === 0 && !error && (
        <div className="py-8 text-center text-gray-500">暂无备忘录</div>
      )}

      {/* 手动加载更多按钮（可选） */}
      {hasMore && !loadingMore && displayedMemos.length > 0 && (
        <div className="py-4 text-center">
          <button
            onClick={loadMore}
            className="px-6 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            加载更多 ({displayedMemos.length}/{allMemos.length})
          </button>
        </div>
      )}

     
    </div>
  )
}

export default MemoList
