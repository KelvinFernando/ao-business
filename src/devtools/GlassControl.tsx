import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ChevronDown, Copy, GripHorizontal, RotateCcw, Search, X } from 'lucide-react'
import { nextRoute, personaFor, screenGroups, screens, variantsFor, type ScreenDef } from '../flow/registry'
import { useApp } from '../state/AppState'
import { PrototypeBadge } from './PrototypeBadge'

export function GlassControl({ screen }: { screen: ScreenDef }) {
  const {go,state,reset,showToast,set,setSubmitFailNext,setIdvResult}=useApp(); const location=useLocation()
  const [open,setOpen]=useState(false); const [search,setSearch]=useState(''); const [position,setPosition]=useState<{x:number;y:number}|null>(()=>{try{return JSON.parse(localStorage.getItem('dco-glass-position')??'null')}catch{return null}})
  const searchRef=useRef<HTMLInputElement>(null); const barRef=useRef<HTMLDivElement>(null); const panelRef=useRef<HTMLElement>(null); const drag=useRef<{x:number;y:number;px:number;py:number}|null>(null)
  const variants=variantsFor(screen); const persona=personaFor(screen)
  const last=useRef<{applicant:string;signer:string}>({applicant:'02-0-start',signer:'11-1-invitation-email'})
  useEffect(()=>{last.current[persona]=screen.id},[persona,screen.id])
  useEffect(()=>{setOpen(false);setSearch('')},[screen.id])
  useEffect(()=>{if(open)window.setTimeout(()=>searchRef.current?.focus(),50)},[open])
  useLayoutEffect(()=>{
    if(!open)return
    const updatePanel=()=>{
      const bar=barRef.current?.getBoundingClientRect(); const panel=panelRef.current
      if(!bar||!panel)return
      const margin=16; const gap=12
      const width=Math.min(440,window.innerWidth-margin*2)
      const left=Math.max(margin,Math.min(window.innerWidth-width-margin,bar.left+bar.width/2-width/2))
      const above=Math.max(0,bar.top-margin-gap); const below=Math.max(0,window.innerHeight-bar.bottom-margin-gap)
      const showAbove=above>=below
      Object.assign(panel.style,{
        left:`${left}px`,
        top:showAbove?'auto':`${bar.bottom+gap}px`,
        bottom:showAbove?`${window.innerHeight-bar.top+gap}px`:'auto',
        width:`${width}px`,
        maxHeight:`${Math.min(window.innerHeight*.7,showAbove?above:below)}px`,
        transform:'none',
      })
      panel.style.setProperty('--panel-enter-y',showAbove?'8px':'-8px')
    }
    updatePanel()
    window.addEventListener('resize',updatePanel)
    return()=>window.removeEventListener('resize',updatePanel)
  },[open,position])
  const changePersona=()=>{const target=persona==='applicant'?'signer':'applicant';go(last.current[target])}
  const move=(direction:1|-1)=>go(nextRoute(screen,direction).id)
  useEffect(()=>{const listener=(event:KeyboardEvent)=>{const routeId=window.location.hash.replace(/^#\//,'').split('?')[0];const active=screens.find(candidate=>candidate.id===routeId)??screens[0];const activeVariants=variantsFor(active);const activePersona=personaFor(active);const tag=event.target instanceof HTMLElement?event.target.tagName:'';const form=['INPUT','TEXTAREA','SELECT'].includes(tag);const moveTo=(direction:1|-1)=>go(nextRoute(active,direction).id);const variantTo=(direction:1|-1)=>{const i=activeVariants.findIndex(v=>v.id===active.id);const target=activeVariants[(i+direction+activeVariants.length)%activeVariants.length];go(target.id,target.variant)};if(event.altKey&&event.key==='ArrowRight'){event.preventDefault();moveTo(1)}else if(event.altKey&&event.key==='ArrowLeft'){event.preventDefault();moveTo(-1)}else if(event.altKey&&event.key==='ArrowDown'){event.preventDefault();variantTo(1)}else if(event.altKey&&event.key==='ArrowUp'){event.preventDefault();variantTo(-1)}else if(event.altKey&&event.key.toLowerCase()==='k'){event.preventDefault();setOpen(true)}else if(event.altKey&&event.key.toLowerCase()==='p'){event.preventDefault();const target=activePersona==='applicant'?'signer':'applicant';go(last.current[target])}else if(event.key==='Escape'){setOpen(false)}else if(!form&&event.key==='/'){event.preventDefault();setOpen(true)}};window.addEventListener('keydown',listener);return()=>window.removeEventListener('keydown',listener)},[go])
  useEffect(()=>{const up=()=>{if(drag.current){drag.current=null;localStorage.setItem('dco-glass-position',JSON.stringify(position))}};const moveMouse=(event:MouseEvent)=>{if(drag.current)setPosition({x:Math.max(8,Math.min(window.innerWidth-220,drag.current.px+event.clientX-drag.current.x)),y:Math.max(8,Math.min(window.innerHeight-70,drag.current.py+event.clientY-drag.current.y))})};window.addEventListener('mouseup',up);window.addEventListener('mousemove',moveMouse);return()=>{window.removeEventListener('mouseup',up);window.removeEventListener('mousemove',moveMouse)}},[position])
  if(new URLSearchParams(location.search).get('clean')==='1')return null
  const filtered=screens.filter(s=>personaFor(s)===persona&&`${s.code} ${s.title}`.toLowerCase().includes(search.toLowerCase()))
  const action=(label:string,fn:()=>void)=><button key={label} className="glass-btn" onClick={fn}>{label}</button>
  const actions:React.ReactNode[]=[]
  if(['02-6-verify-phone','02-7-verify-phone-wrong-code','11-2-verify-code'].includes(screen.id)){const key=screen.id.startsWith('11')?'signerCode':'phoneCode';actions.push(action('Fill correct code (123456)',()=>set(key,'123456')),action('Fill wrong code',()=>set(key,'381904')))}
  if(screen.id==='04-2-address')actions.push(action('Show suggestions',()=>window.dispatchEvent(new CustomEvent('dco-address',{detail:'suggestions'}))),action('No results',()=>window.dispatchEvent(new CustomEvent('dco-address',{detail:'none'}))))
  if(['04-5-documents','04-6-documents-error','10-2-action-required','10-2b-uploading','10-2c-upload-failed'].includes(screen.id))actions.push(action('Upload succeeds',()=>{window.dispatchEvent(new CustomEvent('dco-upload',{detail:'success'}));if(screen.id.startsWith('10'))go('10-3-under-review')}),action('Upload fails',()=>{window.dispatchEvent(new CustomEvent('dco-upload',{detail:'failure'}));if(screen.id.startsWith('10'))go('10-2c-upload-failed','failed')}))
  if(screen.id==='06-2-idv-phone-handoff')actions.push(action('Simulate photos submitted',()=>{go('06-3-idv-checking')}))
  if(['06-3-idv-checking','06-3b-idv-taking-longer','11-6-signer-identity'].includes(screen.id)){actions.push(action('Result: Verified',()=>{setIdvResult('verified');go(screen.id==='11-6-signer-identity'?'11-7-signer-agreement':'06-4-idv-verified')}),action('Result: Try again',()=>{setIdvResult('retry');go('06-5-idv-try-again')}),action('Result: Can’t verify',()=>{setIdvResult('failed');go('06-6-idv-another-way')}),action('Taking longer',()=>go('06-3b-idv-taking-longer','longer')))}
  if(['09-6-agreement','09-5-submit-failed'].includes(screen.id))actions.push(action(state.submitFailNext?'Next submit succeeds':'Next submit fails',()=>setSubmitFailNext(!state.submitFailNext)))
  if(['10-1-status-waiting-signer','10-1b-reminder-sent'].includes(screen.id))actions.push(action('Luc signs',()=>go('10-3-under-review')))
  if(screen.id==='10-3-under-review')actions.push(action('Bank requests a document',()=>go('10-2-action-required')),action('Approve',()=>go('10-4-account-open')),action('Decline',()=>go('10-5-not-approved')))
  if(screen.id==='11-1-invitation-email')actions.push(action('Link expired',()=>go('11-2b-link-expired','expired')))
  if(screen.shell==='flow'||screen.shell==='signer')actions.push(action('Make page dirty',()=>{set('presenterDirty',true);showToast('Page is dirty — Save and finish later will show the leave dialog')}))
  const barStyle=position?{left:position.x,top:position.y,bottom:'auto',transform:'none'}:undefined
  const copy=()=>{navigator.clipboard?.writeText(window.location.href);showToast('Link copied')}
  return createPortal(<div data-prototype-control>{open&&<section ref={panelRef} className="glass prototype-panel" role="dialog" aria-label="Screen jumper and prototype utilities"><div className="row-between"><strong>Prototype controls</strong><button className="glass-btn" aria-label="Close prototype panel" onClick={()=>setOpen(false)}><X size={16}/></button></div><div style={{position:'relative'}}><Search size={16} style={{position:'absolute',left:12,top:13}}/><input ref={searchRef} className="prototype-search" style={{paddingLeft:36}} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find a screen by code or title" aria-label="Find a screen"/></div><div className="prototype-list" role="listbox" aria-label="All screens">{screenGroups.map(group=>{const items=filtered.filter(s=>s.group===group);if(!items.length)return null;return <div key={group}><p className="prototype-group">{group}</p>{items.map(item=><div className={`prototype-screen ${item.id===screen.id?'current':''}`} key={item.id}><button role="option" aria-selected={item.id===screen.id} style={{all:'unset',cursor:'pointer',display:'flex',gap:8,flex:1,alignItems:'center'}} onClick={()=>go(item.id,item.variant)}><span className="code">{item.code}</span><span className="grow">{item.title}</span>{item.concept&&<span className="badge warning">Concept</span>}{variantsFor(item).length>1&&<span className="badge">{variantsFor(item).length}</span>}</button></div>)}</div>})}</div>{actions.length>0&&<div className="prototype-actions"><strong className="small">Screen actions</strong><div className="prototype-action-row">{actions}</div></div>}<div className="prototype-utilities"><button className="glass-btn" onClick={reset}><RotateCcw size={14}/>Reset demo data</button><button className="glass-btn" onClick={copy}><Copy size={14}/>Copy link to this state</button></div></section>}<div ref={barRef} className={`glass prototype-bar ${drag.current?'dragging':''}`} style={barStyle} role="toolbar" aria-label="Prototype controls"><PrototypeBadge/><button className="glass-btn" onClick={()=>move(-1)} aria-label="Previous screen"><ArrowLeft size={16}/>Prev</button><button className="glass-btn screen-jump selected" onClick={()=>setOpen(!open)} aria-expanded={open}><span style={{color:persona==='applicant'?'var(--color-primary)':'var(--color-navy600)'}}>●</span><span className="muted">{screen.code}</span>{screen.title}<ChevronDown size={14}/></button><div className="variant-chips" role="radiogroup" aria-label="Screen variants">{variants.length===1?<span className="xsmall muted" style={{padding:'0 8px'}}>No variations</span>:variants.map(item=><button key={item.id} role="radio" aria-checked={item.id===screen.id} className={`glass-btn ${item.id===screen.id?'selected':''}`} onClick={()=>go(item.id,item.variant)}>{item.title}</button>)}</div><div className="persona-toggle"><button className={`glass-btn ${persona==='applicant'?'selected':''}`} onClick={()=>persona!=='applicant'&&changePersona()}>Applicant</button><button className={`glass-btn ${persona==='signer'?'selected':''}`} onClick={()=>persona!=='signer'&&changePersona()}>Signer</button></div><button className="glass-btn" onClick={()=>move(1)} aria-label="Next screen">Next<ArrowRight size={16}/></button><span aria-label="Drag prototype controls" title="Drag to move · double-click to centre" style={{cursor:'grab',padding:8,touchAction:'none'}} onDoubleClick={()=>{setPosition(null);localStorage.removeItem('dco-glass-position')}} onMouseDown={e=>{drag.current={x:e.clientX,y:e.clientY,px:position?.x??window.innerWidth/2-400,py:position?.y??window.innerHeight-80}}}><GripHorizontal size={16}/></span></div></div>,document.body)
}
