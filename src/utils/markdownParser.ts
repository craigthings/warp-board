export interface ParsedDocument {
  path: string
  title: string
  description: string
  body: string
  rawContent: string
}

/**
 * Parses a markdown document and extracts title, description, and body.
 * 
 * Rules:
 * - Title: First `#` heading, or first line if no heading
 * - Description: 
 *   - If `---` separator exists: content between title and separator
 *   - If no separator: first paragraph after title (or second line if no heading)
 * - Body: Everything after first `---` (or everything after description)
 */
export function parseMarkdown(content: string, path: string): ParsedDocument {
  const lines = content.split('\n')
  let title = ''
  let description = ''
  let body = ''
  let titleLineIndex = -1
  let separatorLineIndex = -1

  // Find the first heading or use first line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.startsWith('# ')) {
      title = line.slice(2).trim()
      titleLineIndex = i
      break
    }
  }

  // If no heading found, use first non-empty line as title
  if (titleLineIndex === -1) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line) {
        title = line
        titleLineIndex = i
        break
      }
    }
  }

  // Find the first `---` separator after the title
  for (let i = titleLineIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line === '---') {
      separatorLineIndex = i
      break
    }
  }

  if (separatorLineIndex !== -1) {
    // Has separator: description is between title and separator
    const descLines = lines.slice(titleLineIndex + 1, separatorLineIndex)
    description = descLines
      .map(l => l.trim())
      .filter(l => l)
      .join(' ')
      .trim()

    // Body is everything after separator
    body = lines.slice(separatorLineIndex + 1).join('\n').trim()
  } else {
    // No separator: use second line (or first paragraph after title) as description
    // Everything else becomes body
    const afterTitle = lines.slice(titleLineIndex + 1)
    
    // Find first non-empty paragraph for description
    let descEndIndex = 0
    let foundDesc = false
    
    for (let i = 0; i < afterTitle.length; i++) {
      const line = afterTitle[i].trim()
      
      if (!foundDesc && line) {
        // Start of description
        foundDesc = true
      }
      
      if (foundDesc) {
        if (!line) {
          // Empty line ends description
          descEndIndex = i
          break
        }
        descEndIndex = i + 1
      }
    }

    const descLines = afterTitle.slice(0, descEndIndex)
    description = descLines
      .map(l => l.trim())
      .filter(l => l)
      .join(' ')
      .trim()

    body = afterTitle.slice(descEndIndex).join('\n').trim()
  }

  return {
    path,
    title: title || 'Untitled',
    description,
    body,
    rawContent: content,
  }
}

/**
 * Regenerates markdown content from parsed document
 */
export function serializeDocument(doc: ParsedDocument): string {
  let content = `# ${doc.title}\n\n`
  
  if (doc.description) {
    content += `${doc.description}\n\n`
  }
  
  content += '---\n\n'
  
  if (doc.body) {
    content += doc.body
  }
  
  return content
}

