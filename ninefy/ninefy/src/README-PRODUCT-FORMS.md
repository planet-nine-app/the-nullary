# Product Forms Configuration

This directory contains the configurable product form system for Ninefy. You can now edit the product types and their forms directly without touching the code!

## 📁 Configuration File

**`product-forms-config.json`** - Contains all product type definitions, form fields, and display settings.

## 🛠️ How to Edit Product Forms

### Adding a New Product Type

1. Open `product-forms-config.json`
2. Add a new entry under `productTypes`:

```json
{
  "productTypes": {
    "your_new_type": {
      "label": "🎨 Your Product Type",
      "icon": "🎨",
      "title": "🎨 Your Product Details",
      "fields": {
        "title": {
          "type": "text",
          "placeholder": "Product title...",
          "required": true
        },
        "custom_field": {
          "type": "text",
          "placeholder": "Custom field..."
        }
      },
      "displayFields": [
        { "key": "custom_field", "label": "Custom Field", "icon": "🔧" }
      ]
    }
  }
}
```

### Supported Field Types

#### **Text Input**
```json
{
  "type": "text",
  "placeholder": "Enter text...",
  "required": true,
  "value": "default value"
}
```

#### **Number Input**
```json
{
  "type": "number",
  "placeholder": "Enter number...",
  "min": 0,
  "max": 100,
  "step": 0.1
}
```

#### **Select Dropdown**
```json
{
  "type": "select",
  "options": ["Option 1", "Option 2", "Option 3"],
  "placeholder": "Select option..."
}
```

#### **File Upload**
```json
{
  "type": "file",
  "accept": ".pdf,.doc,.txt",
  "label": "Upload Document",
  "placeholder": "Select file..."
}
```

#### **Checkbox**
```json
{
  "type": "checkbox",
  "label": "Check this option"
}
```

#### **Date/Time Picker**
```json
{
  "type": "datetime-local",
  "placeholder": "Select date and time",
  "required": true
}
```

#### **Hidden Field**
```json
{
  "type": "hidden",
  "value": "your_category_name"
}
```

### Display Fields Configuration

Control how metadata appears in product details:

```json
"displayFields": [
  {
    "key": "field_name",
    "label": "Display Label",
    "icon": "🔧",
    "type": "text",
    "suffix": " units"
  }
]
```

**Display Field Types**:
- `"text"` - Plain text display
- `"boolean"` - Shows "Yes/No"
- `"datetime"` - Formatted date/time
- `"file"` - Shows filename with 📎 icon

### Examples

#### E-Commerce Product
```json
"ecommerce": {
  "label": "🛒 E-Commerce Product",
  "icon": "🛒",
  "title": "🛒 Product Information",
  "fields": {
    "title": { "type": "text", "placeholder": "Product name...", "required": true },
    "brand": { "type": "text", "placeholder": "Brand name" },
    "price_range": {
      "type": "select",
      "options": ["Budget", "Mid-Range", "Premium"],
      "placeholder": "Select price range"
    },
    "warranty": { "type": "checkbox", "label": "Includes warranty" },
    "category": { "type": "hidden", "value": "ecommerce" }
  },
  "displayFields": [
    { "key": "brand", "label": "Brand", "icon": "🏷️" },
    { "key": "price_range", "label": "Price Range", "icon": "💰" },
    { "key": "warranty", "label": "Warranty", "icon": "🛡️", "type": "boolean" }
  ]
}
```

## 🔄 How It Works

1. **Config Loading**: The app loads `product-forms-config.json` when the upload form is created
2. **Dynamic Forms**: Form fields are generated based on the selected product type
3. **Validation**: Required fields are enforced automatically
4. **Metadata Display**: Product details show relevant information using `displayFields`

## 🎯 Quick Edits

### Change Product Category Name
Edit the `label` field:
```json
"label": "📚 My Custom E-Book Type"
```

### Add New Form Field
Add to `fields` object:
```json
"isbn": {
  "type": "text",
  "placeholder": "ISBN number (optional)"
}
```

### Show Field in Product Details
Add to `displayFields` array:
```json
{ "key": "isbn", "label": "ISBN", "icon": "🔢" }
```

### Remove a Field
Simply delete it from both `fields` and `displayFields`.

## 🔧 Advanced Configuration

### Conditional Fields
Currently, all fields show for each type. For conditional logic, you'd need to modify the JavaScript code in `main.js`.

### Custom Validation
Basic validation (required, min/max) is supported. For complex validation, modify the `validateForm()` function in `main.js`.

### File Upload Integration
File fields automatically integrate with the existing file upload system. Use `accept` attribute to control file types.

## 📝 Tips

1. **Always test changes** by selecting the product type in the upload form
2. **Use descriptive labels** for better user experience
3. **Include icons** for visual appeal in the details view
4. **Keep required fields minimal** for better conversion
5. **Use consistent naming** for similar fields across types

## 🚀 Deployment

After editing the config file, just refresh the ninefy app - no code changes needed!

The configuration is loaded dynamically, so your changes take effect immediately.