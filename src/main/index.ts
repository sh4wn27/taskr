import { app, BrowserWindow, Tray, globalShortcut, ipcMain, nativeImage, Notification } from 'electron'
import { join } from 'path'
import { deflateSync } from 'zlib'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import type { AppStore, Task, Idea, Reminder, JournalEntry } from '../shared/types'

if (!app.requestSingleInstanceLock()) { app.quit(); process.exit(0) }

app.dock?.hide()

// ── Simple file-based store (no external deps, no CJS/ESM issues) ─────────────

const DEFAULTS: AppStore = { tasks: [], ideas: [], reminders: [], journal: [] }
let _cache: AppStore | null = null

function storePath() {
  const dir = app.getPath('userData')
  mkdirSync(dir, { recursive: true })
  return join(dir, 'data.json')
}

function storeRead(): AppStore {
  try {
    return { ...DEFAULTS, ...JSON.parse(readFileSync(storePath(), 'utf-8')) }
  } catch { return { ...DEFAULTS } }
}

function storeGet<K extends keyof AppStore>(key: K): AppStore[K] {
  if (!_cache) _cache = storeRead()
  return _cache[key]
}

function storeSet<K extends keyof AppStore>(key: K, value: AppStore[K]) {
  if (!_cache) _cache = storeRead()
  _cache[key] = value
  try { writeFileSync(storePath(), JSON.stringify(_cache)) } catch (e) { console.error(e) }
}

// ── State ─────────────────────────────────────────────────────────────────────

let tray: Tray | null = null
let win: BrowserWindow | null = null
const scheduledReminders = new Map<string, ReturnType<typeof setTimeout>>()
const isDev = !app.isPackaged

// ── Tray icon (generated PNG) ─────────────────────────────────────────────────

function createTrayIcon(): Electron.NativeImage {
  try {
    const size = 22
    const pixels = new Uint8Array(size * size * 4)
    const dot = (x: number, y: number) => {
      if (x < 0 || x >= size || y < 0 || y >= size) return
      const i = (y * size + x) * 4
      pixels[i] = pixels[i + 1] = pixels[i + 2] = 0; pixels[i + 3] = 255
    }
    for (const ly of [5, 11, 17]) {
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) dot(3 + dx, ly + dy)
      for (let x = 7; x <= 19; x++) { dot(x, ly - 1); dot(x, ly); dot(x, ly + 1) }
    }
    const raw = Buffer.alloc(size * (1 + size * 4))
    for (let y = 0; y < size; y++) {
      raw[y * (1 + size * 4)] = 0
      for (let x = 0; x < size; x++) raw.set(pixels.slice((y * size + x) * 4, (y * size + x) * 4 + 4), y * (1 + size * 4) + 1 + x * 4)
    }
    const crcTable = new Uint32Array(256)
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; crcTable[n] = c }
    const crc32 = (b: Buffer) => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0 }
    const chunk = (type: string, data: Buffer) => { const tb = Buffer.from(type, 'ascii'); const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([tb, data])), 0); return Buffer.concat([len, tb, data, crc]) }
    const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6
    const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
    const img = nativeImage.createFromBuffer(png); img.setTemplateImage(true); return img
  } catch {
    // Fallback: empty image, title will show in menu bar
    return nativeImage.createEmpty()
  }
}

// ── Window ────────────────────────────────────────────────────────────────────

