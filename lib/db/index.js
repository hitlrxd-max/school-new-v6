import { z } from "zod";

export const insertRegistrationSchema = z.object({
  student_name: z.string(),
  branch: z.string(),
  grade: z.string(),
  gender: z.string(),
  national_id: z.string(),
  birth_date: z.string(),
  mother_name: z.string(),
  mother_phone: z.string(),
  guardian_name: z.string(),
  guardian_phone: z.string()
});
