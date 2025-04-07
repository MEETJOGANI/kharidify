# kharidify - Site Settings Customization Guide

This document provides detailed instructions on how to customize the appearance and behavior of the kharidify e-commerce platform through the site settings system.

## Overview

The site settings system allows you to customize various aspects of the website without modifying code. These settings are stored in the database and can be managed through:

1. The Admin Dashboard interface
2. Direct API calls
3. Database updates

## Available Site Settings

| Setting Key | Description | Type | Example Value |
|-------------|-------------|------|--------------|
| `site.logoUrl` | URL to the site logo | String | `/uploads/logo.png` |
| `site.primaryColor` | Primary brand color | String (Hex) | `#D4AF37` |
| `site.secondaryColor` | Secondary brand color | String (Hex) | `#8B4513` |
| `site.accentColor` | Accent color for highlights | String (Hex) | `#B87333` |
| `site.backgroundColor` | Background color | String (Hex) | `#FAF9F6` |
| `site.textColor` | Main text color | String (Hex) | `#333333` |
| `site.heroImage` | Hero image on homepage | String | `/uploads/hero.jpg` |
| `site.footerText` | Copyright text in footer | String | `© 2025 kharidify` |
| `site.metaTitle` | Default page title | String | `kharidify - Luxury Sustainable Fashion` |
| `site.metaDescription` | Default meta description | String | `Discover sustainable luxury fashion...` |

## How Site Settings Work

The site settings are implemented through:

1. A database table (`settings`) that stores key-value pairs
2. A React context provider (`SiteSettingsContext`) that makes settings available globally
3. API endpoints to retrieve and update settings
4. Admin UI components for visual editing

## Access Site Settings in Code

### Frontend Access

To use site settings in React components:

```tsx
import { useSiteSettings } from "@/context/SiteSettingsContext";

function MyComponent() {
  const { settings } = useSiteSettings();
  
  return (
    <div style={{ backgroundColor: settings.backgroundColor }}>
      <img src={settings.logoUrl} alt="kharidify" />
    </div>
  );
}
```

### Backend Access

To access settings in backend code:

```typescript
// In any route handler
const settings = await storage.getSettings("site");
const formattedSettings = settings.reduce((acc, setting) => {
  const settingName = setting.key.replace("site.", "");
  acc[settingName] = setting.value;
  return acc;
}, {} as Record<string, string>);

// Use formattedSettings object
```

## Customizing Site Settings

### Method 1: Using the Admin Dashboard

1. Log in to the admin dashboard
2. Navigate to "Site Settings"
3. Use the visual interface to update colors, upload images, etc.
4. Save changes

The admin interface provides:
- Color pickers for theme colors
- File upload for logo and images
- Text inputs for various settings

### Method 2: Via API

You can update settings programmatically via API calls:

```javascript
// Example: Update primary color
fetch("/api/settings", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    settings: {
      "site.primaryColor": "#D4AF37"
    }
  })
});
```

### Method 3: Direct Database Updates

For bulk updates or initial setup, you can modify the database directly:

```sql
-- Example: Insert or update primary color
INSERT INTO settings (key, value, category, description)
VALUES (
  "site.primaryColor", 
  "#D4AF37", 
  "site", 
  "Primary brand color"
)
ON CONFLICT (key) 
DO UPDATE SET value = "#D4AF37";
```

## Implementation Details

### SiteSettingsContext Implementation

The context provider in `client/src/context/SiteSettingsContext.tsx` fetches settings from the API and provides them to all components:

```tsx
export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const { 
    data: settings,
    isLoading,
    error,
    refetch: refreshSettings
  } = useQuery({
    queryKey: ["/api/site-settings"],
    queryFn: getQueryFn({ on401: "throw" })
  });

  // Default settings used if API call fails
  const defaultSettings = {
    logoUrl: null,
    primaryColor: "#D4AF37", // Gold
    secondaryColor: "#8B4513", // Brown
    backgroundColor: "#FAF9F6", // Off-white
    textColor: "#333333", // Dark gray
    accentColor: "#B87333", // Copper
  };

  return (
    <SiteSettingsContext.Provider
      value={{
        settings: settings || defaultSettings,
        isLoading,
        error,
        refreshSettings,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};
```

