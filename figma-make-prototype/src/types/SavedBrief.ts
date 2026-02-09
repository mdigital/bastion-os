import { KeyInfo } from './KeyInfo';
import { SectionData } from './SectionData';

export interface SavedBrief {
  id: string;
  client: string;
  jobToBeDone: string;
  budget: string;
  dueDate: string;
  status: 'draft' | 'finalized';
  lastModified: string;
  leadDepartment: string;
  keyInfo: KeyInfo;
  sections: SectionData[];
  archived?: boolean;
}