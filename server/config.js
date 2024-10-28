// config.js
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const STORAGE_DIR = path.join(__dirname, 'storage')
export const VIDEO_DIR = path.join(__dirname, 'videos')
export const DATA_FILE = path.join(STORAGE_DIR, 'videosData.json')
export const PORT = 3000