function createWindow() {
  win = new BrowserWindow({
    width: 380,
    height: 520,
    show: false,
    frame: false,
    hasShadow: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    backgroundColor: '#0e0e0e',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  // Dev: load from Vite dev server. Prod: load built file.
  if (isDev) {
    // Use 127.0.0.1 explicitly — Node 20 resolves 'localhost' to ::1 (IPv6)
    // but Vite binds to 127.0.0.1 (IPv4), causing ERR_CONNECTION_REFUSED
    const DEV_URL = 'http://127.0.0.1:5173'
    let retries = 0
    const tryLoad = () => {
      win?.loadURL(DEV_URL).catch(() => {
        if (retries++ < 20) setTimeout(tryLoad, 500)
      })
    }
    tryLoad()
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  win.webContents.on('did-fail-load', (_, code, desc) => {
    console.error(`[taskr] failed to load: ${code} ${desc}`)
  })

  // Only auto-hide on blur in production (dev DevTools would trigger it)
  if (!isDev) {
    win.on('blur', () => setTimeout(() => { if (!win?.isFocused()) win?.hide() }, 150))
  }
}

function toggleWindow() {
  if (!win || !tray) return
  if (win.isVisible()) {
    win.hide()
  } else {
    const bounds = tray.getBounds()
    const [w] = win.getSize()
    win.setPosition(
      Math.round(bounds.x + bounds.width / 2 - w / 2),
      Math.round(bounds.y + bounds.height + 4),
      false
    )
    win.show()
    win.focus()
    win.webContents.send('window:shown')
  }
}

// ── Reminder scheduling ───────────────────────────────────────────────────────

function scheduleReminder(r: Reminder) {
  if (r.completed) return
  const delay = new Date(r.datetime).getTime() - Date.now()
  if (delay <= 0) return
  const t = setTimeout(() => { new Notification({ title: 'Taskr', body: r.title }).show(); scheduledReminders.delete(r.id) }, delay)
  scheduledReminders.set(r.id, t)
}

function cancelScheduled(id: string) {
  const t = scheduledReminders.get(id)
  if (t) { clearTimeout(t); scheduledReminders.delete(id) }
}

// ── App ready ─────────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  const icon = createTrayIcon()
  tray = new Tray(icon)
  if (icon.isEmpty()) tray.setTitle('◉')
  tray.setToolTip('Taskr')
  tray.on('click', toggleWindow)

  createWindow()

  globalShortcut.register('CommandOrControl+Shift+Space', toggleWindow)

  // Reminders whose time already passed while the app was closed would
  // otherwise be silently dropped (scheduleReminder no-ops on delay <= 0) —
  // fire those immediately instead of losing them.
  storeGet('reminders').forEach(r => {
    if (r.completed) return
    if (new Date(r.datetime).getTime() <= Date.now()) {
      new Notification({ title: 'Taskr', body: r.title }).show()
    } else {
      scheduleReminder(r)
    }
  })
})

app.on('before-quit', () => globalShortcut.unregisterAll())
app.on('window-all-closed', (e: Event) => e.preventDefault())

// ── IPC: Tasks ────────────────────────────────────────────────────────────────

ipcMain.handle('tasks:get', () => storeGet('tasks'))

ipcMain.handle('tasks:add', (_, task: Task) => {
  const tasks = [...storeGet('tasks'), task]; storeSet('tasks', tasks); return tasks
})

ipcMain.handle('tasks:update', (_, id: string, u: Partial<Task>) => {
  const tasks = storeGet('tasks').map(t => t.id === id ? { ...t, ...u } : t); storeSet('tasks', tasks); return tasks
})

ipcMain.handle('tasks:delete', (_, id: string) => {
  const tasks = storeGet('tasks').filter(t => t.id !== id); storeSet('tasks', tasks); return tasks
})

ipcMain.handle('tasks:reorder', (_, tasks: Task[]) => { storeSet('tasks', tasks); return tasks })

// ── IPC: Ideas ────────────────────────────────────────────────────────────────

ipcMain.handle('ideas:get', () => storeGet('ideas'))

ipcMain.handle('ideas:add', (_, idea: Idea) => {
  const ideas = [idea, ...storeGet('ideas')]; storeSet('ideas', ideas); return ideas
})

ipcMain.handle('ideas:delete', (_, id: string) => {
  const ideas = storeGet('ideas').filter(i => i.id !== id); storeSet('ideas', ideas); return ideas
})

// ── IPC: Reminders ────────────────────────────────────────────────────────────

ipcMain.handle('reminders:get', () => storeGet('reminders'))

ipcMain.handle('reminders:add', (_, reminder: Reminder) => {
  const reminders = [...storeGet('reminders'), reminder]; storeSet('reminders', reminders); scheduleReminder(reminder); return reminders
})

ipcMain.handle('reminders:update', (_, id: string, u: Partial<Reminder>) => {
  const reminders = storeGet('reminders').map(r => r.id === id ? { ...r, ...u } : r)
  storeSet('reminders', reminders); cancelScheduled(id)
  const updated = reminders.find(r => r.id === id); if (updated) scheduleReminder(updated)
  return reminders
})

ipcMain.handle('reminders:delete', (_, id: string) => {
  cancelScheduled(id); const reminders = storeGet('reminders').filter(r => r.id !== id); storeSet('reminders', reminders); return reminders
})

// ── IPC: Journal ──────────────────────────────────────────────────────────────

ipcMain.handle('journal:get', () => storeGet('journal'))

ipcMain.handle('journal:save', (_, entry: JournalEntry) => {
  const journal = storeGet('journal')
  const idx = journal.findIndex(e => e.date === entry.date)
  if (idx >= 0) journal[idx] = entry; else journal.unshift(entry)
  storeSet('journal', journal); return journal
})

// ── IPC: Window ───────────────────────────────────────────────────────────────

ipcMain.handle('window:hide', () => win?.hide())