### API Endpoints Implementation

The settings API endpoints in `server/routes.ts` handle retrieving and updating settings:

```typescript
// Get site settings
app.get("/api/site-settings", async (req, res) => {
  try {
    const siteSettings = await storage.getSettings("site");
    
    // Transform into usable format for frontend
    const formattedSettings = siteSettings.reduce((acc, setting) => {
      // Extract the setting name from the key (e.g., "site.logoUrl" -> "logoUrl")
      const settingName = setting.key.replace("site.", "");
      acc[settingName] = setting.value;
      return acc;
    }, {} as Record<string, string>);
    
    res.json(formattedSettings);
  } catch (err) {
    console.error("Error fetching site settings:", err);
    res.status(500).json({ message: "Error fetching site settings" });
  }
});
```

### Theme Variables Integration

The site settings automatically update CSS variables for theming:

```tsx
// In App.tsx or a similar root component
function ThemeVariables() {
  const { settings } = useSiteSettings();
  
  useEffect(() => {
    // Apply theme colors to CSS variables
    document.documentElement.style.setProperty("--primary", settings.primaryColor);
    document.documentElement.style.setProperty("--secondary", settings.secondaryColor);
    document.documentElement.style.setProperty("--background", settings.backgroundColor);
    document.documentElement.style.setProperty("--text", settings.textColor);
    document.documentElement.style.setProperty("--accent", settings.accentColor);
  }, [settings]);
  
  return null;
}
```

## Advanced Customization

### Adding New Site Settings

To add a new site setting:

1. Add the setting to the database through the API or direct insertion
2. Update the SiteSettings type in `context/SiteSettingsContext.tsx` if needed
3. Use the setting in your components

Example of adding a new "bannerMessage" setting:

```typescript
// 1. Add to database
await storage.createSetting({
  key: "site.bannerMessage",
  value: "Free shipping on orders over $100!",
  category: "site",
  description: "Message to display in announcement banner"
});

// 2. Update SiteSettings type if needed
type SiteSettings = {
  // existing fields
  bannerMessage: string | null;
};

// 3. Use in components
const { settings } = useSiteSettings();
if (settings.bannerMessage) {
  return <Banner message={settings.bannerMessage} />;
}
```

### Creating Theme Presets

You can create theme presets as collections of related settings:

```typescript
const THEMES = {
  gold: {
    primaryColor: "#D4AF37",
    secondaryColor: "#8B4513",
    accentColor: "#B87333",
    backgroundColor: "#FAF9F6",
    textColor: "#333333"
  },
  emerald: {
    primaryColor: "#50C878",
    secondaryColor: "#2E8B57",
    accentColor: "#00A36C",
    backgroundColor: "#F5F5F5",
    textColor: "#333333"
  }
};

// Apply a theme preset
async function applyTheme(themeName) {
  const theme = THEMES[themeName];
  if (!theme) return;
  
  const settings = {};
  Object.entries(theme).forEach(([key, value]) => {
    settings[`site.${key}`] = value;
  });
  
  await fetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ settings })
  });
}
```

## Troubleshooting

### Settings Not Applying

If settings are not being applied correctly:

1. Check the browser console for errors in the SiteSettingsContext
2. Verify the settings exist in the database
3. Ensure the component is using the useSiteSettings hook correctly
4. Clear browser cache to refresh CSS variables

### Image Upload Issues

For logo or image upload problems:

1. Verify the upload directory exists and has proper permissions
2. Check file size limits and allowed MIME types
3. Ensure the correct URL path is being saved to the database

## Best Practices

1. Use the Admin UI for visual settings when possible
2. Create a backup of settings before making major changes
3. Use meaningful key names with the appropriate prefix (e.g., "site.")
4. Test settings changes in different browsers and screen sizes
5. Keep default values in the SiteSettingsContext as a fallback

---

This guide should help you fully customize the appearance and behavior of the kharidify e-commerce platform using the site settings system.

Last updated: April 2025.
