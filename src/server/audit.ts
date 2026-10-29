import { getDb, auditLogs } from './db';
import { newId, now } from './util';

export async function logAudit(options: {
  actorId: string | null;
  action: string;
  entityType?: string;
  entityId?: string | null;
  meta?: Record<string, unknown>;
}): Promise<void> {
  try {
    await getDb()
      .insert(auditLogs)
      .values({
        id: newId(),
        actorId: options.actorId,
        action: options.action,
        entityType: options.entityType ?? null,
        entityId: options.entityId ?? null,
        meta: options.meta ? JSON.stringify(options.meta) : null,
        createdAt: now(),
      });
  } catch (error) {
    console.error('[audit:failed]', error);
  }
}
