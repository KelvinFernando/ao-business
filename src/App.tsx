import { useEffect } from 'react'
import { HashRouter, Navigate, useLocation } from 'react-router-dom'
import { GlassControl } from './devtools/GlassControl'
import { screenById } from './flow/registry'
import { sectionForScreen } from './flow/sections'
import { ScreenRenderer } from './screens/ScreenRenderer'
import { Shell } from './shell/Shell'
import { AppStateProvider, isDemoPreset, isSectionAvailable, useApp } from './state/AppState'
import './styles/base.css'

const redirects: Record<string, string> = {
  '03-1-prepare': '03-2-consent',
  '08-1b-use-case-opener': '08-1-needs',
  '08-2b-suggest-hybrid': '08-2-recommendation?v=suggest-hybrid',
  '08-3-compare': '08-2-recommendation?v=compare',
  '07-2-declarations': '07-1-tax-residency',
  '07-3-declarations-error': '07-1-tax-residency?v=error',
  '09-2-edit-business': '04-1-business-details',
  '09-3-review-dependency': '04-4-industry?v=impact',
  '09-6-agreement': '09-1-review#sign',
  '12-9-resume-welcome-back': '01-0-overview?v=returning',
}

function Prototype() {
  const location=useLocation(); const {state,toast,setStartingPackage,applyPreset}=useApp()
  const id=location.pathname.replace(/^\//,'')
  const screen=screenById[id]??screenById['02-0-start']
  const section=sectionForScreen(id)
  const prototypeJump=location.state?.prototypeJump===true
  useEffect(()=>{const pkg=new URLSearchParams(location.search).get('package');if(pkg==='digital'||pkg==='hybrid'||pkg==='premium')setStartingPackage(pkg)},[location.search,setStartingPackage])
  useEffect(()=>{const variant=new URLSearchParams(location.search).get('v')??'';if(id==='01-0-overview'&&isDemoPreset(variant))applyPreset(variant)},[applyPreset,id,location.search])
  if(redirects[id])return <Navigate to={`/${redirects[id]}`} replace state={location.state}/>
  if(!screenById[id])return <Navigate to="/02-0-start?v=default" replace/>
  if(section&&section!=='before'&&section!=='review'&&!prototypeJump&&!isSectionAvailable(state,section))return <Navigate to="/01-0-overview" replace/>
  return <><Shell screen={screen}><ScreenRenderer key={`${location.pathname}${location.search}`} screen={screen}/></Shell><GlassControl screen={screen}/>{toast&&<div className="toast" role="status">{toast}</div>}</>
}

export default function App(){return <HashRouter><AppStateProvider><Prototype/></AppStateProvider></HashRouter>}
