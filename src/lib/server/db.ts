// ─────────────────────────────────────────────────────────────────────────────
// Server database — MongoDB. Works on serverless hosts (Vercel/Netlify) because
// data lives in a hosted database, not on the function's disk. Set MONGODB_URI
// (e.g. a free MongoDB Atlas cluster). The client connection is cached globally
// so serverless invocations reuse it instead of reconnecting every request.
// ─────────────────────────────────────────────────────────────────────────────

import "server-only";
import { MongoClient, type Db } from "mongodb";
import { PLAN_PRICES } from "@/lib/types";
import type { Plan, SubscriptionStatus, Resume, CoverLetter, PaymentRequest } from "@/lib/types";

export interface ServerUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  plan: Plan;
  subscriptionStatus: SubscriptionStatus;
  planActivatedAt: number | null;
  planExpiresAt: number | null;
  createdAt: number;
  lastSeenAt: number;
  resetOtpHash?: string;
  resetOtpExpires?: number;
}

const URI = process.env.MONGODB_URI;
// Guard against a mis-pasted MONGODB_DB (e.g. the whole connection string). Mongo
// database names can't contain / \ . " $ * < > : | ? — fall back to a safe default.
const rawDbName = process.env.MONGODB_DB || "nexthireai";
const DB_NAME = /^[A-Za-z0-9_-]{1,63}$/.test(rawDbName) ? rawDbName : "nexthireai";
export const dbConfigured = Boolean(URI);

// Cache the client across hot reloads (dev) and warm invocations (serverless).
declare global {
  // eslint-disable-next-line no-var
  var _nhMongo: Promise<MongoClient> | undefined;
}

function clientPromise(): Promise<MongoClient> {
  if (!URI) throw new Error("MONGODB_URI is not set. Add your MongoDB connection string.");
  if (!global._nhMongo) global._nhMongo = new MongoClient(URI).connect();
  return global._nhMongo;
}

async function getDb(): Promise<Db> {
  return (await clientPromise()).db(DB_NAME);
}

export const newId = (prefix = "id") =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

// ── Users ─────────────────────────────────────────────────────────────────────
export async function findUserByEmail(email: string): Promise<ServerUser | undefined> {
  const db = await getDb();
  const d = await db.collection("users").findOne({ emailLower: email.toLowerCase() });
  return (d as unknown as ServerUser) ?? undefined;
}
export async function getUser(id: string): Promise<ServerUser | undefined> {
  const db = await getDb();
  const d = await db.collection("users").findOne({ _id: id as never });
  return (d as unknown as ServerUser) ?? undefined;
}
export async function createUser(u: ServerUser): Promise<ServerUser> {
  const db = await getDb();
  await db.collection("users").insertOne({ _id: u.id as never, emailLower: u.email.toLowerCase(), ...u });
  return u;
}
export async function touchUser(id: string) {
  const db = await getDb();
  await db.collection("users").updateOne({ _id: id as never }, { $set: { lastSeenAt: Date.now() } });
}
export async function setResetOtp(id: string, hash: string, expires: number) {
  const db = await getDb();
  await db.collection("users").updateOne({ _id: id as never }, { $set: { resetOtpHash: hash, resetOtpExpires: expires } });
}
export async function updatePassword(id: string, passwordHash: string) {
  const db = await getDb();
  await db
    .collection("users")
    .updateOne({ _id: id as never }, { $set: { passwordHash }, $unset: { resetOtpHash: "", resetOtpExpires: "" } });
}
export async function updateUserName(id: string, name: string) {
  const db = await getDb();
  await db.collection("users").updateOne({ _id: id as never }, { $set: { name } });
}

// ── Subscriptions ────────────────────────────────────────────────────────────
export async function grantPlan(uid: string, plan: Plan): Promise<ServerUser | undefined> {
  const db = await getDb();
  const set =
    plan === "free"
      ? { plan, subscriptionStatus: "inactive" as SubscriptionStatus, planActivatedAt: null, planExpiresAt: null }
      : (() => {
          const now = Date.now();
          return {
            plan,
            subscriptionStatus: "active" as SubscriptionStatus,
            planActivatedAt: now,
            planExpiresAt: now + PLAN_PRICES[plan].months * 30 * 24 * 60 * 60 * 1000,
          };
        })();
  await db.collection("users").updateOne({ _id: uid as never }, { $set: set });
  return getUser(uid);
}

