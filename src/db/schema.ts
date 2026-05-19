import { pgTable, text, timestamp, uuid, integer, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const adminAvailabilitySlots = pgTable("admin_availability_slots", {
  id: uuid("id").defaultRandom().primaryKey(),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  endAt: timestamp("end_at", { withTimezone: true }).notNull(),
  capacity: integer("capacity").notNull().default(1),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerName: text("customer_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  telegramHandle: text("telegram_handle"),
  appointmentStartAt: timestamp("appointment_start_at", { withTimezone: true }).notNull(),
  appointmentEndAt: timestamp("appointment_end_at", { withTimezone: true }).notNull(),
  status: text("status", { enum: ["pending", "confirmed", "cancelled"] })
    .notNull()
    .default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  provider: text("provider", { enum: ["card", "sbp"] }).notNull(),
  amountRub: integer("amount_rub").notNull(),
  status: text("status", {
    enum: ["created", "paid", "failed", "refunded", "cancelled"],
  })
    .notNull()
    .default("created"),
  providerReference: text("provider_reference"),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
});

export const telegramLinks = pgTable("telegram_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }),
  email: text("email"),
  phone: text("phone"),
  chatId: text("chat_id").notNull(),
  telegramUserId: text("telegram_user_id"),
  telegramUsername: text("telegram_username"),
  linkedAt: timestamp("linked_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Public gallery images for «Мои работы»; files live on disk under /gallery/:fileKey */
export const galleryWorks = pgTable("gallery_works", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  fileKey: text("file_key").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const bookingsRelations = relations(bookings, ({ many }) => ({
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, { fields: [payments.bookingId], references: [bookings.id] }),
}));
