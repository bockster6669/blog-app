import { z } from 'zod';

export const NotificationsSchema = z.object({
    notificationsEmail: z.string(),
    notificationsSMS: z.string(),
    notificationsPush: z.string(),
});
export type NotificationsValues = z.infer<typeof NotificationsSchema>;
