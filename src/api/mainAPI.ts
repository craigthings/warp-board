/**
 * Renderer-side API wrapper using Comlink
 * 
 * This wraps the main process API, making it callable
 * as if it were a local async class.
 */

import { wrap, type Remote } from 'comlink'
import type { MainAPI } from '../../electron/api'

// Re-export types for convenience
export type { MainAPI, FileResult, ReadResult, ReadDirResult, StatResult } from '../../electron/api'

// The Comlink endpoint exposed by preload
declare global {
  interface Window {
    comlinkEndpoint: {
      postMessage(message: unknown): void
      addEventListener(type: string, listener: (event: { data: unknown }) => void): void
      removeEventListener(type: string, listener: (event: { data: unknown }) => void): void
    }
  }
}

// Singleton instance
let apiInstance: Remote<MainAPI> | null = null

/**
 * Get the main process API
 * Returns a proxy that forwards all calls to the main process
 */
export function getMainAPI(): Remote<MainAPI> {
  if (!apiInstance) {
    if (!window.comlinkEndpoint) {
      throw new Error('Comlink endpoint not available. Are you running in Electron?')
    }
    apiInstance = wrap<MainAPI>(window.comlinkEndpoint as any)
  }
  return apiInstance
}

// Export a convenient singleton
export const mainAPI = {
  get api() {
    return getMainAPI()
  }
}

