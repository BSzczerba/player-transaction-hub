export const useCurrency = () => {
  const formatUSD = (amount: number): string =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)

  const monoClass = 'font-mono tabular-nums'

  return { formatUSD, monoClass }
}
