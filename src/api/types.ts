/**
 * Shared types for the API layer
 */

import type { Endpoint } from 'comlink'

// Type for the endpoints exposed by preload
declare global {
  interface Window {
    endpoints: {
      main: Endpoint
      renderer: Endpoint
    }
  }
}

export {}

