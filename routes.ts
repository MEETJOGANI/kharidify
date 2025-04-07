import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import fs from "fs";
import multer from "multer";
import { randomUUID } from "crypto";

// Configure multer storage
const uploadDir = path.join(process.cwd(), 'public', 'uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueName = `${Date.now()}-${randomUUID()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage_config,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB limit
  },
  fileFilter: function(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});
import session from "express-session";
import { 
  insertSubscriberSchema, 
  insertContactSchema,
  insertUserSchema,
  insertProductSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertCategorySchema,
  insertArticleSchema,
  insertSettingsSchema
} from "@shared/schema";
import { ZodError } from "zod";
import Stripe from "stripe";

// Extend the Express Request type to include session
declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

// Initialize Stripe with secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("Missing STRIPE_SECRET_KEY environment variable");
}

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
console.log("Initializing Stripe with key:", STRIPE_SECRET_KEY ? "Key exists (not showing for security)" : "No key provided");

// Use the latest available API version
const stripe = new Stripe(STRIPE_SECRET_KEY);

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handler for Zod validation errors
  const handleZodError = (err: unknown, res: Response) => {
    if (err instanceof ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: err.errors 
      });
    }
    return res.status(500).json({ message: "Internal server error" });
  };

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const { limit, offset, category, featured } = req.query;
      
      const products = await storage.getProducts({
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        category: category as string | undefined,
        featured: featured === 'true' ? true : featured === 'false' ? false : undefined
      });
      
      res.json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching products" });
    }
  });
  
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching product" });
    }
  });
  
  // Create a new product
  app.post("/api/products", async (req, res) => {
    try {
      const productData = req.body;
      console.log("Received product data:", productData);
      
      // Validate data with Zod schema
      const validProductData = insertProductSchema.parse(productData);
      console.log("Validated product data:", validProductData);
      
      const product = await storage.createProduct(validProductData);
      console.log("Created product:", product);
      
      res.status(201).json(product);
    } catch (err) {
      console.error("Error creating product:", err);
      return handleZodError(err, res);
    }
  });
  
  // Update a product
  app.patch("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = req.body;
      
      const updatedProduct = await storage.updateProduct(id, productData);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (err) {
      console.error("Error updating product:", err);
      return handleZodError(err, res);
    }
  });
  
  // Delete a product
  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const deleted = await storage.deleteProduct(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(204).send();
    } catch (err) {
      console.error("Error deleting product:", err);
      res.status(500).json({ message: "Error deleting product" });
    }
  });
  
  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching categories" });
    }
  });
  
  app.post("/api/categories", async (req, res) => {
    try {
      const { name, slug } = req.body;
      
      if (!name || !slug) {
        return res.status(400).json({ message: "Name and slug are required" });
      }
      
      // Check if category with this slug already exists
      const existingCategory = await storage.getCategoryBySlug(slug);
      if (existingCategory) {
        return res.status(400).json({ message: "Category with this slug already exists" });
      }
      
      const category = await storage.createCategory({ name, slug });
      res.status(201).json(category);
    } catch (err) {
      console.error("Error creating category:", err);
      res.status(500).json({ message: "Error creating category" });
    }
  });
  
  // Articles
  app.get("/api/articles", async (req, res) => {
    try {
      const { limit, offset, category } = req.query;
      
      const articles = await storage.getArticles({
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        category: category as string | undefined
      });
      
      res.json(articles);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching articles" });
    }
  });
  
  app.get("/api/articles/:slug", async (req, res) => {
    try {
      const article = await storage.getArticleBySlug(req.params.slug);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      res.json(article);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching article" });
    }
  });
  
  // Create a new article
  app.post("/api/articles", async (req, res) => {
    try {
      const articleData = req.body;
      console.log("Received article data:", articleData);
      
      // Create slug from title if not provided
      if (!articleData.slug && articleData.title) {
        articleData.slug = articleData.title
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-');
      }
      
      const article = await storage.createArticle(articleData);
      console.log("Created article:", article);
      
      res.status(201).json(article);
    } catch (err) {
      console.error("Error creating article:", err);
      return handleZodError(err, res);
    }
  });
  
  // Update an article
  app.patch("/api/articles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const articleData = req.body;
      
      // Find article
      const article = await storage.getArticle(id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      // Create updated article with new data
      const updatedArticle = { ...article, ...articleData };
      const result = await storage.updateArticle(id, updatedArticle);
      
      res.status(200).json(result);
    } catch (err) {
      console.error("Error updating article:", err);
      return handleZodError(err, res);
    }
  });
  
  // Delete an article
  app.delete("/api/articles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Find article
      const article = await storage.getArticle(id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      // Delete article
      await storage.deleteArticle(id);
      
      res.status(204).send();
    } catch (err) {
      console.error("Error deleting article:", err);
      res.status(500).json({ message: "Error deleting article" });
    }
  });
  
  // Authentication
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // In a real app, you would hash the password here
      const user = await storage.createUser(userData);
      
      // Don't send the password back
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (err) {
      console.error(err);
      return handleZodError(err, res);
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Store user ID in session
      if (!req.session) {
        req.session = {};
      }
      req.session.userId = user.id;
      
      // Don't send the password back
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error during login" });
    }
  });
  
  app.get("/api/auth/user", async (req, res) => {
    try {
      // Check if user is logged in
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send the password back
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error retrieving user" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    if (req.session) {
      req.session.userId = undefined;
    }
    res.json({ message: "Logged out successfully" });
  });
  
  // Newsletter subscription
  app.post("/api/subscribe", async (req, res) => {
    try {
      const subscriberData = insertSubscriberSchema.parse(req.body);
      
      const existingSubscriber = await storage.getSubscriberByEmail(subscriberData.email);
      if (existingSubscriber) {
        return res.status(200).json({ message: "Email already subscribed" });
      }
      
      const subscriber = await storage.createSubscriber(subscriberData);
      res.status(201).json(subscriber);
    } catch (err) {
      console.error(err);
      return handleZodError(err, res);
    }
  });
  
  // Contact form
  app.post("/api/contact", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      res.status(201).json(contact);
    } catch (err) {
      console.error(err);
      return handleZodError(err, res);
    }
  });
  
  // Orders
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      
      // Process order items if they exist
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          const orderItemData = {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          };
          
          await storage.createOrderItem(insertOrderItemSchema.parse(orderItemData));
        }
      }
      
      res.status(201).json(order);
    } catch (err) {
      console.error(err);
      return handleZodError(err, res);
    }
  });
  
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Fetch order items
      const orderItems = await storage.getOrderItems(id);
      
      res.json({ ...order, items: orderItems });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching order" });
    }
  });
  
  app.get("/api/user/:userId/orders", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching user orders" });
    }
  });
  
  // Stripe Payment Intent Creation
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      
      console.log("Creating payment intent with amount:", amount);
      console.log("Using Stripe secret key:", process.env.STRIPE_SECRET_KEY ? "Key exists" : "Key missing");
      
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        console.log("Invalid amount provided:", amount);
        return res.status(400).json({ message: "Invalid amount provided" });
      }
      
      // Convert amount to cents for Stripe
      const amountInCents = Math.round(amount * 100);
      console.log("Amount in cents:", amountInCents);
      
      // Create a payment intent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          integration_check: 'accept_a_payment',
          order_id: `order_${Date.now()}` // Generate a unique order ID
        }
      });
      
      console.log("Payment intent created successfully:", {
        id: paymentIntent.id,
        clientSecretExists: !!paymentIntent.client_secret
      });
      
      // Send the client secret to the client
      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (err: any) {
      console.error("Error creating payment intent:", err);
      // Additional error logging
      if (err.type === 'StripeAuthenticationError') {
        console.error("Stripe authentication error - check your API key");
      } else if (err.type === 'StripeInvalidRequestError') {
        console.error("Invalid request to Stripe API:", err.param);
      }
      
      res.status(500).json({ 
        message: "Error creating payment intent",
        error: err.message,
        type: err.type || 'unknown'
      });
    }
  });
  
  // Stripe Webhook Handler - For handling payment events from Stripe
  app.post('/api/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // You'll need to add this to your environment variables
    
    let event;
    
    try {
      // Skip signature verification in development mode
      if (!endpointSecret) {
        // Just parse the JSON if no webhook secret
        event = req.body;
        console.log('Webhook signature verification skipped (no secret configured)');
      } else {
        // Verify the signature with the webhook secret
        event = stripe.webhooks.constructEvent(
          (req as any).rawBody || JSON.stringify(req.body),
          sig,
          endpointSecret
        );
      }
      
      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          console.log('Payment succeeded:', paymentIntent.id);
          
          // Here you would update your order status and process the order
          // const orderId = paymentIntent.metadata.order_id;
          // await storage.updateOrderStatus(orderId, 'paid');
          
          break;
        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object;
          console.log('Payment failed:', failedPayment.id);
          
          // Handle failed payment
          // const failedOrderId = failedPayment.metadata.order_id;
          // await storage.updateOrderStatus(failedOrderId, 'failed');
          
          break;
        default:
          // Unexpected event type
          console.log(`Unhandled event type ${event.type}`);
      }
      
      // Return a 200 response to acknowledge receipt of the event
      res.json({ received: true });
    } catch (err: any) {
      console.error('Webhook error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  });

  // Set up file upload storage
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  
  // Create upload directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created upload directory: ${uploadDir}`);
  }
  
  // Configure multer for file uploads
  const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Create a unique filename with original extension
      const uniqueId = randomUUID();
      const fileExt = path.extname(file.originalname);
      const fileName = `${uniqueId}${fileExt}`;
      cb(null, fileName);
    }
  });
  
  const upload = multer({
    storage: fileStorage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB max file size
    },
    fileFilter: (req, file, cb) => {
      // Accept only image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'));
      }
    }
  });
  
  // File upload endpoint for product images
  app.post('/api/upload', upload.array('images', 10), (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }
      
      // Generate URLs for the uploaded files
      const imageUrls = files.map(file => {
        // Create a URL that points to the uploaded file
        return `/uploads/${file.filename}`;
      });
      
      res.status(200).json({
        message: 'Files uploaded successfully',
        imageUrls,
      });
    } catch (err: any) {
      console.error('Error uploading files:', err);
      res.status(500).json({
        message: 'Error uploading files',
        error: err.message
      });
    }
  });

  // Settings endpoints
  app.get('/api/settings', async (req, res) => {
    try {
      const { category } = req.query;
      const settings = await storage.getSettings(category as string);
      res.json(settings);
    } catch (err) {
      console.error('Error fetching settings:', err);
      res.status(500).json({ message: 'Error fetching settings' });
    }
  });
  
  // Specific endpoint for site settings
  app.get('/api/settings/site', async (req, res) => {
    try {
      const settings = await storage.getSettings('site');
      
      // Transform array of settings into an object
      const siteSettings = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string | null>);
      
      res.json({ settings: siteSettings });
    } catch (err) {
      console.error('Error fetching site settings:', err);
      res.status(500).json({ message: 'Error fetching site settings' });
    }
  });

  app.get('/api/settings/:key', async (req, res) => {
    try {
      const { key } = req.params;
      const setting = await storage.getSettingByKey(key);
      
      if (!setting) {
        return res.status(404).json({ message: 'Setting not found' });
      }
      
      res.json(setting);
    } catch (err) {
      console.error('Error fetching setting:', err);
      res.status(500).json({ message: 'Error fetching setting' });
    }
  });
  
  // Consolidated site settings endpoint
  app.get('/api/site-settings', async (req, res) => {
    try {
      const siteSettings = await storage.getSettings('site');
      
      // Transform into usable format for frontend
      const formattedSettings = siteSettings.reduce((acc, setting) => {
        // Extract the setting name from the key (e.g., 'site.logoUrl' -> 'logoUrl')
        const settingName = setting.key.replace('site.', '');
        acc[settingName] = setting.value;
        return acc;
      }, {} as Record<string, string>);
      
      res.json(formattedSettings);
    } catch (err) {
      console.error('Error fetching site settings:', err);
      res.status(500).json({ message: 'Error fetching site settings' });
    }
  });

  app.post('/api/settings', async (req, res) => {
    try {
      // Check if it's a batch update (multiple settings at once)
      if (req.body.settings && typeof req.body.settings === 'object') {
        const results = [];
        
        // Process each setting
        for (const [key, value] of Object.entries(req.body.settings)) {
          const settingData = {
            key,
            value: value as string,
            category: key.split('.')[0] || 'general',
            description: `Setting for ${key}`
          };
          
          // Check if setting exists
          const existingSetting = await storage.getSettingByKey(key);
          
          if (existingSetting) {
            // Update existing setting
            const updated = await storage.updateSetting(existingSetting.id, settingData);
            results.push(updated);
          } else {
            // Create new setting
            const created = await storage.createSetting(settingData);
            results.push(created);
          }
        }
        
        return res.json({
          message: 'Settings updated successfully',
          settings: results
        });
      } else {
        // Single setting update
        const settingData = insertSettingsSchema.parse(req.body);
        console.log('Creating setting:', settingData);
        
        // Check if setting with this key already exists
        const existingSetting = await storage.getSettingByKey(settingData.key);
        
        if (existingSetting) {
          // Update existing setting
          const updatedSetting = await storage.updateSetting(existingSetting.id, settingData);
          return res.json(updatedSetting);
        }
        
        // Create new setting
        const setting = await storage.createSetting(settingData);
        res.status(201).json(setting);
      }
    } catch (err) {
      console.error('Error creating/updating setting:', err);
      return handleZodError(err, res);
    }
  });

  app.delete('/api/settings/:key', async (req, res) => {
    try {
      const { key } = req.params;
      const setting = await storage.getSettingByKey(key);
      
      if (!setting) {
        return res.status(404).json({ message: 'Setting not found' });
      }
      
      await storage.deleteSetting(setting.id);
      res.status(204).send();
    } catch (err) {
      console.error('Error deleting setting:', err);
      res.status(500).json({ message: 'Error deleting setting' });
    }
  });

  // Payment Settings endpoints - convenience methods for front-end
  app.get('/api/payment-settings', async (req, res) => {
    try {
      const settings = await storage.getSettings('payment');
      
      // Format settings into a more usable object
      const paymentSettings = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string | null>);
      
      res.json(paymentSettings);
    } catch (err) {
      console.error('Error fetching payment settings:', err);
      res.status(500).json({ message: 'Error fetching payment settings' });
    }
  });

  app.post('/api/payment-settings', async (req, res) => {
    try {
      const paymentData = req.body;
      const results = [];
      
      // For each setting, create or update
      for (const [key, value] of Object.entries(paymentData)) {
        const settingKey = `payment.${key}`;
        const settingData = {
          key: settingKey,
          value: value as string,
          category: 'payment',
          description: `Payment setting for ${key}`
        };
        
        // Check if setting exists
        const existingSetting = await storage.getSettingByKey(settingKey);
        
        if (existingSetting) {
          // Update
          const updated = await storage.updateSetting(existingSetting.id, settingData);
          results.push(updated);
        } else {
          // Create
          const created = await storage.createSetting(settingData);
          results.push(created);
        }
      }
      
      res.json({
        message: 'Payment settings updated successfully',
        settings: results
      });
    } catch (err) {
      console.error('Error updating payment settings:', err);
      res.status(500).json({ message: 'Error updating payment settings' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
