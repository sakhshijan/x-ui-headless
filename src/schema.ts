import { z } from "zod";

export const addClientSchema = z.object({
  id: z.string().uuid(),
  inboundId: z.coerce.number(),
  totalGB: z.number().default(0),
  expiryTime: z.number().default(0),
  enable: z.boolean().default(true),
});
