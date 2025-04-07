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

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Products
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(options?: { 
    limit?: number; 
    offset?: number; 
    category?: string;
    featured?: boolean;
  }): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Articles
  getArticle(id: number): Promise<Article | undefined>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
  getArticles(options?: { 
    limit?: number; 
    offset?: number; 
    category?: string; 
  }): Promise<Article[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  
  // Orders
  getOrder(id: number): Promise<Order | undefined>;
  getUserOrders(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Order Items
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Subscribers
  getSubscribers(): Promise<Subscriber[]>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  
  // Contacts
  createContact(contact: InsertContact): Promise<Contact>;
  
  // Settings
  getSettings(category?: string): Promise<Settings[]>;
  getSettingByKey(key: string): Promise<Settings | undefined>;
  createSetting(setting: InsertSettings): Promise<Settings>;
  updateSetting(id: number, setting: Partial<InsertSettings>): Promise<Settings | undefined>;
  deleteSetting(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private categories: Map<number, Category>;
  private articles: Map<number, Article>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private subscribers: Map<number, Subscriber>;
  private contacts: Map<number, Contact>;
  private settings: Map<number, Settings>;
  
  private userId: number;
  private productId: number;
  private categoryId: number;
  private articleId: number;
  private orderId: number;
  private orderItemId: number;
  private subscriberId: number;
  private contactId: number;
  private settingId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.categories = new Map();
    this.articles = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.subscribers = new Map();
    this.contacts = new Map();
    this.settings = new Map();
    
    this.userId = 1;
    this.productId = 1;
    this.categoryId = 1;
    this.articleId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    this.subscriberId = 1;
    this.contactId = 1;
    this.settingId = 1;
    
    // Create initial data
    this.initializeData();
  }
  
  private initializeData() {
    // Add categories
    const swimwear = {
      name: "Swimwear", 
      slug: "swimwear"
    };
    this.createCategory(swimwear);
    
    const resort = {
      name: "Resort Wear", 
      slug: "resort-wear"
    };
    this.createCategory(resort);
    
    const accessories = {
      name: "Accessories", 
      slug: "accessories"
    };
    this.createCategory(accessories);
    
    const jewelry = {
      name: "Sustainable Jewelry", 
      slug: "jewelry"
    };
    this.createCategory(jewelry);
    
    const homewear = {
      name: "Home Collection", 
      slug: "home-collection"
    };
    this.createCategory(homewear);
    
    const comingSoon = {
      name: "Coming Soon", 
      slug: "coming-soon"
    };
    this.createCategory(comingSoon);
    
    // Add sample products
    const product1 = {
      name: "Coral Reef One-Piece",
      description: "Made from recycled nylon, this luxurious one-piece swimsuit features a stunning coral-inspired design and offers excellent support.",
      price: 250,
      images: [
        "https://images.unsplash.com/photo-1570900649218-2d1a3508ee65?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=736&q=80"
      ],
      category: "swimwear",
      inStock: true,
      isFeatured: true,
      isLimited: true,
      limitedCount: 50,
      sustainableMaterials: ["Recycled Nylon"],
      madeIn: "India"
    };
    this.createProduct(product1);
    
    const product2 = {
      name: "Amalfi Halter Bikini",
      description: "This elegant halter bikini is crafted from Econyl® regenerated nylon, offering both sustainability and timeless style.",
      price: 225,
      images: [
        "https://images.unsplash.com/photo-1574177556859-1362f72ed6f9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=765&q=80"
      ],
      category: "swimwear",
      inStock: true,
      isFeatured: true,
      isLimited: true,
      limitedCount: 35,
      sustainableMaterials: ["Econyl®"],
      madeIn: "Italy"
    };
    this.createProduct(product2);
    
    const product3 = {
      name: "Jaipur Bandeau Set",
      description: "A stunning bandeau bikini set inspired by the colors of Jaipur, made with sustainable linen blend fabric.",
      price: 275,
      images: [
        "https://images.unsplash.com/photo-1625039217876-334db65a549a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
      ],
      category: "swimwear",
      inStock: true,
      isFeatured: true,
      isLimited: false,
      sustainableMaterials: ["Sustainable Linen Blend"],
      madeIn: "India"
    };
    this.createProduct(product3);
    
    // Resort Wear Products
    const product4 = {
      name: "Kerala Linen Maxi Dress",
      description: "An elegant flowing maxi dress made from 100% organic linen, perfect for warm evenings by the sea.",
      price: 385,
      images: [
        "https://images.unsplash.com/photo-1600102587914-39f3a4a48266?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
      ],
      category: "resort-wear",
      inStock: true,
      isFeatured: true,
      isLimited: false,
      sustainableMaterials: ["Organic Linen"],
      madeIn: "India"
    };
    this.createProduct(product4);
    
    const product5 = {
      name: "Mumbai Silk Kaftan",
      description: "A luxurious peace silk kaftan with hand-painted motifs inspired by Mumbai's coastal landscapes.",
      price: 420,
      images: [
        "https://images.unsplash.com/photo-1562137369-1a1a0bc66744?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
      ],
      category: "resort-wear",
      inStock: true,
      isFeatured: false,
      isLimited: true,
      limitedCount: 25,
      sustainableMaterials: ["Peace Silk"],
      madeIn: "India"
    };
    this.createProduct(product5);
    
    // Accessories Products
    const product6 = {
      name: "Rajasthan Woven Tote",
      description: "Handcrafted tote bag made from recycled cotton and traditional Rajasthani weaving techniques.",
      price: 180,
      images: [
        "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=876&q=80"
      ],
      category: "accessories",
      inStock: true,
      isFeatured: true,
      isLimited: false,
      sustainableMaterials: ["Recycled Cotton"],
      madeIn: "India"
    };
    this.createProduct(product6);
    
    const product7 = {
      name: "Bombay Sun Hat",
      description: "A wide-brimmed sun hat woven from sustainably harvested palm leaves, offering stylish protection from the sun.",
      price: 135,
      images: [
        "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
      ],
      category: "accessories",
      inStock: true,
      isFeatured: false,
      isLimited: false,
      sustainableMaterials: ["Natural Palm"],
      madeIn: "India"
    };
    this.createProduct(product7);
    
    // Jewelry Products
    const product8 = {
      name: "Ocean Wave Earrings",
      description: "Delicate silver earrings crafted from recycled sterling silver, inspired by the waves of the Arabian Sea.",
      price: 165,
      images: [
        "https://images.unsplash.com/photo-1630019852942-f87a2bdad8c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
      ],
      category: "jewelry",
      inStock: true,
      isFeatured: true,
      isLimited: true,
      limitedCount: 30,
      sustainableMaterials: ["Recycled Silver"],
      madeIn: "India"
    };
    this.createProduct(product8);
    
    const product9 = {
      name: "Lotus Pendant Necklace",
      description: "A beautiful lotus-inspired pendant made from ethical gold, symbolizing purity and sustainability.",
      price: 210,
      images: [
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
      ],
      category: "jewelry",
      inStock: true,
      isFeatured: true,
      isLimited: false,
      sustainableMaterials: ["Ethical Gold"],
      madeIn: "India"
    };
    this.createProduct(product9);
    
    // Home Collection Products
    const product10 = {
      name: "Organic Cotton Throw",
      description: "A luxurious organic cotton throw with hand-block printed designs, perfect for adding sustainable elegance to your home.",
      price: 195,
      images: [
        "https://images.unsplash.com/photo-1617004887317-5ca23b82d1b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
      ],
      category: "home-collection",
      inStock: true,
      isFeatured: true,
      isLimited: false,
      sustainableMaterials: ["Organic Cotton"],
      madeIn: "India"
    };
    this.createProduct(product10);
    
    const product11 = {
      name: "Coconut Wax Candle Set",
      description: "Set of three coconut wax candles with essential oil fragrances inspired by Indian botanicals, in recycled brass containers.",
      price: 120,
      images: [
        "https://images.unsplash.com/photo-1588372405219-e40d64efafcb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=688&q=80"
      ],
      category: "home-collection",
      inStock: true,
      isFeatured: false,
      isLimited: true,
      limitedCount: 40,
      sustainableMaterials: ["Coconut Wax", "Recycled Brass"],
      madeIn: "India"
    };
    this.createProduct(product11);
    
    // Add articles
    const article1 = {
      title: "The Making of Sustainable Fabrics",
      slug: "making-of-sustainable-fabrics",
      content: "Discover how we transform renewable resources into luxurious fabrics while minimizing environmental impact...",
      excerpt: "Discover how we transform renewable resources into luxurious fabrics while minimizing environmental impact.",
      coverImage: "https://images.unsplash.com/photo-1503664974816-7691ca85b22f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
      category: "sustainability"
    };
    this.createArticle(article1);
    
    const article2 = {
      title: "kharidifyWomen: Aditi Rao Hydari",
      slug: "shahu-women-aditi-rao-hydari",
      content: "A conversation with the acclaimed actress about sustainability, style, and the power of conscious choices...",
      excerpt: "A conversation with the acclaimed actress about sustainability, style, and the power of conscious choices.",
      coverImage: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
      category: "shahu-women"
    };
    this.createArticle(article2);
    
    const article3 = {
      title: "Cultural Inspirations: Mumbai to Jaipur",
      slug: "cultural-inspirations-mumbai-to-jaipur",
      content: "Exploring the rich textile traditions and architectural motifs that influence our design philosophy...",
      excerpt: "Exploring the rich textile traditions and architectural motifs that influence our design philosophy.",
      coverImage: "https://images.unsplash.com/photo-1596547615875-bced1ffb5c6b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=733&q=80",
      category: "inspiration"
    };
    this.createArticle(article3);
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const createdAt = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt,
      firstName: insertUser.firstName ?? null,
      lastName: insertUser.lastName ?? null,
      phone: insertUser.phone ?? null
    };
    this.users.set(id, user);
    return user;
  }
  
  // Products
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProducts(options?: { 
    limit?: number; 
    offset?: number; 
    category?: string;
    featured?: boolean;
  }): Promise<Product[]> {
    let products = Array.from(this.products.values());
    
    if (options?.category) {
      products = products.filter(product => product.category === options.category);
    }
    
    if (options?.featured !== undefined) {
      products = products.filter(product => product.isFeatured === options.featured);
    }
    
    const offset = options?.offset || 0;
    const limit = options?.limit || products.length;
    
    return products.slice(offset, offset + limit);
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const createdAt = new Date();
    const product: Product = { 
      ...insertProduct, 
      id, 
      createdAt,
      discountPrice: insertProduct.discountPrice ?? null,
      images: insertProduct.images ? [...insertProduct.images] : null,
      inStock: insertProduct.inStock ?? true,
      isFeatured: insertProduct.isFeatured ?? false,
      isLimited: insertProduct.isLimited ?? false,
      limitedCount: insertProduct.limitedCount ?? null,
      sustainableMaterials: insertProduct.sustainableMaterials ? [...insertProduct.sustainableMaterials] : null,
      madeIn: insertProduct.madeIn ?? null
    };
    this.products.set(id, product);
    return product;
  }
  
  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;
    
    const updatedProduct = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    const exists = this.products.has(id);
    if (exists) {
      this.products.delete(id);
      return true;
    }
    return false;
  }
  
  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug,
    );
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
  
  // Articles
  async getArticle(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }
  
  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    return Array.from(this.articles.values()).find(
      (article) => article.slug === slug,
    );
  }
  
  async getArticles(options?: { 
    limit?: number; 
    offset?: number; 
    category?: string; 
  }): Promise<Article[]> {
    let articles = Array.from(this.articles.values());
    
    if (options?.category) {
      articles = articles.filter(article => article.category === options.category);
    }
    
    const offset = options?.offset || 0;
    const limit = options?.limit || articles.length;
    
    return articles.slice(offset, offset + limit);
  }
  
  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = this.articleId++;
    const createdAt = new Date();
    const article: Article = { 
      ...insertArticle, 
      id, 
      createdAt,
      category: insertArticle.category ?? null,
      excerpt: insertArticle.excerpt ?? null,
      coverImage: insertArticle.coverImage ?? null
    };
    this.articles.set(id, article);
    return article;
  }
  
  // Orders
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId,
    );
  }
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const createdAt = new Date();
    const order: Order = { 
      ...insertOrder, 
      id, 
      createdAt,
      userId: insertOrder.userId ?? null,
      shippingAddress: insertOrder.shippingAddress ?? null,
      billingAddress: insertOrder.billingAddress ?? null,
      paymentMethod: insertOrder.paymentMethod ?? null,
      paymentStatus: insertOrder.paymentStatus ?? null
    };
    this.orders.set(id, order);
    return order;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  // Order Items
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId,
    );
  }
  
  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    const orderItem: OrderItem = { ...insertOrderItem, id };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }
  
  // Subscribers
  async getSubscribers(): Promise<Subscriber[]> {
    return Array.from(this.subscribers.values());
  }
  
  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    return Array.from(this.subscribers.values()).find(
      (subscriber) => subscriber.email === email,
    );
  }
  
  async createSubscriber(insertSubscriber: InsertSubscriber): Promise<Subscriber> {
    const id = this.subscriberId++;
    const createdAt = new Date();
    const subscriber: Subscriber = { ...insertSubscriber, id, createdAt };
    this.subscribers.set(id, subscriber);
    return subscriber;
  }
  
  // Contacts
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.contactId++;
    const createdAt = new Date();
    const contact: Contact = { 
      ...insertContact, 
      id, 
      createdAt,
      subject: insertContact.subject ?? null
    };
    this.contacts.set(id, contact);
    return contact;
  }
  
  // Settings
  async getSettings(category?: string): Promise<Settings[]> {
    let settings = Array.from(this.settings.values());
    
    if (category) {
      settings = settings.filter(setting => setting.category === category);
    }
    
    // Sort by key for consistent ordering
    settings.sort((a, b) => a.key.localeCompare(b.key));
    
    return settings;
  }

  async getSettingByKey(key: string): Promise<Settings | undefined> {
    return Array.from(this.settings.values()).find(
      (setting) => setting.key === key,
    );
  }

  async createSetting(insertSetting: InsertSettings): Promise<Settings> {
    const id = this.settingId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const setting: Settings = { 
      ...insertSetting, 
      id, 
      createdAt, 
      updatedAt,
      value: insertSetting.value ?? null,
      category: insertSetting.category ?? 'general',
      description: insertSetting.description ?? null
    };
    this.settings.set(id, setting);
    return setting;
  }

  async updateSetting(id: number, settingData: Partial<InsertSettings>): Promise<Settings | undefined> {
    const setting = this.settings.get(id);
    if (!setting) return undefined;
    
    const updatedAt = new Date();
    const updatedSetting = { ...setting, ...settingData, updatedAt };
    this.settings.set(id, updatedSetting);
    return updatedSetting;
  }

  async deleteSetting(id: number): Promise<boolean> {
    const exists = this.settings.has(id);
    if (exists) {
      this.settings.delete(id);
      return true;
    }
    return false;
  }
}

// Use MemStorage temporarily while database issues are resolved
export const storage = new MemStorage();
