import { extendTheme, ThemeConfig, StyleFunctionProps } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,

  // --- CORE COLORS ---
  colors: {
    brand: {
      900: "#050508", // Deep Obsidian
      800: "#0A0A0F", // Card background dark
      700: "#1A1A1E", // Borders dark
      500: "#805AD5", // Forge Purple
      400: "#9F7AEA", // Vibrant Purple
    },
    // Adding specialized gray scales for professional legibility
    gray: {
      50: "#F9FAFB",
      100: "#F3F4F6",
      900: "#050508",
    }
  },

  // --- SEMANTIC TOKENS (The magic for Light/Dark switching) ---
  semanticTokens: {
    colors: {
      "app-bg": { _light: "gray.50", _dark: "brand.900" },
      "card-bg": { _light: "white", _dark: "whiteAlpha.50" },
      "card-border": { _light: "gray.100", _dark: "whiteAlpha.100" },
      "text-main": { _light: "gray.900", _dark: "white" },
      "text-muted": { _light: "gray.500", _dark: "gray.500" },
      "accent-glow": { _light: "purple.500", _dark: "purple.400" },
    },
  },

  // --- GLOBAL STYLES ---
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        bg: "app-bg",
        color: "text-main",
        fontFamily: "'Inter', -apple-system, sans-serif", // Clean, modern font
        transitionProperty: "background-color, color",
        transitionDuration: "0.3s",
      },
      // Smooth scroll for the dashboard sidebar
      "::-webkit-scrollbar": {
        width: "4px",
      },
      "::-webkit-scrollbar-track": {
        bg: "transparent",
      },
      "::-webkit-scrollbar-thumb": {
        bg: props.colorMode === "dark" ? "whiteAlpha.200" : "gray.200",
        borderRadius: "full",
      },
    }),
  },

  // --- COMPONENT OVERRIDES ---
  components: {
    // Buttons: High-end engineering look
    Button: {
      baseStyle: {
        borderRadius: "xl",
        fontWeight: "bold",
        transition: "all 0.2s ease",
      },
      variants: {
        solid: (props: StyleFunctionProps) => ({
          bg: props.colorMode === "dark" ? "white" : "brand.500",
          color: props.colorMode === "dark" ? "black" : "white",
          _hover: {
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(128, 90, 213, 0.3)",
          }
        }),
        ghost: {
          _hover: {
            bg: "whiteAlpha.100",
          }
        }
      }
    },

    // Card: The main container for your Forensic data
    Card: {
      baseStyle: {
        container: {
          bg: "card-bg",
          border: "1px solid",
          borderColor: "card-border",
          borderRadius: "2xl",
          backdropFilter: "blur(12px)",
          transition: "all 0.2s ease-in-out",
        },
      },
    },

    // Heading: Tight and bold like a financial terminal
    Heading: {
      baseStyle: {
        letterSpacing: "tighter",
        fontWeight: "900",
      }
    },

    // Badges: Instructional style
    Badge: {
      baseStyle: {
        borderRadius: "full",
        px: 3,
        py: 0.5,
        textTransform: "none",
        fontWeight: "bold",
        letterSpacing: "wide",
      }
    },

    // Code: Monospace for EVM values
    Code: {
      baseStyle: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "xs",
        borderRadius: "md",
        variant: "outline"
      }
    }
  },
});

export default theme;