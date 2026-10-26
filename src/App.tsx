import { useEffect } from 'react'
import { HashRouter, Navigate, useLocation } from 'react-router-dom'
import { GlassControl } from './devtools/GlassControl'
import { screenById } from './flow/registry'
import { ScreenRenderer } from './screens/ScreenRenderer'
import { Shell } from './shell/Shell'
import { AppStateProvider, useApp } from './state/AppState'
import './styles/base.css'

function Prototype() {
  const location=useLocation(); const {toast,setPackage}=useApp()
  const id=location.pathname.replace(/^\//,'')
  const screen=screenById[id]??screenById['02-0-start']
  useEffect(()=>{const pkg=new URLSearchParams(location.search).get('package');if(pkg==='digital'||pkg==='hybrid'||pkg==='premium')setPackage(pkg)},[location.search,setPackage])
  if(!screenById[id])return <Navigate to="/02-0-start?v=default" replace/>
  return <><Shell screen={screen}><ScreenRenderer screen={screen}/></Shell><GlassControl screen={screen}/>{toast&&<div className="toast" role="status">{toast}</div>}</>
}

export default function App(){return <HashRouter><AppStateProvider><Prototype/></AppStateProvider></HashRouter>}
