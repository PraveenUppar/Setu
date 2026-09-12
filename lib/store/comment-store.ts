import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Role } from '../review/types';

/**
 * Section-anchored comment threads.
 *
 * One growing JSON array PER section — comments accumulate, so unlike
 * `risk-dismissal-store.ts` there is no single "current" state for the
 * section as a whole. A single comment DOES have a current state (resolved
 * or not): `resolveComment` appends a new event carrying the SAME comment
 * id rather than mutating the original in place, the same "a reversal is
 * itself a logged event" discipline as everywhere else in this store
 * family — `readThread` folds that down to one row per id, latest wins.
 */

const root = () => process.env.SETU_DATA_DIR ?? '.data';
const commentsRoot = () => join(root(), 'comments');

function safeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_.-]/g, '_');
}
const threadFile = (sectionId: string) => join(commentsRoot(), `${safeId(sectionId)}.json`);

export interface CommentEvent {
  id: string;
  sectionId: string;
  author: Role;
  text: string;
  createdAt: string;
  resolved: boolean;
}

function ensure() {
  mkdirSync(commentsRoot(), { recursive: true });
}

function readEvents(sectionId: string): CommentEvent[] {
  ensure();
  if (!existsSync(threadFile(sectionId))) return [];
  return JSON.parse(readFileSync(threadFile(sectionId), 'utf8')) as CommentEvent[];
}

function writeEvents(sectionId: string, events: CommentEvent[]) {
  ensure();
  writeFileSync(threadFile(sectionId), JSON.stringify(events, null, 2));
}

export function addComment(sectionId: string, author: Role, text: string): CommentEvent {
  const events = readEvents(sectionId);
  const comment: CommentEvent = {
    id: `${safeId(sectionId)}-c${events.length + 1}`,
    sectionId,
    author,
    text,
    createdAt: new Date().toISOString(),
    resolved: false,
  };
  events.push(comment);
  writeEvents(sectionId, events);
  return comment;
}

/** A resolution is a new event with the same comment id — the original post is never edited. */
export function resolveComment(sectionId: string, commentId: string, resolved: boolean): CommentEvent | null {
  const events = readEvents(sectionId);
  const original = events.find((e) => e.id === commentId);
  if (!original) return null;

  const revision: CommentEvent = { ...original, resolved };
  events.push(revision);
  writeEvents(sectionId, events);
  return revision;
}

/**
 * One row per comment id, its latest revision — the thread as a reader sees
 * it now. Ordered by when each comment was first POSTED, not by its latest
 * revision, so resolving a comment doesn't jump it to the bottom of the
 * conversation.
 */
export function readThread(sectionId: string): CommentEvent[] {
  const events = readEvents(sectionId);
  const order: string[] = [];
  const latest = new Map<string, CommentEvent>();
  for (const e of events) {
    if (!latest.has(e.id)) order.push(e.id);
    latest.set(e.id, e);
  }
  return order.map((id) => latest.get(id)!);
}
