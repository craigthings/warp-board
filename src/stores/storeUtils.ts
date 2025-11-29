import type { RootStore } from './RootStore'

interface HasParent {
  parent?: unknown
}

/**
 * Traverses up the parent chain to find the root store.
 * Expects stores to have a `parent` property (use constructor parameter property).
 */
export function getRoot(store: HasParent): RootStore {
  let current: HasParent = store
  while (current.parent) {
    current = current.parent as HasParent
  }
  return current as RootStore
}

