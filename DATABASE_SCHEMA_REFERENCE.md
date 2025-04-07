# kharidify - Database Schema Reference

This document provides a detailed overview of the database schema used in the kharidify e-commerce platform. Understanding this schema is essential when making modifications to the database or implementing new features.

## Database Tables Overview

The database schema is defined in `shared/schema.ts` using Drizzle ORM.

### Core Tables

| Table Name | Description | Key Fields |
|------------|-------------|------------|
| `users` | User accounts | id, username, email, password |
| `products` | Product catalog | id, name, description, price, images |
| `categories` | Product categories | id, name, slug |
| `orders` | Customer orders | id, userId, status, total |
| `orderItems` | Items in orders | id, orderId, productId, quantity, price |
| `articles` | Blog/journal content | id, title, slug, content |
| `subscribers` | Newsletter subscribers | id, email |
| `contacts` | Contact form submissions | id, name, email, message |
| `settings` | Site configuration | id, key, value, category |

## Detailed Schema

### Users Table

```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  firstName: text("firstName"),
  lastName: text("lastName"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow()
});
```

User accounts store authentication details and personal information. The password should be hashed in a production environment.

### Products Table

```typescript
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),
  discountPrice: numeric("discount_price"),
  images: text("images").array(),
  category: text("category").notNull(),
  inStock: boolean("in_stock").default(true),
  isFeatured: boolean("is_featured").default(false),
  isLimited: boolean("is_limited").default(false),
  limitedCount: integer("limited_count"),
  sustainableMaterials: text("sustainable_materials").array(),
  madeIn: text("made_in"),
  createdAt: timestamp("created_at").defaultNow()
});
```

Products are the central entity of the e-commerce platform, containing all product details including pricing, images, and sustainability information.

### Categories Table

```typescript
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull()
});
```

Categories help organize products and enable filtering in the product catalog.

### Orders Table

```typescript
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  status: text("status").notNull(),
  total: numeric("total").notNull(),
  shippingAddress: jsonb("shipping_address"),
  billingAddress: jsonb("billing_address"),
  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status"),
  createdAt: timestamp("created_at").defaultNow()
});
```

Orders track customer purchases, including payment status and shipping information.

### Order Items Table

```typescript
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: numeric("price").notNull()
});
```

Order items represent individual products within an order, including quantity and the price at time of purchase.

### Articles Table

```typescript
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  coverImage: text("cover_image"),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow()
});
```

Articles provide content for the blog/journal section, including sustainability stories and brand information.

### Subscribers Table

```typescript
export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
```

Subscribers are users who have signed up for the newsletter.

### Contacts Table

```typescript
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
```

Contacts store form submissions from the contact page.

### Settings Table

```typescript
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull(),
  value: text("value"),
  category: text("category").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
```

Settings store site configuration, including theme colors, logo URL, and other customizable aspects.

## Relationships

Drizzle ORM allows defining relationships between tables:

```typescript
// Example of product to category relationship
export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.category],
    references: [categories.slug]
  })
}));

// Example of order to user relationship
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id]
  }),
  items: many(orderItems)
}));
```

These relationships are important for properly querying related data across tables.

## Schema Types

For each table, there are corresponding TypeScript types:

```typescript
// Insert types (for creating new records)
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
// etc.

// Select types (for retrieved records)
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
// etc.
```

These types should be used when working with the data in your application to ensure type safety.

## Working with the Schema

### Adding a New Table

To add a new table:

1. Define the table in `shared/schema.ts`:
   ```typescript
   export const newTable = pgTable("new_table", {
     id: serial("id").primaryKey(),
     name: text("name").notNull(),
     // Add other fields as needed
     createdAt: timestamp("created_at").defaultNow()
   });
   ```

2. Add insert schema and types:
   ```typescript
   export const insertNewTableSchema = createInsertSchema(newTable).omit({ 
     id: true, 
     createdAt: true 
   });
   export type InsertNewTable = z.infer<typeof insertNewTableSchema>;
   export type NewTable = typeof newTable.$inferSelect;
   ```

3. Run `npm run db:push` to update the database

### Modifying an Existing Table

To modify an existing table:

1. Update the table definition in `shared/schema.ts`
2. Update the corresponding insert schema if necessary
3. Run `npm run db:push` to update the database

### Adding Fields to Storage Interface

After modifying the schema, update the storage interface in `server/storage.ts`:

```typescript
export interface IStorage {
  // Add methods for your new table
  getNewTable(id: number): Promise<NewTable | undefined>;
  createNewTable(data: InsertNewTable): Promise<NewTable>;
  // etc.
}
```

Then implement these methods in your storage class.

## Best Practices

1. Always use the defined types when working with database data
2. Keep related data in appropriate tables instead of overly complex structures
3. Use transactions for operations that affect multiple tables
4. Add proper indexes for fields used in frequent queries
5. Use migrations for schema changes in production

---

This schema reference should help you understand and extend the database structure of the kharidify e-commerce platform.

Last updated: April 2025.
