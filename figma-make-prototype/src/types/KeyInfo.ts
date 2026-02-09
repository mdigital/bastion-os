export interface KeyInfo {
  client: string;
  jobToBeDone: string;
  budget: string;
  dueDate: string;
  liveDate: string;
  campaignDuration: string;
  briefLevel: 'New Project Brief' | 'Fast Forward Brief';
}
