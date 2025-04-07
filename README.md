# kharidify - Luxury Sustainable Fashion E-commerce

This README provides a comprehensive guide to understanding and modifying the kharidify e-commerce platform codebase. This document will help you navigate the codebase structure, understand how different components work together, and guide you on editing specific parts of the application.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Core Components](#core-components)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Common Editing Tasks](#common-editing-tasks)
8. [Environment Variables](#environment-variables)
9. [Deployment Guide](#deployment-guide)

## Project Overview

kharidify is a luxury sustainable fashion e-commerce platform designed to provide a high-end shopping experience with a focus on sustainability and ethical fashion. The platform includes:

- Product catalog with categorization
- Shopping cart functionality
- Secure checkout with Stripe integration
- User authentication and profile management
- Admin dashboard for site management
- Multi-language and multi-currency support
- Newsletter subscription
- Content management for articles/blog

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Payment Processing**: Stripe
- **Authentication**: Custom authentication with session management
- **Styling**: Tailwind CSS with ShadCN UI components
- **State Management**: React Context and TanStack Query
- **Routing**: Wouter for client-side routing

## Project Structure

The project follows a clean separation between client and server:

```
/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── assets/       # Static assets
│   │   ├── components/   # React components
│   │   ├── context/      # React context providers
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions and helpers
│   │   ├── pages/        # Page components
│   │   └── App.tsx       # Main application component
│   └── index.html        # HTML entry point
├── public/               # Public assets
├── server/               # Backend Express application
│   ├── db.ts             # Database connection
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Data access layer
│   └── vite.ts           # Vite integration
├── shared/               # Shared code between client and server
│   └── schema.ts         # Database schema definitions
└── drizzle.config.ts     # Drizzle ORM configuration
```

## Core Components

### Frontend

#### Context Providers

The application uses several context providers to manage global state:

- **SiteSettingsContext (`client/src/context/SiteSettingsContext.tsx`)**: Manages site-wide settings like theme colors, logo, etc.
- **ShopContext (`client/src/context/ShopContext.tsx`)**: Manages shopping cart functionality.
- **CurrencyContext (`client/src/context/CurrencyContext.tsx`)**: Handles currency selection and conversion.
- **LanguageContext (`client/src/context/LanguageContext.tsx`)**: Manages language selection and translations.

To update these contexts, edit the respective files and modify the initial state or context functions.

#### Layouts

- **AdminLayout (`client/src/components/layout/AdminLayout.tsx`)**: Layout for admin pages
- **Header (`client/src/components/layout/Header.tsx`)**: Site header with navigation
- **Footer (`client/src/components/layout/Footer.tsx`)**: Site footer

#### Pages

Pages are located in `client/src/pages/`. Key pages include:

- **Home (`client/src/pages/home.tsx`)**: The landing page
- **Shop (`client/src/pages/shop.tsx`)**: Product catalog
- **Product (`client/src/pages/product.tsx`)**: Individual product page
- **Cart (`client/src/pages/cart.tsx`)**: Shopping cart
- **Checkout (`client/src/pages/checkout.tsx`)**: Checkout flow
- **Admin pages** are in `client/src/pages/admin/`

To add a new page, create a new file in the pages directory and add it to the router in `client/src/App.tsx`.

### Backend

#### API Routes

API routes are defined in `server/routes.ts`. This file contains all the endpoints that the client can interact with.

#### Data Storage

The data storage layer is in `server/storage.ts` which provides an interface to interact with the database.

#### Database Connection

The database connection is configured in `server/db.ts`.

## Database Schema

The database schema is defined in `shared/schema.ts` using Drizzle ORM. Key tables include:

- **users**: User accounts and authentication information
- **products**: Product catalog
- **categories**: Product categories
- **orders**: Customer orders
- **orderItems**: Individual items in each order
- **articles**: Blog posts/articles
- **subscribers**: Newsletter subscribers
- **contacts**: Contact form submissions
- **settings**: Site settings for themes, logo, etc.

To modify the database schema:

1. Edit `shared/schema.ts` to add/modify tables
2. Run `npm run db:push` to update the database schema

## API Endpoints

Here are the main API endpoints available:

### Products
- `GET /api/products`: List all products
- `GET /api/products/:id`: Get a specific product
- `POST /api/products`: Create a new product (admin)
- `PATCH /api/products/:id`: Update a product (admin)
- `DELETE /api/products/:id`: Delete a product (admin)

### Categories
- `GET /api/categories`: List all categories
- `POST /api/categories`: Create a new category (admin)

### Authentication
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Log in a user
- `GET /api/auth/user`: Get the current user
- `POST /api/auth/logout`: Log out a user

### Orders
- `POST /api/orders`: Create a new order
- `GET /api/orders/:id`: Get a specific order
- `GET /api/user/:userId/orders`: Get all orders for a user

### Site Settings
- `GET /api/settings`: Get all settings
- `GET /api/settings/site`: Get site settings
- `POST /api/settings`: Create or update settings (admin)

### Payments
- `POST /api/create-payment-intent`: Create a Stripe payment intent

## Common Editing Tasks

### Changing the Logo

1. Go to the Admin Dashboard
2. Navigate to Site Settings
3. Upload a new logo file

To change the logo programmatically, update the `logoUrl` in the site settings database.

### Modifying Theme Colors

1. Go to the Admin Dashboard
2. Navigate to Site Settings
3. Use the color pickers to select new colors

To modify theme colors in code:
1. Edit `theme.json` at the root level
2. Update color values in `client/src/index.css`

### Adding a New Page

1. Create a new file in `client/src/pages/`
2. Add the page component to the router in `client/src/App.tsx`
3. Add any necessary links in the header or footer

### Adding New Products

1. Use the Admin Dashboard to add products

Or programmatically:
1. Insert data into the `products` table
2. Ensure you provide all required fields defined in the schema

### Modifying the Database

1. Edit `shared/schema.ts` to add or modify tables
2. Run `npm run db:push` to apply changes

### Changing Language Translations

Edit `client/src/lib/i18n.ts` to update or add translations.

### Implementing a New Feature

1. Identify the components involved
2. Update the database schema if needed
3. Add API endpoints in `server/routes.ts`
4. Implement the UI components in `client/src/components/`
5. Connect to API using TanStack Query in the relevant components

## Environment Variables

The application uses several environment variables:

- `DATABASE_URL`: PostgreSQL database connection string
- `STRIPE_SECRET_KEY`: Secret key for Stripe integration
- `VITE_STRIPE_PUBLIC_KEY`: Public key for Stripe (client-side)

When deploying the application, ensure these variables are correctly set.

## Deployment Guide

### Local Development

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables (create a `.env` file)
4. Start the development server with `npm run dev`

### Production Deployment

The application is designed to be deployed on Replit, but can be deployed to any platform that supports Node.js applications.

#### Deploy to Replit

1. Push your code to Replit
2. Set environment variables in the Replit Secrets tab
3. Use the "Deploy" button on the Replit interface

#### Deploy to Other Platforms

1. Build the client with `npm run build`
2. Set up environment variables
3. Start the server with `npm start`

## Troubleshooting

- **Database Connection Issues**: Verify the `DATABASE_URL` environment variable is correctly set
- **Stripe Payment Issues**: Ensure the Stripe API keys are valid and correctly set
- **Styling Issues**: Check for any TailwindCSS class conflicts
- **API Errors**: Check the server logs for detailed error messages

## Need Further Help?

If you need additional guidance or have specific questions, please create an issue in the project repository. Our team will be happy to assist you.

---

This README is a living document and will be updated as the project evolves. Last updated: April 2025.