"use client"

import { createContext, useState, useContext, useEffect, useMemo } from "react"
import { ThemeProvider as StyledThemeProvider } from "styled-components"

// Define our base themes
const baseThemes = {
  default: {
    name: "Default",
    colors: {
      primary: "#6C63FF", // Vibrant purple
      primaryLight: "#E8E6FF",
      secondary: "#FF6584", // Punchy pink
      secondaryLight: "#FFE5EB",
      accent: "#63FFDA", // Mint green
      accentLight: "#E6FFF7",
      success: "#00C853",
      warning: "#FFD600",
      error: "#FF3D00",
      info: "#2196F3",
      background: "#F8F9FD",
      backgroundAlt: "#F0F2F8",
      card: "#FFFFFF",
      text: "#333333",
      textLight: "#666666",
      border: "#E0E0E0",
      shadow: "rgba(108, 99, 255, 0.1)",
    },
  },
  ocean: {
    name: "Ocean",
    colors: {
      primary: "#0277BD", // Deep blue
      primaryLight: "#E1F5FE",
      secondary: "#00BCD4", // Cyan
      secondaryLight: "#E0F7FA",
      accent: "#26A69A", // Teal
      accentLight: "#E0F2F1",
      success: "#00C853",
      warning: "#FFC107",
      error: "#F44336",
      info: "#29B6F6",
      background: "#F5F7FA",
      backgroundAlt: "#E1F5FE",
      card: "#FFFFFF",
      text: "#263238",
      textLight: "#546E7A",
      border: "#CFD8DC",
      shadow: "rgba(2, 119, 189, 0.1)",
    },
  },
  sunset: {
    name: "Sunset",
    colors: {
      primary: "#FF5722", // Deep orange
      primaryLight: "#FBE9E7",
      secondary: "#FF9800", // Orange
      secondaryLight: "#FFF3E0",
      accent: "#FFC107", // Amber
      accentLight: "#FFF8E1",
      success: "#4CAF50",
      warning: "#FF9800",
      error: "#F44336",
      info: "#2196F3",
      background: "#FFF8F6",
      backgroundAlt: "#FFF3E0",
      card: "#FFFFFF",
      text: "#3E2723",
      textLight: "#5D4037",
      border: "#FFCCBC",
      shadow: "rgba(255, 87, 34, 0.1)",
    },
  },
  dark: {
    name: "Dark",
    colors: {
      primary: "#483A6F",
      primaryLight: "#2E2845",
      secondary: "#1A5F51",
      secondaryLight: "#0E3D35",
      accent: "#7E3B54",
      accentLight: "#4A2432",
      success: "#1F5C2E",
      warning: "#7D5700",
      error: "#7D2B2B",
      info: "#2C5282",
      background: "#0A0A0A",
      backgroundAlt: "#121212",
      card: "#1A1A1A",
      text: "#E0E0E0",
      textLight: "#8A8A8A",
      border: "#2A2A2A",
      shadow: "rgba(0, 0, 0, 0.6)",
    },
  },
}

// Default UI preferences
const defaultUIPreferences = {
  cardStyle: {
    borderRadius: "16px",
    shadow: "medium",
    border: false,
    animation: true,
  },
  buttonStyle: {
    borderRadius: "8px",
    shadow: true,
    animation: true,
    iconPosition: "left",
  },
  iconStyle: {
    size: "medium",
    style: "filled",
  },
  typography: {
    fontFamily: "'Centra', sans-serif",
    headingWeight: "600",
    bodyWeight: "400",
    fontSize: "medium",
  },
  layout: {
    density: "comfortable",
    containerWidth: "standard",
    sidebarStyle: "floating",
  },
}

// Create the context
const ThemeContext = createContext()

// Create a custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext)

