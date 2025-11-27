import { observer } from 'mobx-react-lite'
import styled from '@emotion/styled'
import { useRootStore } from './stores/RootStore'
import { WelcomeScreen } from './components/WelcomeScreen'
import { AppLayout } from './components/AppLayout'

export const App = observer(() => {
  const rootStore = useRootStore()

  if (!rootStore.isProjectLoaded) {
    return <WelcomeScreen />
  }

  return <AppLayout />
})

const AppContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
`

