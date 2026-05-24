export type FeedbackType = "GENERAL" | "BUG" | "FEATURE_REQUEST" | "UX";

export type FeedbackStatus =
  | "OPEN"
  | "REVIEWED"
  | "PLANNED"
  | "RESOLVED"
  | "REJECTED";

export interface SubmitFeedbackInput {
  type: FeedbackType;
  title: string;
  message: string;
  rating?: number | null;
  pageUrl?: string | null;
}

export interface SubmitFeedbackResponse {
  message: string;
}

export interface FeedbackUser {
  id: string;
  username: string;
  handle: string;
  avatarUrl: string | null;
}

export interface AdminFeedbackItem {
  id: string;
  type: FeedbackType;
  status: FeedbackStatus;
  title: string;
  message: string;
  rating: number | null;
  pageUrl: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
  user: FeedbackUser | null;
}

export interface AdminFeedbackResponse {
  feedback: AdminFeedbackItem[];
  nextCursor?: string | null;
  meta: { total: number };
}

export interface AdminFeedbackFilters {
  status?: FeedbackStatus;
  type?: FeedbackType;
  limit?: number;
  cursor?: string;
}

export interface UpdateFeedbackStatusResponse {
  message: string;
  feedback: AdminFeedbackItem;
}

export const FEEDBACK_TYPE_OPTIONS: { value: FeedbackType; labelKey: string }[] = [
  { value: "GENERAL", labelKey: "feedback.types.general" },
  { value: "BUG", labelKey: "feedback.types.bug" },
  { value: "FEATURE_REQUEST", labelKey: "feedback.types.featureRequest" },
  { value: "UX", labelKey: "feedback.types.ux" },
];

export const FEEDBACK_STATUS_OPTIONS: {
  value: FeedbackStatus;
  labelKey: string;
}[] = [
  { value: "OPEN", labelKey: "feedback.status.open" },
  { value: "REVIEWED", labelKey: "feedback.status.reviewed" },
  { value: "PLANNED", labelKey: "feedback.status.planned" },
  { value: "RESOLVED", labelKey: "feedback.status.resolved" },
  { value: "REJECTED", labelKey: "feedback.status.rejected" },
];
