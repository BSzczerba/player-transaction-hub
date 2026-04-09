const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export const useRelativeTime = () => {
  const fromNow = (dateString: string): string => {
    const diff = new Date(dateString).getTime() - Date.now()
    const seconds = Math.round(diff / 1000)
    if (Math.abs(seconds) < 60) return rtf.format(seconds, 'second')
    const minutes = Math.round(seconds / 60)
    if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute')
    const hours = Math.round(minutes / 60)
    if (Math.abs(hours) < 24) return rtf.format(hours, 'hour')
    return rtf.format(Math.round(hours / 24), 'day')
  }

  return { fromNow }
}
