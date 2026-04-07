# Theme Documentation for GenBridge 2.0

## Overview
GenBridge 2.0 implements a comprehensive theme system, allowing users to switch between light and dark themes seamlessly. This document provides detailed information regarding the features, usage instructions for both end users and developers, the color schemes in use, and guidelines on integrating themes into additional pages.

## Features
- **Light/Dark Theme Toggle**: Users can switch between light and dark themes easily.
- **Dynamic Updates**: The theme updates instantly without requiring any page reload.
- **User Preferences**: The selected theme can be saved in user settings for a personalized experience.
- **Accessibility Support**: Both themes are designed to meet accessibility standards, ensuring usability for all users.

## Usage Instructions

### For End Users
1. **Theme Toggle**: Locate the theme toggle switch in the header of the application.
2. **Switching Themes**: Click on the toggle to switch between light and dark themes. Your preference will be saved automatically.
3. **Resetting Preferences**: You can reset your theme preferences in the user settings menu.

### For Developers
1. **Implementing Themes**: Use the provided CSS classes and JavaScript functions to implement themes in your components.
2. **Customizing Themes**: Modify the CSS variables defined in the theme files to create custom color schemes.
3. **Testing Themes**: Ensure that all new components adhere to the theme styles and check for accessibility compliance.

## Color Schemes

### Light Theme
- **Background Color**: #ffffff
- **Text Color**: #000000
- **Primary Color**: #007bff
- **Secondary Color**: #6c757d

### Dark Theme
- **Background Color**: #343a40
- **Text Color**: #f8f9fa
- **Primary Color**: #0d6efd
- **Secondary Color**: #adb5bd

### Color Variables
Define variables in CSS for easy maintenance:
```css
:root {
    --background-color: #ffffff; /* Light */
    --text-color: #000000;      /* Light */
    --primary-color: #007bff;   /* Light */
}

[data-theme='dark'] {
    --background-color: #343a40; /* Dark */
    --text-color: #f8f9fa;      /* Dark */
    --primary-color: #0d6efd;    /* Dark */
}
```

## Integration Guide for Other Pages
1. **Including Theme Files**: Ensure the theme CSS file is linked in the header.
2. **Component Wrap**: Wrap your components with a `<ThemeProvider>` if using React or similar constructs in other frameworks.
3. **Accessing Theme Variables**: Use the defined CSS variables in your styles to maintain consistency across themes.
4. **Testing Integration**: After implementing, test the page with both themes to check for visual consistency and accessibility.

## Conclusion
The theme implementation in GenBridge 2.0 is designed for flexibility and ease of use. By following this documentation, both end users and developers can ensure a consistent and accessible experience across the application.

---

This documentation should be updated as new features are added or existing features are modified.