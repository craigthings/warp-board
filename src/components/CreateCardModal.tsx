import { useState, useRef, useEffect } from 'react'
import { styled } from '@linaria/react'

interface CreateCardModalProps {
  onClose: () => void
  onCreate: (title: string) => void
}

export const CreateCardModal = ({ onClose, onCreate }: CreateCardModalProps) => {
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedTitle = title.trim()
    
    if (!trimmedTitle) {
      setError('Please enter a title')
      return
    }

    // Validate filename-safe characters
    if (/[<>:"/\\|?*]/.test(trimmedTitle)) {
      setError('Title contains invalid characters')
      return
    }

    onCreate(trimmedTitle)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Preview the filename
  const previewFilename = title.trim()
    ? title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '.md'
    : ''

  return (
    <Backdrop onClick={handleBackdropClick}>
      <Modal>
        <ModalTitle>Create New Card</ModalTitle>
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="card-title">Card Title</Label>
            <Input
              ref={inputRef}
              id="card-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setError(null)
              }}
              placeholder="Enter card title..."
              autoComplete="off"
            />
            {error && <ErrorText>{error}</ErrorText>}
            {previewFilename && (
              <FilenamePreview>
                Will create: <code>{previewFilename}</code>
              </FilenamePreview>
            )}
          </InputGroup>

          <Actions>
            <CancelButton type="button" onClick={onClose}>
              Cancel
            </CancelButton>
            <CreateButton type="submit">
              Create
            </CreateButton>
          </Actions>
        </Form>
      </Modal>
    </Backdrop>
  )
}

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 150ms ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`

const Modal = styled.div`
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-lg);
  animation: slideIn 200ms ease;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`

const ModalTitle = styled.h2`
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`

const Label = styled.label`
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
`

const Input = styled.input`
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  background: var(--color-bg-secondary);
  transition: border-color var(--transition-fast);
  
  &:focus {
    border-color: var(--color-accent);
    outline: none;
  }
  
  &::placeholder {
    color: var(--color-text-placeholder);
  }
`

const ErrorText = styled.span`
  font-size: var(--font-size-sm);
  color: #D64545;
`

const FilenamePreview = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  
  code {
    background: var(--color-bg-active);
    padding: 2px 6px;
    border-radius: var(--radius-sm);
    font-family: 'SF Mono', Monaco, monospace;
    font-size: var(--font-size-xs);
  }
`

const Actions = styled.div`
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
`

const Button = styled.button`
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: all var(--transition-fast);
`

const CancelButton = styled(Button)`
  background: transparent;
  color: var(--color-text-secondary);
  
  &:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }
`

const CreateButton = styled(Button)`
  background: var(--color-accent);
  color: white;
  
  &:hover {
    background: var(--color-accent-hover);
  }
`

