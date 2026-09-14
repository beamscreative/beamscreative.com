import '../styles/reset.css'
import '../styles/main.css'
import { initSlider } from './slider.js'
import { initPortfolio } from './portfolio.js'
import { initAbout } from './about.js'
import { initGlassIcons } from './glass-icons.js'

const slider = initSlider()
initAbout()
initPortfolio(slider)
initGlassIcons().catch((error) => console.warn('[glass-icons] Falling back to CSS glass', error))
