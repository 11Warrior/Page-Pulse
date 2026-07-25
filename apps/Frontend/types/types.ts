export interface AuditReport {
  url: string;
  httpStatus: number;
  responseTimeMs: number;
  pageTitle: string | null;
  metaDescription: string | null;
  h1Count: number;
  imagesMissingAlt: number;
  imageCount: number;
  wordCount: number;
  contentType: string | null;
  fetchedAt: string;
  notice?: string;
}

export interface AuditError {
  error: string;
  code: string;
}

export type AuditResult =
  | { ok: true; report: AuditReport }
  | { ok: false; error: string; code: string };
