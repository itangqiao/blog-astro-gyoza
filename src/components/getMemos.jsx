const result = await fetch('https://memos.casa.itangqiao.top:33333/api/v1/memos')
const data = await result.json()
const memos = await data.memos
console.log(memos)
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
const formatContent = (content) => {
  return content
    .replace(/\n/g, '<br />')
    .replace(/-/g, '&nbsp;&nbsp;•&nbsp;')
    .replace(/\t/g, '&nbsp;&nbsp;')
}
const MemoList = () => {
  return (
    <div>
      {memos.map((memo, index) => (
        <div className="border-solid border-b border-gray-800 mb-10" key={index}>
          <p className="text-sm text-gray-500">{formatDate(memo.createTime)}</p>

          <div
            className="text-base py-2 mb-2"
            dangerouslySetInnerHTML={{ __html: formatContent(memo.content) }}
          ></div>
          {memo.resources && (
            <div className="flex flex-nowrap gap-2">
              {memo.resources.map((resource, idx) => (
                <img
                  className="inline w-[49%] rounded-2xl"
                  key={idx}
                  src={resource.externalLink}
                  alt={`Resource ${idx}`}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
export default MemoList
//# sourceMappingURL=getMemos.jsx.map
