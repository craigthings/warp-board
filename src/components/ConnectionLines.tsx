import { observer } from 'mobx-react-lite'
import styled from '@emotion/styled'
import type { Card } from '../stores/BoardStore'

interface ConnectionLinesProps {
  cards: Card[]
}

export const ConnectionLines = observer(({ cards }: ConnectionLinesProps) => {
  // Build a map of card positions by ID
  const cardMap = new Map(cards.map(card => [card.id, card]))

  // Collect all connections
  const connections: Array<{
    from: Card
    to: Card
    type: 'to' | 'from' | 'bidirectional'
  }> = []

  cards.forEach(card => {
    card.connections.forEach(conn => {
      const targetCard = cardMap.get(conn.targetId)
      if (targetCard) {
        connections.push({
          from: card,
          to: targetCard,
          type: conn.type,
        })
      }
    })
  })

  if (connections.length === 0) return null

  return (
    <SvgContainer>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="var(--color-border)"
          />
        </marker>
        <marker
          id="arrowhead-reverse"
          markerWidth="10"
          markerHeight="7"
          refX="1"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="10 0, 0 3.5, 10 7"
            fill="var(--color-border)"
          />
        </marker>
      </defs>

      {connections.map((conn, index) => {
        // Calculate line endpoints (center of cards)
        const fromX = conn.from.x + conn.from.width / 2
        const fromY = conn.from.y + conn.from.height / 2
        const toX = conn.to.x + conn.to.width / 2
        const toY = conn.to.y + conn.to.height / 2

        // Determine markers based on connection type
        let markerEnd = ''
        let markerStart = ''
        
        if (conn.type === 'to') {
          markerEnd = 'url(#arrowhead)'
        } else if (conn.type === 'from') {
          markerStart = 'url(#arrowhead-reverse)'
        } else if (conn.type === 'bidirectional') {
          markerEnd = 'url(#arrowhead)'
          markerStart = 'url(#arrowhead-reverse)'
        }

        return (
          <ConnectionLine
            key={`${conn.from.id}-${conn.to.id}-${index}`}
            x1={fromX}
            y1={fromY}
            x2={toX}
            y2={toY}
            markerEnd={markerEnd}
            markerStart={markerStart}
          />
        )
      })}
    </SvgContainer>
  )
})

const SvgContainer = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
`

const ConnectionLine = styled.line`
  stroke: var(--color-border);
  stroke-width: 2;
  fill: none;
`

