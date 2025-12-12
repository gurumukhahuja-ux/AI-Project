import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import NavigationProvider from './Navigation.Provider'
import { RecoilRoot } from 'recoil'

function App() {

  return (
    <>
      <RecoilRoot>
        <NavigationProvider />
      </RecoilRoot>
    </>
  )
}

export default App
