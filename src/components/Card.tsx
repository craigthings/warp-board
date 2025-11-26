import { useState, useRef, useCallback, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { styled } from '@linaria/react'
import { useBoardStore, useNavigationStore, useRootStore } from '../stores/RootStore'
import type { Card as CardType } from '../stores/BoardStore'

interface CardProps {
  card: CardType
  title: string
  description: string
}

export const Card = observer(({ card, title, description }: CardProps) => {
  const rootStore = useRootStore()
  const boardStore = useBoardStore()
  const navigationStore = useNavigationStore()
  
  const cardRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [descriptionOverflow, setDescriptionOverflow] = useState(false)

  // Check for description overflow on mount and content change
  useEffect(() => {
    if (cardRef.current) {
      const descEl = cardRef.current.querySelector('[data-description]') as HTMLElement
      if (descEl) {
        setDescriptionOverflow(descEl.scrollHeight > descEl.clientHeight)
      }
    }
  }, [description])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return // Only left click
    
    e.preventDefault()
    e.stopPropagation()
    
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - card.x,
      y: e.clientY - card.y,
    })
  }, [card.x, card.y])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    
    const canvas = cardRef.current?.parentElement
    if (!canvas) return

    const canvasRect = canvas.getBoundingClientRect()
    const scrollLeft = canvas.parentElement?.scrollLeft || 0
    const scrollTop = canvas.parentElement?.scrollTop || 0

    const newX = e.clientX - canvasRect.left + scrollLeft - dragOffset.x + card.x
    const newY = e.clientY - canvasRect.top + scrollTop - dragOffset.y + card.y

    // Constrain to canvas bounds
    const constrainedX = Math.max(0, Math.min(4000 - card.width, newX))
    const constrainedY = Math.max(0, Math.min(4000 - card.height, newY))

    boardStore.updateCardPosition(card.id, constrainedX, constrainedY)
  }, [isDragging, dragOffset, card, boardStore])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Global mouse events for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Navigate to this card's document
    navigationStore.navigateToCard(card.markdownPath)
  }, [navigationStore, card.markdownPath])

  const handleExpandClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Open QuickView modal
    console.log('Expand card:', card.id)
  }, [card.id])

  return (
    <CardContainer
      ref={cardRef}
      style={{
        left: card.x,
        top: card.y,
        width: card.width,
      }}
      className={`${isDragging ? 'dragging' : ''} ${isHovered ? 'hovered' : ''}`}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardTitle>{title}</CardTitle>
      
      {description && (
        <CardDescription data-description>
          {description}
        </CardDescription>
      )}

      {descriptionOverflow && (
        <ExpandButton onClick={handleExpandClick}>
          Show more
        </ExpandButton>
      )}
    </CardContainer>
  )
})

const CardContainer = styled.div`
  position: absolute;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-card);
  cursor: grab;
  transition: box-shadow var(--transition-fast), transform var(--transition-fast);
  user-select: none;
  
  &:hover,
  &.hovered {
    box-shadow: var(--shadow-card-hover);
  }
  
  &.dragging {
    cursor: grabbing;
    box-shadow: var(--shadow-lg);
    transform: scale(1.02);
    z-index: 100;
  }
`

const CardTitle = styled.h3`
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
  line-height: 1.3;
  
  /* Truncate long titles */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const CardDescription = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
  
  /* Limit to 4 lines */
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const ExpandButton = styled.button`
  font-size: var(--font-size-xs);
  color: var(--color-accent);
  margin-top: var(--spacing-sm);
  padding: var(--spacing-xs) 0;
  
  &:hover {
    color: var(--color-accent-hover);
    text-decoration: underline;
  }
`

