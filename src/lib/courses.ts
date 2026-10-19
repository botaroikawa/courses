export const courseLevels = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
] as const
export type CourseLevel = (typeof courseLevels)[number]['value']
export const courseLevelValues = courseLevels.map((level) => level.value)

type RelationValue = string | { id: string } | null | undefined

export const relationId = (value: RelationValue) =>
  value && typeof value === 'object' ? value.id : (value ?? null)

// Lesson ids of a course's syllabus, in order
export function lessonIdsOf(modules: { lessons?: RelationValue[] | null }[] | null | undefined) {
  return (modules ?? []).flatMap((module) =>
    (module.lessons ?? []).map(relationId).filter((id) => id !== null),
  )
}

// Ids that appear more than once, each reported once
export function duplicatesOf<T>(values: T[]): T[] {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))]
}
