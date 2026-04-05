import { useState, useEffect } from 'react'

/**
 * 对值进行防抖处理，在 delay 毫秒内没有新变化时才更新返回值。
 * 适合搜索框：用户停止输入后才触发 API 请求。
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
