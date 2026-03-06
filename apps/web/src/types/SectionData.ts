export interface SectionData {
  id?: string
  title: string
  content: string
  missing: string[]
  enhancements: Array<{ text: string; source: string }>
  questions: string[]
}
