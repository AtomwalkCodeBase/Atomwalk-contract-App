import { createGlobalStyle } from "styled-components"

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${({ theme }) => theme.fonts?.body || "'Poppins', sans-serif"};
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    transition: all 0.3s ease;
    font-size: ${({ theme }) => theme.fontSizes?.md || "1rem"};
    font-weight: ${({ theme }) => theme.fontWeights?.body || "400"};
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: ${({ theme }) => theme.fontWeights?.heading || "600"};
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.primary};
  }

  a {
    text-decoration: none;
    color: ${({ theme }) => theme.colors.primary};
    transition: color 0.3s ease;
    
    &:hover {
      color: ${({ theme }) => theme.colors.secondary};
    }
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    transition: ${({ theme }) => theme.transitions?.normal || "all 0.3s ease"};
    border-radius: ${({ theme }) => theme.buttons?.borderRadius || "8px"};
  }

  input, select, textarea {
    font-family: ${({ theme }) => theme.fonts?.body || "'Poppins', sans-serif"};
    padding: 10px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    transition: all 0.3s ease;
    
    &:focus {
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
      outline: none;
    }
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
    
    th, td {
      padding: ${({ theme }) => theme.spacing?.md || "12px 15px"};
      text-align: left;
      border-bottom: 1px solid ${({ theme }) => theme.colors.border};
      color: ${({ theme }) => theme.colors.textLight};
    }
    
    th {
      background-color: ${({ theme }) => theme.colors.primaryLight};
      color: ${({ theme }) => theme.colors.textLight};
      font-weight: 600;
    }
    
    tr:hover {
      background-color: ${({ theme }) => theme.colors.backgroundAlt};
    }
  }

  .card {
    background: ${({ theme }) => theme.colors.card};
    border-radius: ${({ theme }) => theme.borderRadius?.lg || "8px"};
    box-shadow: ${({ theme }) => theme.shadows?.md || "0 4px 6px rgba(0, 0, 0, 0.1)"};
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    transition: ${({ theme }) => theme.transitions?.normal || "transform 0.3s ease, box-shadow 0.3s ease"};
    
    &:hover {
      transform: ${({ theme }) => (theme.cardStyle?.animation ? "translateY(-5px)" : "none")};
      box-shadow: ${({ theme }) =>
        theme.cardStyle?.animation
          ? "0 10px 15px rgba(0, 0, 0, 0.1)"
          : theme.shadows?.md || "0 4px 6px rgba(0, 0, 0, 0.1)"};
    }
    
    @media (max-width: 768px) {
      padding: 1rem;
      margin-bottom: 1rem;
      
      &:hover {
        transform: none;
      }
    }
  }

  .container {
    max-width: ${({ theme }) =>
      theme.layout?.containerWidth === "narrow"
        ? "800px"
        : theme.layout?.containerWidth === "wide"
          ? "1400px"
          : "1200px"};
    margin: 0 auto;
    padding: 0 1rem;
  }

  .flex {
    display: flex;
  }

  .flex-col {
    flex-direction: column;
  }

  .items-center {
    align-items: center;
  }

  .justify-between {
    justify-content: space-between;
  }

  .grid {
    display: grid;
  }

  .grid-cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }

  .grid-cols-3 {
    grid-template-columns: repeat(3, 1fr);
  }

  .grid-cols-4 {
    grid-template-columns: repeat(4, 1fr);
  }

  .gap-4 {
    gap: ${({ theme }) => theme.spacing?.md || "1rem"};
  }

  .p-4 {
    padding: ${({ theme }) => theme.spacing?.md || "1rem"};
  }

  .m-4 {
    margin: ${({ theme }) => theme.spacing?.md || "1rem"};
  }

  .mb-4 {
    margin-bottom: ${({ theme }) => theme.spacing?.md || "1rem"};
  }

  .mt-4 {
    margin-top: ${({ theme }) => theme.spacing?.md || "1rem"};
  }

  .text-center {
    text-align: center;
  }

  .text-right {
    text-align: right;
  }

  .rounded {
    border-radius: ${({ theme }) => theme.borderRadius?.md || "4px"};
  }

  .shadow {
    box-shadow: ${({ theme }) => theme.shadows?.md || "0 4px 6px rgba(0, 0, 0, 0.1)"};
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.5s ease forwards;
  }

  .responsive-table {
    overflow-x: auto;
    width: 100%;
  }

  .responsive-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: ${({ theme }) => theme.spacing?.md || "1rem"};
  }

  @media (max-width: 768px) {
    .grid-cols-2, .grid-cols-3, .grid-cols-4 {
      grid-template-columns: 1fr;
    }
    
    .responsive-grid {
      grid-template-columns: 1fr;
    }
    
    .hide-on-mobile {
      display: none;
    }
    
    .p-4 {
      padding: 0.75rem;
    }
    
    .m-4 {
      margin: 0.75rem;
    }
    
    h1 {
      font-size: 1.5rem;
    }
    
    h2 {
      font-size: 1.3rem;
    }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    .grid-cols-3, .grid-cols-4 {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* Layout density styles */
  ${({ theme }) =>
    theme.layout?.density === "compact" &&
    `
    .card, .p-4 {
      padding: 0.75rem;
    }
    
    .gap-4 {
      gap: 0.75rem;
    }
    
    table th, table td {
      padding: 8px 12px;
    }
    
    .mb-4, .mt-4, .m-4 {
      margin: 0.75rem;
    }
  `}

  ${({ theme }) =>
    theme.layout?.density === "spacious" &&
    `
    .card, .p-4 {
      padding: 2rem;
    }
    
    .gap-4 {
      gap: 1.5rem;
    }
    
    table th, table td {
      padding: 16px 20px;
    }
    
    .mb-4, .mt-4, .m-4 {
      margin: 1.5rem;
    }
  `}

  /* Icon size styles */
  ${({ theme }) =>
    theme.icons?.size === "small" &&
    `
    .icon, svg {
      font-size: 0.85em;
    }
  `}

  ${({ theme }) =>
    theme.icons?.size === "large" &&
    `
    .icon, svg {
      font-size: 1.25em;
    }
  `}

  /* Button styles */
  button, .btn {
    border-radius: ${({ theme }) =>
      theme.buttons?.borderRadius === "0" ? "0" : theme.buttons?.borderRadius === "9999px" ? "9999px" : "8px"};
    
    box-shadow: ${({ theme }) => (theme.buttons?.shadow ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none")};
    
    &:hover {
      transform: ${({ theme }) => (theme.buttons?.animation ? "translateY(-2px)" : "none")};
      
      box-shadow: ${({ theme }) =>
        theme.buttons?.shadow && theme.buttons?.animation
          ? "0 6px 8px rgba(0, 0, 0, 0.15)"
          : theme.buttons?.shadow
            ? "0 4px 6px rgba(0, 0, 0, 0.1)"
            : "none"};
    }
  }
`
