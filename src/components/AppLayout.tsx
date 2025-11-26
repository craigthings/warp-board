import { useState, useRef, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { styled } from '@linaria/react'
import { Breadcrumb } from './Breadcrumb'
import { DocumentPanel } from './DocumentPanel'
import { BoardPanel } from './BoardPanel'

const MIN_PANEL_WIDTH = 300
const DEFAULT_SPLIT = 0.4 // 40% document, 60% board

export const AppLayout = observer(() => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [splitRatio, setSplitRatio] = useState(DEFAULT_SPLIT)
  const [isDragging, setIsDragging] = useState(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return

    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width

    // Calculate new ratio with min constraints
    let newRatio = x / width
    const minRatio = MIN_PANEL_WIDTH / width
    const maxRatio = 1 - minRatio

    newRatio = Math.max(minRatio, Math.min(maxRatio, newRatio))
    setSplitRatio(newRatio)
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  return (
    <Container
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <Header>
        <Breadcrumb />
      </Header>

      <MainContent>
        <LeftPanel style={{ width: `${splitRatio * 100}%` }}>
          <DocumentPanel />
        </LeftPanel>

        <Divider 
          onMouseDown={handleMouseDown}
          className={isDragging ? 'dragging' : ''}
        />

        <RightPanel style={{ width: `${(1 - splitRatio) * 100}%` }}>
          <BoardPanel />
        </RightPanel>
      </MainContent>
    </Container>
  )
})

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
  user-select: none;
`

const Header = styled.header`
  height: var(--breadcrumb-height);
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-md);
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border-light);
  -webkit-app-region: drag;
`

const MainContent = styled.main`
  flex: 1;
  display: flex;
  overflow: hidden;
`

const LeftPanel = styled.div`
  height: 100%;
  overflow: hidden;
  background: var(--color-bg-secondary);
`

const RightPanel = styled.div`
  height: 100%;
  overflow: hidden;
  background: var(--color-bg-primary);
`

const Divider = styled.div`
  width: 4px;
  height: 100%;
  background: var(--color-border);
  cursor: col-resize;
  flex-shrink: 0;
  transition: background var(--transition-fast);
  
  &:hover,
  &.dragging {
    background: var(--color-accent);
  }
`

