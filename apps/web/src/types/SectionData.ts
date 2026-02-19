export interface SectionData {
  title: string
  content: string
  missing: string[]
  enhancements: Array<{ text: string; source: string }>
  questions: string[]
}
