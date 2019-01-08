import Typography from 'typography'

const typography = new Typography({
  baseFontSize: "16px",
  baseLineHeight: 1.666,
  headerFontFamily: ["lato", "serif"],
  bodyFontFamily: ["open sans", "serif"]
});

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
