// ─────────────────────────────────────────────────────────────────────────────
// Shared domain types for NextHireAI.
// ─────────────────────────────────────────────────────────────────────────────

export type Plan = "free" | "pro_1m" | "pro_3m";

export type SubscriptionStatus = "inactive" | "active" | "expired" | "cancelled";

export interface AppUser {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
  emailVerified: boolean;
  plan: Plan;
  subscriptionStatus: SubscriptionStatus;
  planExpiresAt: number | null; // epoch ms
  createdAt: number;
}

export type TemplateId =
  | "modern"
  | "professional"
  | "minimal"
  | "creative"
  | "executive"
  | "student";

export const PREMIUM_TEMPLATES: TemplateId[] = ["creative", "executive"];

export interface ResumeExperience {
  id: string;
  role: string;
  company: string;
  period: string;
  bullets: string[];
}

export interface ResumeEducation {
  id: string;
  degree: string;
  school: string;
  period: string;
}

export interface ResumeData {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  projects: { id: string; name: string; description: string }[];
}

export interface Resume {
  id: string;
  title: string;
  template: TemplateId;
  data: ResumeData;
  createdAt: number;
  updatedAt: number;
}

export type CoverLetterStyle = "professional" | "enthusiastic" | "concise" | "creative";

export interface CoverLetter {
  id: string;
  title: string;
  company: string;
  role: string;
  style: CoverLetterStyle;
  body: string;
  createdAt: number;
  updatedAt: number;
}

export interface AtsReport {
  score: number;
  summary: string;
  missingKeywords: string[];
  grammar: string[];
  tips: string[];
}

/** Free tier can create up to this many resumes; Pro is unlimited. */
export const FREE_RESUME_LIMIT = 2;

export type PaymentRequestStatus = "pending" | "approved" | "rejected";

export interface PaymentRequest {
  id: string;
  uid: string;
  email: string;
  name: string;
  plan: Exclude<Plan, "free">;
  amount: number;
  utr: string; // UPI transaction reference entered by the buyer
  screenshot: string; // data URL of the payment screenshot
  status: PaymentRequestStatus;
  createdAt: number;
  reviewedAt?: number;
}

export const PLAN_LABELS: Record<Plan, string> = {
  free: "Free",
  pro_1m: "Pro · 1 Month",
  pro_3m: "Pro · 3 Months",
};

export const PLAN_PRICES: Record<Exclude<Plan, "free">, { inr: number; months: number; label: string }> = {
  pro_1m: { inr: 699, months: 1, label: "₹699" },
  pro_3m: { inr: 1299, months: 3, label: "₹1,299" },
};

/** A user is Pro if status is active and not past expiry. */
export function isProUser(u: Pick<AppUser, "plan" | "subscriptionStatus" | "planExpiresAt"> | null): boolean {
  if (!u || u.plan === "free") return false;
  if (u.subscriptionStatus !== "active") return false;
  if (u.planExpiresAt && Date.now() > u.planExpiresAt) return false;
  return true;
}

/** The single admin account (full access without a subscription). */
export const ADMIN_EMAIL = "as3331733@gmail.com";

export function isAdminUser(u: { email?: string } | null | undefined): boolean {
  return !!u?.email && u.email.toLowerCase() === ADMIN_EMAIL;
}

/**
 * Who may use the app. Paid-only: only active Pro subscribers — plus the admin.
 * No free access to anyone else.
 */
export function hasAppAccess(u: AppUser | null): boolean {
  return isProUser(u) || isAdminUser(u);
}
