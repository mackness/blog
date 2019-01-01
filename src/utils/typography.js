import Typography from 'typography'
import FairyGates from 'typography-theme-fairy-gates'

FairyGates.overrideThemeStyles = () => {
  return {
    'a': {
      textDecoration: `none`
    }
  }
}

const typography = new Typography({
  baseFontSize: "18px",
  baseLineHeight: 1.666,
  headerFontFamily: ["Avenir Next", "serif"],
  bodyFontFamily: ["Avenir Next", "serif"]
})

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