// ── Resumes ────────────────────────────────────────────────────────────────────
export async function listResumes(uid: string): Promise<Resume[]> {
  const db = await getDb();
  return (await db.collection("resumes").find({ ownerUid: uid }).sort({ updatedAt: -1 }).toArray()) as unknown as Resume[];
}
export async function getResume(uid: string, id: string): Promise<Resume | undefined> {
  const db = await getDb();
  const d = await db.collection("resumes").findOne({ _id: id as never, ownerUid: uid });
  return (d as unknown as Resume) ?? undefined;
}
export async function upsertResume(resume: Resume & { ownerUid: string }) {
  const db = await getDb();
  await db.collection("resumes").replaceOne({ _id: resume.id as never }, { _id: resume.id as never, ...resume }, { upsert: true });
}
export async function deleteResume(uid: string, id: string) {
  const db = await getDb();
  await db.collection("resumes").deleteOne({ _id: id as never, ownerUid: uid });
}

// ── Cover letters ────────────────────────────────────────────────────────────
export async function listCoverLetters(uid: string): Promise<CoverLetter[]> {
  const db = await getDb();
  return (await db.collection("coverLetters").find({ ownerUid: uid }).sort({ updatedAt: -1 }).toArray()) as unknown as CoverLetter[];
}
export async function getCoverLetter(uid: string, id: string): Promise<CoverLetter | undefined> {
  const db = await getDb();
  const d = await db.collection("coverLetters").findOne({ _id: id as never, ownerUid: uid });
  return (d as unknown as CoverLetter) ?? undefined;
}
export async function upsertCoverLetter(cl: CoverLetter & { ownerUid: string }) {
  const db = await getDb();
  await db.collection("coverLetters").replaceOne({ _id: cl.id as never }, { _id: cl.id as never, ...cl }, { upsert: true });
}
export async function deleteCoverLetter(uid: string, id: string) {
  const db = await getDb();
  await db.collection("coverLetters").deleteOne({ _id: id as never, ownerUid: uid });
}

// ── Payment requests ─────────────────────────────────────────────────────────
export async function savePaymentRequest(pr: PaymentRequest) {
  const db = await getDb();
  await db.collection("paymentRequests").replaceOne({ _id: pr.id as never }, { _id: pr.id as never, ...pr }, { upsert: true });
}
export async function getPaymentRequest(id: string): Promise<PaymentRequest | undefined> {
  const db = await getDb();
  const d = await db.collection("paymentRequests").findOne({ _id: id as never });
  return (d as unknown as PaymentRequest) ?? undefined;
}
export async function listAllPaymentRequests(): Promise<PaymentRequest[]> {
  const db = await getDb();
  const all = (await db.collection("paymentRequests").find({}).toArray()) as unknown as PaymentRequest[];
  return all.sort((a, b) => {
    if (a.status !== b.status) return a.status === "pending" ? -1 : 1;
    return b.createdAt - a.createdAt;
  });
}
export async function listUserPaymentRequests(uid: string): Promise<PaymentRequest[]> {
  const db = await getDb();
  const all = (await db.collection("paymentRequests").find({ uid }).toArray()) as unknown as PaymentRequest[];
  return all.sort((a, b) => b.createdAt - a.createdAt);
}
export async function setPaymentRequestStatus(id: string, status: PaymentRequest["status"]) {
  const db = await getDb();
  await db.collection("paymentRequests").updateOne({ _id: id as never }, { $set: { status, reviewedAt: Date.now() } });
}

// ── Analytics + admin snapshot ───────────────────────────────────────────────
export async function bumpVisits() {
  const db = await getDb();
  const today = new Date().toISOString().slice(0, 10);
  await db
    .collection("meta")
    .updateOne({ _id: "analytics" as never }, { $inc: { visits: 1, [`daily.${today}`]: 1 } }, { upsert: true });
}

export async function adminSnapshot() {
  const db = await getDb();
  const [users, resumeCount, coverLetterCount, paymentRequests, meta] = await Promise.all([
    db.collection("users").find({}).toArray(),
    db.collection("resumes").countDocuments(),
    db.collection("coverLetters").countDocuments(),
    db.collection("paymentRequests").find({}).toArray(),
    db.collection("meta").findOne({ _id: "analytics" as never }),
  ]);
  return {
    users: users as unknown as ServerUser[],
    resumeCount,
    coverLetterCount,
    paymentRequests: paymentRequests as unknown as PaymentRequest[],
    visits: (meta?.visits as number) ?? 0,
  };
}

export type { Plan, Resume, CoverLetter, PaymentRequest, SubscriptionStatus };
