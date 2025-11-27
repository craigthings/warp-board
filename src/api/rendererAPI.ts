/**
 * RendererAPI Implementation
 * 
 * This is the API exposed to the main process.
 * Main can call these methods to trigger UI updates.
 * 
 * Usage:
 *   import { initRendererAPI } from './api/rendererAPI'
 *   initRendererAPI()  // Call once at app startup
 */

import { expose } from 'comlink'
import './types' // Loads global Window type augmentation

/**
 * The renderer API - main process can call these methods
 */
export class RendererAPI {
  async onFileChanged(filePath: string) {
    console.log('File changed:', filePath)
    // TODO: boardStore.handleFileChange(filePath)
  }

  async onProjectReload() {
    console.log('Project reload requested')
    // TODO: boardStore.reload()
  }

  async navigateToCard(cardId: string) {
    console.log('Navigate to card:', cardId)
    // TODO: navigationStore.goToCard(cardId)
  }

  async showNotification(message: string, type?: 'info' | 'error' | 'success') {
    console.log(`[${type ?? 'info'}] ${message}`)
    // TODO: uiStore.showNotification(message, type)
  }
}

/**
 * Initialize and expose the renderer API to main process
 * Call this once at app startup
 */
export function initRendererAPI() {
  if (!window.endpoints?.renderer) {
    console.warn('Renderer endpoint not available')
    return
  }

  expose(new RendererAPI(), window.endpoints.renderer)
  console.log('RendererAPI exposed to main process')
}
