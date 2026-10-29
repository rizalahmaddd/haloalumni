import { ActionError } from 'astro:actions';
import { isAdmin, isEditor, type SessionUser } from './types';

interface GuardContext {
  locals: App.Locals;
}

export function requireUser(context: GuardContext): SessionUser {
  if (!context.locals.user) {
    throw new ActionError({ code: 'UNAUTHORIZED', message: 'Silakan masuk terlebih dahulu.' });
  }
  return context.locals.user;
}

export function requireEditor(context: GuardContext): SessionUser {
  const user = requireUser(context);
  if (!isEditor(user)) {
    throw new ActionError({ code: 'FORBIDDEN', message: 'Akses ditolak.' });
  }
  return user;
}

export function requireAdmin(context: GuardContext): SessionUser {
  const user = requireUser(context);
  if (!isAdmin(user)) {
    throw new ActionError({ code: 'FORBIDDEN', message: 'Akses ditolak.' });
  }
  return user;
}
