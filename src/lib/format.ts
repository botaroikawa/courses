// "1 h 20 min" in the visitor's language
export function formatMinutes(minutes: number, locale: string): string {
  const duration = { hours: Math.floor(minutes / 60), minutes: minutes % 60 }
  // Intl.DurationFormat is not in TypeScript's lib yet
  const DurationFormat = (
    Intl as unknown as {
      DurationFormat?: new (
        locale: string,
        options: object,
      ) => { format: (value: object) => string }
    }
  ).DurationFormat
  if (DurationFormat) return new DurationFormat(locale, { style: 'short' }).format(duration)
  return duration.hours ? `${duration.hours} h ${duration.minutes} min` : `${duration.minutes} min`
}
