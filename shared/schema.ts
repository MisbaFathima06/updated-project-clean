import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb, index, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const zkIdentities = pgTable("zk_identities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  commitment: text("commitment").notNull().unique(),
  nullifierHash: text("nullifier_hash").notNull().unique(),
  groupId: text("group_id").notNull().default("speaksecure-v1"),
  isValid: boolean("is_valid").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  commitmentIdx: index("commitment_idx").on(table.commitment),
  nullifierIdx: index("nullifier_idx").on(table.nullifierHash),
}));

export const complaints = pgTable('complaints', {
  id: serial('id').primaryKey(),
  referenceId: varchar('reference_id', { length: 50 }).notNull().unique(),
  topic: varchar('topic', { length: 100 }).notNull(),
  description: text('description').notNull(),
  location: text('location'),
  status: varchar('status', { length: 50 }).default('submitted'),
  priority: varchar('priority', { length: 20 }).default('medium'),
  isPublic: boolean('is_public').default(false),
  emergencyContact: varchar('emergency_contact', { length: 50 }),
  ipfsHash: varchar('ipfs_hash', { length: 100 }),
  blockchainHash: varchar('blockchain_hash', { length: 100 }),
  zkProof: text('zk_proof'),
  upvotes: integer('upvotes').default(0),
  submittedAt: timestamp('submitted_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const complaintUpdates = pgTable('complaint_updates', {
  id: serial('id').primaryKey(),
  complaintId: integer('complaint_id').references(() => complaints.id),
  message: text('message').notNull(),
  updateType: varchar('update_type', { length: 50 }).default('status_update'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const upvotes = pgTable('upvotes', {
  id: serial('id').primaryKey(),
  complaintId: integer('complaint_id').references(() => complaints.id),
  zkProof: text('zk_proof').notNull(),
  nullifierHash: varchar('nullifier_hash', { length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const emergencyAlerts = pgTable('emergency_alerts', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  zkCommitment: text('zk_commitment').notNull(),
  encryptedContent: text('encrypted_content').notNull(),
  emergencyContact: varchar('emergency_contact', { length: 50 }).notNull(),
  location: jsonb('location'),
  status: varchar('status', { length: 50 }).default('active'),
  priority: varchar('priority', { length: 20 }).default('critical'),
  ipfsHash: varchar('ipfs_hash', { length: 100 }),
  blockchainHash: varchar('blockchain_hash', { length: 100 }),
  responseTime: timestamp('response_time'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const nullifierTracker = pgTable('nullifier_tracker', {
  id: serial('id').primaryKey(),
  nullifierHash: varchar('nullifier_hash', { length: 100 }).notNull(),
  action: varchar('action', { length: 50 }).notNull(),
  topic: varchar('topic', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  nullifierActionIdx: index('nullifier_action_idx').on(table.nullifierHash, table.action, table.topic),
}));

export const emergencyContacts = pgTable('emergency_contacts', {
  id: serial('id').primaryKey(),
  contact: varchar('contact', { length: 50 }).notNull(),
  verified: boolean('verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const complaintsRelations = relations(complaints, ({ many }) => ({
  upvotes: many(upvotes),
}));

export const upvotesRelations = relations(upvotes, ({ one }) => ({
  complaint: one(complaints, {
    fields: [upvotes.complaintId],
    references: [complaints.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertZkIdentitySchema = createInsertSchema(zkIdentities).pick({
  commitment: true,
  nullifierHash: true,
  groupId: true,
});

export const insertComplaintSchema = createInsertSchema(complaints).pick({
  referenceId: true,
  topic: true,
  description: true,
  location: true,
  priority: true,
  isPublic: true,
  emergencyContact: true,
  ipfsHash: true,
  blockchainHash: true,
  zkProof: true,
});

export const insertComplaintUpdateSchema = createInsertSchema(complaintUpdates).pick({
  complaintId: true,
  message: true,
  updateType: true,
});

export const insertUpvoteSchema = createInsertSchema(upvotes).pick({
  complaintId: true,
  zkProof: true,
  nullifierHash: true,
});

export const insertEmergencyContactSchema = createInsertSchema(emergencyContacts).pick({
  contact: true,
  verified: true,
});

export const insertEmergencyAlertSchema = createInsertSchema(emergencyAlerts).pick({
  zkCommitment: true,
  encryptedContent: true,
  emergencyContact: true,
  location: true,
  priority: true,
  ipfsHash: true,
  blockchainHash: true,
});

export const insertNullifierTrackerSchema = createInsertSchema(nullifierTracker).pick({
  nullifierHash: true,
  action: true,
  topic: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertZkIdentity = z.infer<typeof insertZkIdentitySchema>;
export type ZkIdentity = typeof zkIdentities.$inferSelect;

export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type Complaint = typeof complaints.$inferSelect;

export type InsertComplaintUpdate = z.infer<typeof insertComplaintUpdateSchema>;
export type ComplaintUpdate = typeof complaintUpdates.$inferSelect;

export type InsertUpvote = z.infer<typeof insertUpvoteSchema>;
export type Upvote = typeof upvotes.$inferSelect;

export type InsertEmergencyContact = z.infer<typeof insertEmergencyContactSchema>;
export type EmergencyContact = typeof emergencyContacts.$inferSelect;

export type InsertEmergencyAlert = z.infer<typeof insertEmergencyAlertSchema>;
export type EmergencyAlert = typeof emergencyAlerts.$inferSelect;

export type InsertNullifierTracker = z.infer<typeof insertNullifierTrackerSchema>;
export type NullifierTracker = typeof nullifierTracker.$inferSelect;