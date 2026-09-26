import {z} from 'zod';
export const dateSchema=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s=>{const d=new Date(s+'T12:00:00Z');return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===s;},'Enter a valid date');
export const timeSchema=z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
export const eventSchema=z.object({id:z.string().max(100),title:z.string().trim().min(1).max(120),date:dateSchema,start:timeSchema,end:timeSchema,location:z.string().trim().min(1).max(180),kind:z.enum(['class','exam']),repeat:z.boolean(),leadDays:z.number().int().min(0).max(30)}).refine(e=>e.end>e.start,'End time must be after start time');
export const prefsSchema=z.object({budget:z.number().min(5).max(40),area:z.enum(['all','campus','off']),mode:z.enum(['walking','driving']),diet:z.enum(['Anything','Vegetarian','Vegan','Gluten-free']),mealPlan:z.boolean(),leadDays:z.number().int().min(0).max(30)});
export const planSchema=z.object({id:z.string(),placeId:z.string(),name:z.string(),date:dateSchema,start:timeSchema,end:timeSchema,friend:z.string().max(100),intent:z.string(),remindMinutes:z.number().min(0).max(60),location:z.string()});
export const storageSchema=z.object({events:z.array(eventSchema).max(500),plans:z.array(planSchema).max(200),prefs:prefsSchema});
