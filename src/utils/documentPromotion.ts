/**
 * Document Promotion System
 * 
 * When a user creates the first child card for a document, the system 
 * automatically "promotes" that document to be a parent by:
 * 1. Creating a folder for the document
 * 2. Moving the document into that folder
 * 3. Creating its board JSON
 * 4. Updating all references across all board files
 */

import { dirname, basename, join } from './pathUtils'
import { getMainAPI } from '../api/mainAPI'

interface PromotionResult {
  success: boolean
  newDocPath?: string
  newBoardPath?: string
  error?: string
}

/**
 * Promotes a document to parent status by creating folder and moving file
 */
export async function promoteDocumentToParent(
  projectRoot: string,
  documentPath: string // Relative path from project root
): Promise<PromotionResult> {
  // 1. Skip if root document
  if (documentPath === 'myboard.md') {
    return { success: false, error: 'Cannot promote root document' }
  }

  // 2. Parse paths
  const dir = dirname(documentPath)
  const name = basename(documentPath).replace('.md', '')
  const folderPath = dir ? `${dir}/${name}` : name
  const newDocPath = `${folderPath}/${name}.md`
  const boardPath = `${folderPath}/${name}.board.json`

  const absoluteFolder = join(projectRoot, folderPath)
  const absoluteOldDoc = join(projectRoot, documentPath)
  const absoluteNewDoc = join(projectRoot, newDocPath)
  const absoluteBoard = join(projectRoot, boardPath)

  try {
    const api = getMainAPI()
    
    // 3. Check if folder already exists
    const folderExists = await api.exists(absoluteFolder)
    if (folderExists) {
      return { success: false, error: `Folder ${folderPath} already exists` }
    }

    // 4. Execute atomic operation
    // Create folder
    const mkdirResult = await api.mkdir(absoluteFolder)
    if (!mkdirResult.success) {
      throw new Error(`Failed to create folder: ${mkdirResult.error}`)
    }

    // Move document
    const renameResult = await api.rename(absoluteOldDoc, absoluteNewDoc)
    if (!renameResult.success) {
      // Rollback: remove folder
      await rollback(absoluteFolder, null, null)
      throw new Error(`Failed to move document: ${renameResult.error}`)
    }

    // Create board JSON
    const boardContent = JSON.stringify({
      version: '1.0',
      cards: []
    }, null, 2)
    
    const writeResult = await api.writeFile(absoluteBoard, boardContent)
    if (!writeResult.success) {
      // Rollback: move file back, remove folder
      await rollback(absoluteFolder, absoluteNewDoc, absoluteOldDoc)
      throw new Error(`Failed to create board: ${writeResult.error}`)
    }

    // 5. Update all references
    await updateAllReferences(projectRoot, documentPath, newDocPath)

    return {
      success: true,
      newDocPath,
      newBoardPath: boardPath,
    }

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Promotion failed'
    }
  }
}

/**
 * Rollback changes if promotion fails
 */
async function rollback(
  folderPath: string,
  movedFilePath: string | null,
  originalFilePath: string | null
) {
  try {
    const api = getMainAPI()
    
    // Move document back if it was moved
    if (movedFilePath && originalFilePath) {
      const exists = await api.exists(movedFilePath)
      if (exists) {
        await api.rename(movedFilePath, originalFilePath)
      }
    }

    // Remove folder if it was created
    // Note: This is a simple implementation - in production you'd want
    // to recursively delete the folder
    const folderExists = await api.exists(folderPath)
    if (folderExists) {
      // For now, we just log - proper folder deletion would need a new IPC call
      console.warn('Rollback: folder exists but cannot be auto-deleted:', folderPath)
    }
  } catch (rollbackError) {
    console.error('Rollback failed:', rollbackError)
  }
}

/**
 * Updates all board JSON files that reference the old path
 */
async function updateAllReferences(
  projectRoot: string,
  oldPath: string,
  newPath: string
): Promise<number> {
  const api = getMainAPI()
  const boardFiles = await findAllBoardFiles(projectRoot)
  let updatedCount = 0

  for (const boardFile of boardFiles) {
    const result = await api.readFile(boardFile)
    if (!result.success || !result.content) continue

    let board: any
    try {
      board = JSON.parse(result.content)
    } catch {
      continue
    }

    let modified = false

    // Update card references
    if (board.cards) {
      for (const card of board.cards) {
        if (card.markdownPath === oldPath) {
          card.markdownPath = newPath
          modified = true
        }
      }
    }

    // Update rootMarkdown reference
    if (board.rootMarkdown === oldPath) {
      board.rootMarkdown = newPath
      modified = true
    }

    if (modified) {
      await api.writeFile(boardFile, JSON.stringify(board, null, 2))
      updatedCount++
    }
  }

  return updatedCount
}

/**
 * Recursively finds all .board.json files in the project
 */
async function findAllBoardFiles(directory: string): Promise<string[]> {
  const api = getMainAPI()
  const files: string[] = []
  
  const result = await api.readdir(directory)
  if (!result.success || !result.items) return files

  for (const item of result.items) {
    const fullPath = `${directory}/${item.name}`
    
    if (item.isDirectory) {
      // Recurse into subdirectories
      const subFiles = await findAllBoardFiles(fullPath)
      files.push(...subFiles)
    } else if (item.name.endsWith('.board.json')) {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * Checks if a document needs promotion (has no board.json yet)
 */
export async function needsPromotion(
  projectRoot: string,
  documentPath: string
): Promise<boolean> {
  // Root document never needs promotion
  if (documentPath === 'myboard.md') {
    return false
  }

  const api = getMainAPI()
  const boardPath = documentPath.replace('.md', '.board.json')
  const absoluteBoardPath = join(projectRoot, boardPath)
  
  return !(await api.exists(absoluteBoardPath))
}

