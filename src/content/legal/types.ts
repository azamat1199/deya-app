export type LegalBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "section"; heading: string; blocks: LegalBlock[] };

export interface LegalPageContent {
  title: string;
  blocks: LegalBlock[];
}
