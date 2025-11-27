import { useState, useRef, useCallback, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import styled from '@emotion/styled'
import { useBoardStore, useDocumentStore, useRootStore } from '../stores/RootStore'
import { Card } from './Card'
import { ConnectionLines } from './ConnectionLines'
import { CreateCardModal } from './CreateCardModal'

const CANVAS_SIZE = 4000

export const BoardPanel = observer(() => {
  const rootStore = useRootStore()
  const boardStore = useBoardStore()
  const documentStore = useDocumentStore()
  const board = boardStore.currentBoard
  
  const canvasRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createPosition, setCreatePosition] = useState({ x: 0, y: 0 })

  // Center the canvas scroll position on mount
  useEffect(() => {
    if (scrollerRef.current) {
      const scroller = scrollerRef.current
      // Center the scroll position
      const centerX = (CANVAS_SIZE - scroller.clientWidth) / 2
      const centerY = (CANVAS_SIZE - scroller.clientHeight) / 2
      scroller.scrollLeft = centerX
      scroller.scrollTop = centerY
    }
  }, [])

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Only handle clicks directly on the canvas, not on cards
    if (e.target === canvasRef.current) {
      // Could be used for deselection or other canvas-level actions
    }
  }, [])

  const handleCanvasDoubleClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current && canvasRef.current) {
      // Get position relative to canvas
      const rect = canvasRef.current.getBoundingClientRect()
      const scrollLeft = scrollerRef.current?.scrollLeft || 0
      const scrollTop = scrollerRef.current?.scrollTop || 0
      
      setCreatePosition({
        x: e.clientX - rect.left + scrollLeft,
        y: e.clientY - rect.top + scrollTop,
      })
      setShowCreateModal(true)
    }
  }, [])

  const handleCreateCard = async (title: string) => {
    await boardStore.createCard(title, createPosition.x, createPosition.y)
    setShowCreateModal(false)
  }

  const handleCreateButtonClick = () => {
    // Center of visible viewport
    const scroller = scrollerRef.current
    if (scroller) {
      setCreatePosition({
        x: scroller.scrollLeft + scroller.clientWidth / 2 - 150,
        y: scroller.scrollTop + scroller.clientHeight / 2 - 100,
      })
    } else {
      // Fallback to canvas center
      setCreatePosition({ x: CANVAS_SIZE / 2 - 150, y: CANVAS_SIZE / 2 - 100 })
    }
    setShowCreateModal(true)
  }

  // Get card data with loaded document info
  const cardsWithDocs = board?.cards.map(card => {
    const absolutePath = rootStore.getAbsolutePath(card.markdownPath)
    const doc = documentStore.documents.get(absolutePath)
    return { card, doc }
  }) || []

  // Empty state
  if (!board || board.cards.length === 0) {
    return (
      <Container>
        <CanvasScroller ref={scrollerRef}>
          <Canvas ref={canvasRef}>
            <EmptyState>
              <EmptyIcon>✦</EmptyIcon>
              <EmptyTitle>No cards yet</EmptyTitle>
              <EmptyText>Create your first card to get started</EmptyText>
              <CreateButton onClick={handleCreateButtonClick}>
                + Create Card
              </CreateButton>
            </EmptyState>
          </Canvas>
        </CanvasScroller>

        {showCreateModal && (
          <CreateCardModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateCard}
          />
        )}
      </Container>
    )
  }

  return (
    <Container>
      <CanvasScroller ref={scrollerRef}>
        <Canvas 
          ref={canvasRef}
          onClick={handleCanvasClick}
          onDoubleClick={handleCanvasDoubleClick}
        >
          <ConnectionLines cards={board.cards} />
          
          {cardsWithDocs.map(({ card, doc }) => (
            <Card
              key={card.id}
              card={card}
              title={doc?.title || 'Loading...'}
              description={doc?.description || ''}
            />
          ))}
        </Canvas>
      </CanvasScroller>

      <FloatingActions>
        <CreateButton onClick={handleCreateButtonClick}>
          + Create Card
        </CreateButton>
      </FloatingActions>

      {showCreateModal && (
        <CreateCardModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateCard}
        />
      )}
    </Container>
  )
})

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
`

const CanvasScroller = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
`

const Canvas = styled.div`
  width: var(--canvas-size);
  height: var(--canvas-size);
  position: relative;
  background-image: 
    radial-gradient(circle, var(--color-border-light) 1px, transparent 1px);
  background-size: 24px 24px;
`

const EmptyState = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  text-align: center;
`

const EmptyIcon = styled.span`
  font-size: 48px;
  color: var(--color-accent);
`

const EmptyTitle = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text-primary);
`

const EmptyText = styled.p`
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  max-width: 280px;
`

const FloatingActions = styled.div`
  position: absolute;
  bottom: var(--spacing-lg);
  right: var(--spacing-lg);
`

const CreateButton = styled.button`
  background: var(--color-accent);
  color: white;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-fast);
  
  &:hover {
    background: var(--color-accent-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
  
  &:active {
    transform: translateY(0);
  }
`

