/**
 * Cross-platform path utilities
 * Works in both browser and Electron contexts
 */

/**
 * Get the directory name from a path
 */
export function dirname(path: string): string {
  const normalized = path.replace(/\\/g, '/')
  const lastSlash = normalized.lastIndexOf('/')
  if (lastSlash === -1) return ''
  return normalized.substring(0, lastSlash)
}

/**
 * Get the base name (filename) from a path
 */
export function basename(path: string): string {
  const normalized = path.replace(/\\/g, '/')
  const lastSlash = normalized.lastIndexOf('/')
  return normalized.substring(lastSlash + 1)
}

/**
 * Get the file extension
 */
export function extname(path: string): string {
  const base = basename(path)
  const lastDot = base.lastIndexOf('.')
  if (lastDot === -1) return ''
  return base.substring(lastDot)
}

/**
 * Join path segments
 */
export function join(...segments: string[]): string {
  return segments
    .map(s => s.replace(/\\/g, '/'))
    .join('/')
    .replace(/\/+/g, '/')
}

/**
 * Get path relative to a base
 */
export function relative(from: string, to: string): string {
  const fromNorm = from.replace(/\\/g, '/').replace(/\/$/, '')
  const toNorm = to.replace(/\\/g, '/')
  
  if (toNorm.startsWith(fromNorm + '/')) {
    return toNorm.substring(fromNorm.length + 1)
  }
  
  return toNorm
}

