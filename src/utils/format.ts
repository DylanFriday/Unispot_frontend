export const formatDate = (
  value: string,
  options?: Intl.DateTimeFormatOptions
) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(
    'en-US',
    options ?? { dateStyle: 'medium', timeStyle: 'short' }
  ).format(date)
}
