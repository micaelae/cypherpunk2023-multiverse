import { createGlobalStyle, DefaultTheme } from 'styled-components';

const breakpoints = ['600px', '768px', '992px'];

/**
 * Common theme properties.
 */
const theme = {
  fonts: {
    default:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
    code: 'ui-monospace,Menlo,Monaco,"Cascadia Mono","Segoe UI Mono","Roboto Mono","Oxygen Mono","Ubuntu Monospace","Source Code Pro","Fira Mono","Droid Sans Mono","Courier New", monospace',
  },
  fontSizes: {
    heading: '5.2rem',
    mobileHeading: '3.6rem',
    title: '2.4rem',
    large: '2rem',
    text: '1.6rem',
    small: '1.4rem',
  },
  radii: {
    default: '24px',
    button: '8px',
  },
  breakpoints,
  mediaQueries: {
    small: `@media screen and (max-width: ${breakpoints[0]})`,
    medium: `@media screen and (min-width: ${breakpoints[1]})`,
    large: `@media screen and (min-width: ${breakpoints[2]})`,
  },
  shadows: {
    default: '0 8px 32px 0 rgba( 220, 238, 232, 0.07 )',
    button: '0px 0px 16.1786px rgba(0, 0, 0, 0.15);',
  },
};

/**
 * Light theme color properties.
 */
export const light: DefaultTheme = {
  colors: {
    background: {
      default: '#FFFFFF',
      alternative: '#43384B',
      inverse: '#43384B',
      action: 'linear-gradient(92.14deg, #ddd2e6 1.25%, #c7d9ed 98.51%)',
    },
    icon: {
      default: '#141618',
      alternative: '#BBC0C5',
    },
    text: {
      default: '#434547',
      muted: '#9B8CA5',
      alternative: '#D6D9DC',
      inverse: '#D6D9DC',
    },
    border: {
      default: '#BBC0C5',
    },
    primary: {
      default: '#6F4CFF',
      inverse: '#FFFFFF',
    },
    card: {
      default: '#FFFFFF',
    },
    error: {
      default: '#d73a49',
      alternative: '#b92534',
      muted: '#d73a4919',
    },
  },
  ...theme,
};

/**
 * Dark theme color properties
 */
export const dark: DefaultTheme = {
  colors: {
    background: {
      default: '#2B2430',
      alternative: '#43384B',
      inverse: '#D6CEDB',
      action: 'linear-gradient(92.14deg, #6657c2 1.25%, #9357c2 98.51%)',
    },
    icon: {
      default: '#FFFFFF',
      alternative: '#BBC0C5',
    },
    text: {
      default: '#D6CEDB',
      muted: '#9B8CA5',
      alternative: '#D6D9DC',
      inverse: '#24272A',
    },
    border: {
      default: 'rgba(255, 255, 255, 0.18)',
    },
    primary: {
      default: '#6F4CFF',
      inverse: '#FFFFFF',
    },
    card: {
      default: 'rgba(191, 128, 61, 0.1)',
      border: '1px solid rgba( 255, 255, 255, 0.18 )',
    },
    error: {
      default: '#d73a49',
      alternative: '#b92534',
      muted: '#d73a4919',
    },
  },
  ...theme,
};

/**
 * Default style applied to the app.
 *
 * @param props - Styled Components props.
 * @returns Global style React component.
 */
export const GlobalStyle = createGlobalStyle`
  html {
    /* 62.5% of the base size of 16px = 10px.*/
    font-size: 62.5%;
  }

  body {
    background-color: ${(props) => props.theme.colors.background.default};
    color: ${(props) => props.theme.colors.text.muted};
    font-family: ${(props) => props.theme.fonts.default};
    font-size: ${(props) => props.theme.fontSizes.text};
    margin: 0;
  }

  * {
    transition: background-color .1s linear;
  }

  h1, h2, h3, h4, h5, h6 {
    font-size: ${(props) => props.theme.fontSizes.heading};
    ${(props) => props.theme.mediaQueries.small} {
      font-size: ${(props) => props.theme.fontSizes.mobileHeading};
    }
  }

  code {
    background-color: ${(props) => props.theme.colors.background.alternative};
    font-family: ${(props) => props.theme.fonts.code};
    padding: 1.2rem;
    font-weight: normal;
    font-size: ${(props) => props.theme.fontSizes.text};
  }

  button {
    font-size: ${(props) => props.theme.fontSizes.small};
    border-radius: ${(props) => props.theme.radii.button};
    border:none;
    font-weight: 600;
    font-family: 'Open Sans';
    font-style: normal;
    font-size: 14px;
    line-height: 155%;
    padding: 1rem;
    min-height: 4.2rem;
    cursor: pointer;
    transition: all .2s ease-in-out;

    &:hover {
      background-color: transparent;
      border: 1px solid ${(props) => props.theme.colors.background.inverse};
      color: ${(props) => props.theme.colors.text.default};
    }

    &:disabled,
    &[disabled] {
      color: ${(props) => props.theme.colors.text.muted};
      border: 1px solid transparent;
      cursor: not-allowed;
    }

    &:disabled:hover,
    &[disabled]:hover {
      background-color: ${(props) => props.theme.colors.background.inverse};
      color: ${(props) => props.theme.colors.text.inverse};
      border: 1px solid ${(props) => props.theme.colors.background.inverse};
    }
  }
`;
