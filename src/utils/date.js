export function getRelativeTime(startDate, endDate = new Date()) {
  const diffSeconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000)
  if (diffSeconds < 0) {
    return null
  }
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 10) {
    return '刚刚'
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} 分钟前`
  }
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours} 小时前`
  }
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 10) {
    return `${diffDays} 天前`
  }
  return null
}
export function getFormattedDate(date) {
  const year = date.getFullYear() % 100
  const month = date.getMonth() + 1
  const day = date.getDate()
  const week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][date.getDay()]
  return `${year} 年 ${month} 月 ${day} 日 ${week}`
}
function padZero(number, len = 2) {
  return number.toString().padStart(len, '0')
}
export function getFormattedDateTime(date) {
  const year = date.getFullYear()
  const month = padZero(date.getMonth() + 1)
  const day = padZero(date.getDate())
  const hours = padZero(date.getHours())
  const minutes = padZero(date.getMinutes())
  return `${year} 年 ${month} 月 ${day} 日 ${hours}:${minutes}`
}
export function getDiffInDays(startDate, endDate = new Date()) {
  return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 86400))
}
export function getShortDate(date) {
  const month = padZero(date.getMonth() + 1)
  const day = padZero(date.getDate())
  return `${month}-${day}`
}
export function getDaysInYear(date) {
  const year = date.getFullYear()
  if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
    return 366
  }
  return 365
}
export function getStartOfYear(date) {
  const year = date.getFullYear()
  return new Date(year, 0, 1)
}
export function getStartOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}
//# sourceMappingURL=date.js.map
