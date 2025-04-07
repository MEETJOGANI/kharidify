import { 
  settings, type Settings, type InsertSettings,
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  categories, type Category, type InsertCategory,
  articles, type Article, type InsertArticle,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  subscribers, type Subscriber, type InsertSubscriber,
  contacts, type Contact, type InsertContact
} from "@shared/schema";
import { db } from "./db";
import { eq, like, desc, asc, and, or, isNull, sql, inArray } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Products
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProducts(options?: { 
    limit?: number; 
    offset?: number; 
    category?: string;
    featured?: boolean;
  }): Promise<Product[]> {
    let query = db.select().from(products);
    
    // Apply filters
    const filters = [];
    if (options?.category) {
      filters.push(eq(products.category, options.category));
    }
    if (options?.featured !== undefined) {
      filters.push(eq(products.isFeatured, options.featured));
    }
    
    if (filters.length > 0) {
      query = query.where(and(...filters));
    }
    
    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.offset(options.offset);
    }
    
    // Sort by newest first
    query = query.orderBy(desc(products.createdAt));
    
    return await query;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    await db
      .delete(products)
      .where(eq(products.id, id));
    return true; // PostgreSQL doesn't return affected rows in the same way
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  // Articles
  async getArticle(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.slug, slug));
    return article;
  }

  async getArticles(options?: { 
    limit?: number; 
    offset?: number; 
    category?: string; 
  }): Promise<Article[]> {
    let query = db.select().from(articles);
    
    // Apply filters
    if (options?.category) {
      query = query.where(eq(articles.category, options.category));
    }
    
    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.offset(options.offset);
    }
    
    // Sort by newest first
    query = query.orderBy(desc(articles.createdAt));
    
    return await query;
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const [article] = await db.insert(articles).values(insertArticle).returning();
    return article;
  }

  // Orders
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Order Items
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db
      .insert(orderItems)
      .values(insertOrderItem)
      .returning();
    return orderItem;
  }

  // Subscribers
  async getSubscribers(): Promise<Subscriber[]> {
    return await db.select().from(subscribers);
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const [subscriber] = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, email));
    return subscriber;
  }

  async createSubscriber(insertSubscriber: InsertSubscriber): Promise<Subscriber> {
    const [subscriber] = await db
      .insert(subscribers)
      .values(insertSubscriber)
      .returning();
    return subscriber;
  }

  // Contacts
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(insertContact)
      .returning();
    return contact;
  }

  // Settings
  async getSettings(category?: string): Promise<Settings[]> {
    let query = db.select().from(settings);
    
    if (category) {
      query = query.where(eq(settings.category, category));
    }
    
    // Sort by key for consistent ordering
    query = query.orderBy(asc(settings.key));
    
    return await query;
  }

  async getSettingByKey(key: string): Promise<Settings | undefined> {
    const [setting] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key));
    return setting;
  }

  async createSetting(insertSetting: InsertSettings): Promise<Settings> {
    const [setting] = await db
      .insert(settings)
      .values(insertSetting)
      .returning();
    return setting;
  }

  async updateSetting(id: number, setting: Partial<InsertSettings>): Promise<Settings | undefined> {
    const [updatedSetting] = await db
      .update(settings)
      .set(setting)
      .where(eq(settings.id, id))
      .returning();
    return updatedSetting;
  }

  async deleteSetting(id: number): Promise<boolean> {
    await db
      .delete(settings)
      .where(eq(settings.id, id));
    return true;
  }
}