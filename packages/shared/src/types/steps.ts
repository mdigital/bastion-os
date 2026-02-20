export const STEPS = [
  { id: 'upload', label: 'Upload' },
  { id: 'keyInfo', label: 'Key Info' },
  { id: 'triage', label: 'Triage' },
  { id: 'sections', label: 'Enhancement' },
] as const

export type Step = (typeof STEPS)[number]['id']
