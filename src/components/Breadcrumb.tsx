import { observer } from 'mobx-react-lite'
import styled from '@emotion/styled'
import { useNavigationStore } from '../stores/RootStore'

export const Breadcrumb = observer(() => {
  const navigationStore = useNavigationStore()

  const handleClick = (index: number) => {
    if (index < navigationStore.breadcrumb.length - 1) {
      navigationStore.navigateUp(index)
    }
  }

  const handleHomeClick = () => {
    navigationStore.navigateToRoot()
  }

  return (
    <Container>
      <HomeButton onClick={handleHomeClick} title="Go to root">
        ⬡
      </HomeButton>

      {navigationStore.breadcrumb.map((item, index) => (
        <BreadcrumbItem key={index}>
          <Separator>/</Separator>
          <ItemButton 
            onClick={() => handleClick(index)}
            className={index === navigationStore.breadcrumb.length - 1 ? 'current' : ''}
          >
            {item}
          </ItemButton>
        </BreadcrumbItem>
      ))}
    </Container>
  )
})

const Container = styled.nav`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  -webkit-app-region: no-drag;
`

const HomeButton = styled.button`
  font-size: 18px;
  color: var(--color-accent);
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  
  &:hover {
    background: var(--color-bg-hover);
    transform: scale(1.1);
  }
`

const BreadcrumbItem = styled.span`
  display: flex;
  align-items: center;
`

const Separator = styled.span`
  color: var(--color-text-tertiary);
  margin: 0 var(--spacing-xs);
  font-size: var(--font-size-sm);
`

const ItemButton = styled.button`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  
  &:hover:not(.current) {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }
  
  &.current {
    color: var(--color-text-primary);
    font-weight: 500;
    cursor: default;
  }
`

