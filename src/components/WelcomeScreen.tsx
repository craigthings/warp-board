import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { styled } from '@linaria/react'
import { useRootStore } from '../stores/RootStore'

export const WelcomeScreen = observer(() => {
  const rootStore = useRootStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOpenProject = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const path = await window.electronAPI.openProject()
      if (path) {
        await rootStore.openProject(path)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to open project')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProject = async () => {
    // For now, just create a demo project in the current directory
    // In a real app, we'd show a save dialog
    setError('Create project coming soon! For now, open an existing .board.json file.')
  }

  return (
    <Container>
      <Content>
        <Logo>
          <LogoIcon>⬡</LogoIcon>
          <LogoText>Warp Board</LogoText>
        </Logo>
        
        <Tagline>
          Spatial, hierarchical documentation for your projects
        </Tagline>

        <Actions>
          <PrimaryButton onClick={handleOpenProject} disabled={isLoading}>
            {isLoading ? 'Opening...' : 'Open Project'}
          </PrimaryButton>
          
          <SecondaryButton onClick={handleCreateProject} disabled={isLoading}>
            Create New Project
          </SecondaryButton>
        </Actions>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Hint>
          Open a <code>.board.json</code> file to get started
        </Hint>
      </Content>

      <Footer>
        <FooterText>Git-native • Markdown-powered • Infinite canvas</FooterText>
      </Footer>
    </Container>
  )
})

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%);
  position: relative;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-2xl);
`

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
`

const LogoIcon = styled.span`
  font-size: 48px;
  color: var(--color-accent);
`

const LogoText = styled.h1`
  font-size: var(--font-size-3xl);
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
`

const Tagline = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  text-align: center;
  max-width: 400px;
`

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
  width: 100%;
  max-width: 280px;
`

const Button = styled.button`
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const PrimaryButton = styled(Button)`
  background: var(--color-accent);
  color: white;
  
  &:hover:not(:disabled) {
    background: var(--color-accent-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`

const SecondaryButton = styled(Button)`
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  
  &:hover:not(:disabled) {
    background: var(--color-bg-hover);
    border-color: var(--color-accent);
  }
`

const ErrorMessage = styled.p`
  color: #D64545;
  font-size: var(--font-size-sm);
  text-align: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: #FFF0F0;
  border-radius: var(--radius-sm);
`

const Hint = styled.p`
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

const Footer = styled.footer`
  position: absolute;
  bottom: var(--spacing-lg);
  left: 0;
  right: 0;
  text-align: center;
`

const FooterText = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
`

