import Typography from 'typography'

const typography = new Typography({
  baseFontSize: "16px",
  baseLineHeight: 1.666,
  headerFontFamily: ["lato", "serif"],
  bodyFontFamily: ["open sans", "serif"]
})

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  const typography = new Typography({
    baseFontSize: "18px",
    baseLineHeight: 1.666,
    headerFontFamily: ["lato", "serif"],
    bodyFontFamily: ["open sans", "serif"]
  })
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
