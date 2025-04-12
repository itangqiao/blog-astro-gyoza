import { getRelativeTime, getFormattedDate } from '@/utils/date'
import { useEffect, useState } from 'react'
export function RelativeDate({ date }) {
  const [dateStr, setDateStr] = useState(getFormattedDate(date))
  useEffect(() => {
    const relative = getRelativeTime(date)
    if (relative) {
      setDateStr(relative)
    }
  }, [date])
  return <span>{dateStr}</span>
}
//# sourceMappingURL=RelativeDate.jsx.map
