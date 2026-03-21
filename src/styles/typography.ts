// src/styles/typography.ts

// Global typography system for Nova AI
// Centralized text sizes for consistent scaling across the project

export const novaTypography = {
  // Base font sizes (in px)
  xs: "12px",
  sm: "14px", 
  base: "16px",
  lg: "18px",
  xl: "20px",
  "2xl": "24px",
  "3xl": "30px",
  "4xl": "36px",

  // Markdown-specific sizes
  markdown: {
    h1: "22px",
    h2: "18px", 
    h3: "16px",
    h4: "15px",
    body: "15px",
    code: "14px",
    small: "12px",
  },

  // Component-specific sizes
  components: {
    header: "20px",
    status: "11px",
    button: "14px",
    input: "14px",
    label: "12px",
  },

  // Line heights
  lineHeight: {
    tight: "1.25",
    normal: "1.5", 
    relaxed: "1.625",
  },

  // Font weights
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600", 
    bold: "700",
  },
};

// Tailwind-compatible font size classes
export const novaFontSizes = {
  // Base sizes (override Tailwind defaults)
  xs: novaTypography.xs,
  sm: novaTypography.sm,
  base: novaTypography.base,
  lg: novaTypography.lg,
  xl: novaTypography.xl,
  "2xl": novaTypography["2xl"],
  "3xl": novaTypography["3xl"],
  "4xl": novaTypography["4xl"],
  
  // Markdown-specific (unique names to avoid conflicts)
  "markdown-h1": novaTypography.markdown.h1,
  "markdown-h2": novaTypography.markdown.h2,
  "markdown-h3": novaTypography.markdown.h3,
  "markdown-h4": novaTypography.markdown.h4,
  "markdown-body": novaTypography.markdown.body,
  "markdown-code": novaTypography.markdown.code,
  "markdown-small": novaTypography.markdown.small,
  
  // Component-specific (unique names to avoid conflicts)
  "component-header": novaTypography.components.header,
  "component-status": novaTypography.components.status,
  "component-button": novaTypography.components.button,
  "component-input": novaTypography.components.input,
  "component-label": novaTypography.components.label,
};
