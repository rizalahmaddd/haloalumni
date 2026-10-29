import { admin } from './admin';
import { alumni } from './alumni';
import { auth } from './auth';
import { eventsActions } from './events';
import { jobsActions } from './jobs';

export const server = {
  auth,
  alumni,
  jobs: jobsActions,
  events: eventsActions,
  admin,
};
