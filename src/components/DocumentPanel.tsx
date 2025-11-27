import { observer } from 'mobx-react-lite'
import styled from '@emotion/styled'
import { useDocumentStore, useNavigationStore } from '../stores/RootStore'
import { marked } from 'marked'
import { useMemo } from 'react'

export const DocumentPanel = observer(() => {
  const documentStore = useDocumentStore()
  const navigationStore = useNavigationStore()
  const document = documentStore.currentDocument

  const renderedBody = useMemo(() => {
    if (!document?.body) return ''
    return marked.parse(document.body) as string
  }, [document?.body])

  if (!document) {
    return (
      <Container>
        <EmptyState>
          <EmptyIcon>📄</EmptyIcon>
          <EmptyText>No document selected</EmptyText>
        </EmptyState>
      </Container>
    )
  }

  return (
    <Container>
      <Content>
        <Title>{document.title}</Title>
        
        {document.description && (
          <Description>{document.description}</Description>
        )}

        {document.body && (
          <>
            <Divider />
            <Body dangerouslySetInnerHTML={{ __html: renderedBody }} />
          </>
        )}
      </Content>
    </Container>
  )
})

const Container = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
`

const Content = styled.article`
  padding: var(--spacing-xl);
  max-width: 720px;
`

const Title = styled.h1`
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
  line-height: 1.3;
`

const Description = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  line-height: 1.6;
`

const Divider = styled.hr`
  border: none;
  height: 1px;
  background: var(--color-border-light);
  margin: var(--spacing-lg) 0;
`

const Body = styled.div`
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  line-height: 1.7;
  
  h1, h2, h3, h4, h5, h6 {
    margin-top: var(--spacing-xl);
    margin-bottom: var(--spacing-md);
    font-weight: 600;
    line-height: 1.3;
  }
  
  h1 { font-size: var(--font-size-2xl); }
  h2 { font-size: var(--font-size-xl); }
  h3 { font-size: var(--font-size-lg); }
  h4 { font-size: var(--font-size-base); }
  
  p {
    margin-bottom: var(--spacing-md);
  }
  
  ul, ol {
    margin-bottom: var(--spacing-md);
    padding-left: var(--spacing-lg);
  }
  
  li {
    margin-bottom: var(--spacing-xs);
  }
  
  code {
    font-family: 'SF Mono', Monaco, 'Consolas', monospace;
    font-size: 0.9em;
    background: var(--color-bg-active);
    padding: 2px 6px;
    border-radius: var(--radius-sm);
  }
  
  pre {
    background: var(--color-bg-active);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    overflow-x: auto;
    margin-bottom: var(--spacing-md);
    
    code {
      background: none;
      padding: 0;
    }
  }
  
  blockquote {
    border-left: 3px solid var(--color-accent);
    padding-left: var(--spacing-md);
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-md);
    font-style: italic;
  }
  
  a {
    color: var(--color-accent);
    text-decoration: underline;
    
    &:hover {
      color: var(--color-accent-hover);
    }
  }
  
  img {
    max-width: 100%;
    border-radius: var(--radius-md);
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: var(--spacing-md);
    
    th, td {
      border: 1px solid var(--color-border);
      padding: var(--spacing-sm) var(--spacing-md);
      text-align: left;
    }
    
    th {
      background: var(--color-bg-hover);
      font-weight: 600;
    }
  }
`

const EmptyState = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
`

const EmptyIcon = styled.span`
  font-size: 48px;
  opacity: 0.5;
`

const EmptyText = styled.p`
  color: var(--color-text-tertiary);
  font-size: var(--font-size-base);
`