// Create the theme provider component
export const ThemeProvider = ({ children }) => {
  // Get the saved theme from localStorage or use default
  const [currentTheme, setCurrentTheme] = useState("default")
  const [customColors, setCustomColors] = useState({})
  const [uiPreferences, setUIPreferences] = useState(defaultUIPreferences)
  const [isCustomTheme, setIsCustomTheme] = useState(false)

  // Load saved preferences from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("hrms-theme")
      const savedCustomColors = localStorage.getItem("hrms-custom-colors")
      const savedUIPreferences = localStorage.getItem("hrms-ui-preferences")
      const savedIsCustomTheme = localStorage.getItem("hrms-is-custom-theme")

      if (savedTheme) setCurrentTheme(savedTheme)
      if (savedCustomColors) setCustomColors(JSON.parse(savedCustomColors))
      if (savedUIPreferences) setUIPreferences(JSON.parse(savedUIPreferences))
      if (savedIsCustomTheme) setIsCustomTheme(JSON.parse(savedIsCustomTheme))
    }
  }, [])

  // Update the theme
  const changeTheme = (themeName) => {
    setCurrentTheme(themeName)
    setIsCustomTheme(false)
    localStorage.setItem("hrms-theme", themeName)
    localStorage.setItem("hrms-is-custom-theme", "false")
  }

  // Update custom colors
  const updateCustomColors = (newColors) => {
    const updatedColors = { ...customColors, ...newColors }
    setCustomColors(updatedColors)
    setIsCustomTheme(true)
    localStorage.setItem("hrms-custom-colors", JSON.stringify(updatedColors))
    localStorage.setItem("hrms-is-custom-theme", "true")
  }

  // Update UI preferences
  const updateUIPreferences = (category, preferences) => {
    const updatedPreferences = {
      ...uiPreferences,
      [category]: { ...uiPreferences[category], ...preferences },
    }
    setUIPreferences(updatedPreferences)
    localStorage.setItem("hrms-ui-preferences", JSON.stringify(updatedPreferences))
  }

  // Reset all customizations
  const resetCustomizations = () => {
    setUIPreferences(defaultUIPreferences)
    setCustomColors({})
    setIsCustomTheme(false)
    localStorage.setItem("hrms-ui-preferences", JSON.stringify(defaultUIPreferences))
    localStorage.removeItem("hrms-custom-colors")
    localStorage.setItem("hrms-is-custom-theme", "false")
  }

  // Get the current theme object
  const baseTheme = baseThemes[currentTheme] || baseThemes.default

  // Merge custom colors with base theme colors if using custom theme
  const themeColors = isCustomTheme ? { ...baseTheme.colors, ...customColors } : baseTheme.colors

  // Apply UI preferences to create the complete theme
  const completeTheme = useMemo(
    () => ({
      name: isCustomTheme ? "Custom" : baseTheme.name,
      colors: themeColors,
      fonts: {
        body: uiPreferences.typography.fontFamily,
        heading: uiPreferences.typography.fontFamily,
      },
      fontSizes: {
        xs:
          uiPreferences.typography.fontSize === "small"
            ? "0.7rem"
            : uiPreferences.typography.fontSize === "large"
              ? "0.8rem"
              : "0.75rem",
        sm:
          uiPreferences.typography.fontSize === "small"
            ? "0.8rem"
            : uiPreferences.typography.fontSize === "large"
              ? "0.95rem"
              : "0.875rem",
        md:
          uiPreferences.typography.fontSize === "small"
            ? "0.9rem"
            : uiPreferences.typography.fontSize === "large"
              ? "1.1rem"
              : "1rem",
        lg:
          uiPreferences.typography.fontSize === "small"
            ? "1rem"
            : uiPreferences.typography.fontSize === "large"
              ? "1.25rem"
              : "1.125rem",
        xl:
          uiPreferences.typography.fontSize === "small"
            ? "1.1rem"
            : uiPreferences.typography.fontSize === "large"
              ? "1.4rem"
              : "1.25rem",
        "2xl":
          uiPreferences.typography.fontSize === "small"
            ? "1.3rem"
            : uiPreferences.typography.fontSize === "large"
              ? "1.7rem"
              : "1.5rem",
        "3xl":
          uiPreferences.typography.fontSize === "small"
            ? "1.6rem"
            : uiPreferences.typography.fontSize === "large"
              ? "2.1rem"
              : "1.875rem",
        "4xl":
          uiPreferences.typography.fontSize === "small"
            ? "2rem"
            : uiPreferences.typography.fontSize === "large"
              ? "2.5rem"
              : "2.25rem",
        "5xl":
          uiPreferences.typography.fontSize === "small"
            ? "2.5rem"
            : uiPreferences.typography.fontSize === "large"
              ? "3.5rem"
              : "3rem",
      },
      fontWeights: {
        heading: uiPreferences.typography.headingWeight,
        body: uiPreferences.typography.bodyWeight,
      },
      breakpoints: {
        xs: "320px",
        sm: "576px",
        md: "768px",
        lg: "992px",
        xl: "1200px",
      },
      spacing: {
        xs:
          uiPreferences.layout.density === "compact"
            ? "0.2rem"
            : uiPreferences.layout.density === "spacious"
              ? "0.3rem"
              : "0.25rem",
        sm:
          uiPreferences.layout.density === "compact"
            ? "0.4rem"
            : uiPreferences.layout.density === "spacious"
              ? "0.6rem"
              : "0.5rem",
        md:
          uiPreferences.layout.density === "compact"
            ? "0.8rem"
            : uiPreferences.layout.density === "spacious"
              ? "1.2rem"
              : "1rem",
        lg:
          uiPreferences.layout.density === "compact"
            ? "1.2rem"
            : uiPreferences.layout.density === "spacious"
              ? "1.8rem"
              : "1.5rem",
        xl:
          uiPreferences.layout.density === "compact"
            ? "1.6rem"
            : uiPreferences.layout.density === "spacious"
              ? "2.4rem"
              : "2rem",
        "2xl":
          uiPreferences.layout.density === "compact"
            ? "2.4rem"
            : uiPreferences.layout.density === "spacious"
              ? "3.6rem"
              : "3rem",
        "3xl":
          uiPreferences.layout.density === "compact"
            ? "3.2rem"
            : uiPreferences.layout.density === "spacious"
              ? "4.8rem"
              : "4rem",
      },
      borderRadius: {
        sm:
          uiPreferences.cardStyle.borderRadius === "square"
            ? "0"
            : uiPreferences.cardStyle.borderRadius === "rounded"
              ? "0.25rem"
              : "0.125rem",
        md:
          uiPreferences.cardStyle.borderRadius === "square"
            ? "0"
            : uiPreferences.cardStyle.borderRadius === "rounded"
              ? "0.5rem"
              : "0.25rem",
        lg:
          uiPreferences.cardStyle.borderRadius === "square"
            ? "0"
            : uiPreferences.cardStyle.borderRadius === "rounded"
              ? "1rem"
              : "0.5rem",
        xl:
          uiPreferences.cardStyle.borderRadius === "square"
            ? "0"
            : uiPreferences.cardStyle.borderRadius === "rounded"
              ? "2rem"
              : "1rem",
        full: "9999px",
      },
      shadows: {
        none: "none",
        sm:
          uiPreferences.cardStyle.shadow === "none"
            ? "none"
            : uiPreferences.cardStyle.shadow === "heavy"
              ? "0 2px 5px rgba(0, 0, 0, 0.15)"
              : "0 1px 3px rgba(0, 0, 0, 0.12)",
        md:
          uiPreferences.cardStyle.shadow === "none"
            ? "none"
            : uiPreferences.cardStyle.shadow === "heavy"
              ? "0 6px 12px rgba(0, 0, 0, 0.15)"
              : "0 4px 6px rgba(0, 0, 0, 0.1)",
        lg:
          uiPreferences.cardStyle.shadow === "none"
            ? "none"
            : uiPreferences.cardStyle.shadow === "heavy"
              ? "0 15px 25px rgba(0, 0, 0, 0.15)"
              : "0 10px 15px rgba(0, 0, 0, 0.1)",
        xl:
          uiPreferences.cardStyle.shadow === "none"
            ? "none"
            : uiPreferences.cardStyle.shadow === "heavy"
              ? "0 25px 35px rgba(0, 0, 0, 0.15)"
              : "0 20px 25px rgba(0, 0, 0, 0.1)",
      },
      transitions: {
        fast: uiPreferences.cardStyle.animation ? "0.2s ease" : "0s",
        normal: uiPreferences.cardStyle.animation ? "0.3s ease" : "0s",
        slow: uiPreferences.cardStyle.animation ? "0.5s ease" : "0s",
      },
      buttons: {
        borderRadius: uiPreferences.buttonStyle.borderRadius,
        shadow: uiPreferences.buttonStyle.shadow,
        animation: uiPreferences.buttonStyle.animation,
        iconPosition: uiPreferences.buttonStyle.iconPosition,
      },
      icons: {
        size: uiPreferences.iconStyle.size,
        style: uiPreferences.iconStyle.style,
      },
      layout: {
        containerWidth: uiPreferences.layout.containerWidth,
        sidebarStyle: uiPreferences.layout.sidebarStyle,
        density: uiPreferences.layout.density,
      },
      // Add direct references to UI preferences for easier access in components
      uiPreferences: uiPreferences,
      cardStyle: uiPreferences.cardStyle,
      buttonStyle: uiPreferences.buttonStyle,
      iconStyle: uiPreferences.iconStyle,
      typographyStyle: uiPreferences.typography,
      layoutStyle: uiPreferences.layout,
    }),
    [baseTheme.name, themeColors, uiPreferences, isCustomTheme],
  )

  return (
    <ThemeContext.Provider
      value={{
        theme: completeTheme,
        currentTheme,
        changeTheme,
        baseThemes,
        customColors,
        updateCustomColors,
        uiPreferences,
        updateUIPreferences,
        isCustomTheme,
        resetCustomizations,
      }}
    >
      <StyledThemeProvider theme={completeTheme}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  )
}
