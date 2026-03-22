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
    h1: "24px",
    h2: "20px", 
    h3: "18px",
    h4: "16px",
    body: "16px",
    code: "16px",
    small: "14px",
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

// CSS Custom Properties for global usage
export const novaCSSVars = {
  // Base font sizes
  "--font-size-xs": novaTypography.xs,
  "--font-size-sm": novaTypography.sm,
  "--font-size-base": novaTypography.base,
  "--font-size-lg": novaTypography.lg,
  "--font-size-xl": novaTypography.xl,
  "--font-size-2xl": novaTypography["2xl"],
  "--font-size-3xl": novaTypography["3xl"],
  "--font-size-4xl": novaTypography["4xl"],
  
  // Markdown-specific sizes
  "--font-size-markdown-h1": novaTypography.markdown.h1,
  "--font-size-markdown-h2": novaTypography.markdown.h2,
  "--font-size-markdown-h3": novaTypography.markdown.h3,
  "--font-size-markdown-h4": novaTypography.markdown.h4,
  "--font-size-markdown-body": novaTypography.markdown.body,
  "--font-size-markdown-code": novaTypography.markdown.code,
  "--font-size-markdown-small": novaTypography.markdown.small,
  
  // Component-specific sizes
  "--font-size-component-header": novaTypography.components.header,
  "--font-size-component-status": novaTypography.components.status,
  "--font-size-component-button": novaTypography.components.button,
  "--font-size-component-input": novaTypography.components.input,
  "--font-size-component-label": novaTypography.components.label,
  
  // Line heights
  "--line-height-tight": novaTypography.lineHeight.tight,
  "--line-height-normal": novaTypography.lineHeight.normal,
  "--line-height-relaxed": novaTypography.lineHeight.relaxed,
  
  // Font weights
  "--font-weight-normal": novaTypography.fontWeight.normal,
  "--font-weight-medium": novaTypography.fontWeight.medium,
  "--font-weight-semibold": novaTypography.fontWeight.semibold,
  "--font-weight-bold": novaTypography.fontWeight.bold,
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

// CSS class names for global usage
export const novaFontClasses = {
  // Base size classes
  "text-xs": "font-size: var(--font-size-xs)",
  "text-sm": "font-size: var(--font-size-sm)",
  "text-base": "font-size: var(--font-size-base)",
  "text-lg": "font-size: var(--font-size-lg)",
  "text-xl": "font-size: var(--font-size-xl)",
  "text-2xl": "font-size: var(--font-size-2xl)",
  "text-3xl": "font-size: var(--font-size-3xl)",
  "text-4xl": "font-size: var(--font-size-4xl)",
  
  // Markdown classes
  "markdown-h1": "font-size: var(--font-size-markdown-h1)",
  "markdown-h2": "font-size: var(--font-size-markdown-h2)",
  "markdown-h3": "font-size: var(--font-size-markdown-h3)",
  "markdown-h4": "font-size: var(--font-size-markdown-h4)",
  "markdown-body": "font-size: var(--font-size-markdown-body)",
  "markdown-code": "font-size: var(--font-size-markdown-code)",
  "markdown-small": "font-size: var(--font-size-markdown-small)",
  
  // Component classes
  "component-header": "font-size: var(--font-size-component-header)",
  "component-status": "font-size: var(--font-size-component-status)",
  "component-button": "font-size: var(--font-size-component-button)",
  "component-input": "font-size: var(--font-size-component-input)",
  "component-label": "font-size: var(--font-size-component-label)",
  
  // Line height classes
  "leading-tight": "line-height: var(--line-height-tight)",
  "leading-normal": "line-height: var(--line-height-normal)",
  "leading-relaxed": "line-height: var(--line-height-relaxed)",
  
  // Font weight classes
  "font-normal": "font-weight: var(--font-weight-normal)",
  "font-medium": "font-weight: var(--font-weight-medium)",
  "font-semibold": "font-weight: var(--font-weight-semibold)",
  "font-bold": "font-weight: var(--font-weight-bold)",
};
