import { z } from 'zod';
import { APPLICATION_CATEGORIES, ACADEMIC_YEARS, INSTITUTION_TYPES, ROLE_KEYS, REMINDER_FREQUENCIES } from '@/utils/constants';

const phone = z
  .string()
  .trim()
  .min(1, 'Contact phone is required')
  .regex(/^[+\d][\d\s-]{8,16}$/, 'Enter a valid phone number (digits, spaces, + or -)');

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

export const forgotSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
});

export const instituteStepSchema = z.object({
  instituteName: z.string().trim().min(3, 'Institute name must be at least 3 characters'),
  instituteId: z.string().trim().regex(/^[A-Z]{2,4}-\d{3,6}$/, 'Use the format INS-1001 (letters, hyphen, digits)'),
  institutionType: z.enum(INSTITUTION_TYPES, { errorMap: () => ({ message: 'Select an institution type' }) }),
  state: z.string().min(1, 'Select a state'),
  city: z.string().trim().min(2, 'City is required'),
  contactEmail: z.string().trim().min(1, 'Contact email is required').email('Enter a valid email address'),
  contactPhone: phone,
});

export const detailsStepSchema = z.object({
  applicationCategory: z.enum(APPLICATION_CATEGORIES, { errorMap: () => ({ message: 'Select an application category' }) }),
  academicYear: z.enum(ACADEMIC_YEARS, { errorMap: () => ({ message: 'Select an academic year' }) }),
  proposedIntake: z.coerce
    .number({ invalid_type_error: 'Enter the proposed intake as a number' })
    .int('Intake must be a whole number')
    .min(1, 'Intake must be at least 1')
    .max(5000, 'Intake looks too high for a demo entry'),
  programDetails: z.string().trim().min(10, 'Describe the course or program (at least 10 characters)'),
});

export const userSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  role: z.enum(ROLE_KEYS, { errorMap: () => ({ message: 'Select a role' }) }),
  instituteId: z.string().optional(),
  organization: z.string().trim().optional(),
});

export const instituteRecordSchema = z.object({
  name: z.string().trim().min(3, 'Institute name is required'),
  type: z.enum(INSTITUTION_TYPES, { errorMap: () => ({ message: 'Select a type' }) }),
  state: z.string().min(1, 'Select a state'),
  city: z.string().trim().min(2, 'City is required'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  phone,
});

export const ruleSchema = z.object({
  name: z.string().trim().min(3, 'Rule name is required'),
  category: z.string().min(1, 'Select a category'),
  description: z.string().trim().min(10, 'Add a short description (at least 10 characters)'),
  severity: z.enum(['High', 'Medium', 'Low']),
});

export const alertSchema = z.object({
  title: z.string().trim().min(3, 'Alert title is required'),
  category: z.string().min(1, 'Select a category'),
  recipientRole: z.enum(ROLE_KEYS),
  applicationId: z.string().optional(),
  priority: z.enum(['High', 'Medium', 'Low']),
  scheduledDate: z.string().min(1, 'Select a scheduled date'),
});

export const reminderSchema = z.object({
  title: z.string().trim().min(3, 'Title is required'),
  dueDate: z.string().min(1, 'Select a due date'),
  priority: z.enum(['High', 'Medium', 'Low']),
  recipientRole: z.enum(ROLE_KEYS),
  reminderFrequency: z.enum(REMINDER_FREQUENCIES),
});

export const deficiencySchema = z.object({
  details: z.string().trim().min(15, 'Describe the deficiency clearly (at least 15 characters)'),
});

export const rejectionSchema = z.object({
  reason: z.string().trim().min(15, 'A rejection reason is required (at least 15 characters)'),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  phone: z.string().trim().optional(),
  designation: z.string().trim().optional(),
});
