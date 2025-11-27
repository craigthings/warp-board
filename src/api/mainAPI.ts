/**
 * Renderer-side Main API access
 * 
 * Wraps the main process API using Comlink, making it callable
 * as if it were a local async class.
 * 
 * Usage:
 *   import { mainAPI } from './api/mainAPI'
 *   const result = await mainAPI.readFile('/path/to/file')
 */

import { wrap, type Remote } from 'comlink'
import type { MainAPI } from '../../electron/api'

// Re-export types for convenience
export type { MainAPI, FileResult, ReadResult, ReadDirResult, StatResult } from '../../electron/api'

// Import global Window type augmentation
import './types'

// Singleton instance
let apiInstance: Remote<MainAPI> | null = null

/**
 * Get the main process API
 * Returns a Comlink proxy that forwards all calls to main
 */
export function getMainAPI(): Remote<MainAPI> {
  if (!apiInstance) {
    if (!window.endpoints?.main) {
      throw new Error('Endpoints not available. Are you running in Electron?')
    }
    apiInstance = wrap<MainAPI>(window.endpoints.main)
  }
  return apiInstance
}

// Direct export for convenient access
export const mainAPI = new Proxy({} as Remote<MainAPI>, {
  get(_, prop) {
    return getMainAPI()[prop as keyof MainAPI]
  },
})
