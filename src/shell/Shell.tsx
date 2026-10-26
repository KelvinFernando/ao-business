import { useEffect, useRef, type ReactNode } from 'react'
import { Check, CircleCheck, Lock, Phone, X } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import logo from '../assets/nbc-logo.svg'
import { type ScreenDef } from '../flow/registry'
import { text, useApp } from '../state/AppState'
import { Button, LinkButton, Modal } from '../components/ui'

const stepLabels = ['Get started','Business information','Owners and signers','Your identity','Tax and regulatory','Choose your package','Review and submit']
const stepRoutes = ['03-2-consent','04-1-business-details','05-1-people-exact','06-0-personal-info','07-1-tax-residency','08-1-needs','09-1-review']
const signerLabels = ['Consent','Your information','Your identity','Agreement']
const signerRoutes = ['11-4-signer-consent','11-5-signer-personal-info','11-6-signer-identity','11-7-signer-agreement']

function Header({ save, language, bordered = true }: { save: boolean; language: boolean; bordered?: boolean }) {
  const { setOverlay, saveExit, go, showToast } = useApp()
  const french = () => showToast('French version not included in this prototype')
  return <header className={`site-header ${bordered ? 'bordered' : ''}`}>
    <a className="brand" href="#/02-0-start?v=default" aria-label="National Bank prototype home" onClick={(event) => { event.preventDefault(); go('02-0-start') }}><img src={logo} alt="National Bank"/></a>
    <div className="header-actions"><div className="help-group"><Phone size={18}/><button className="link help-link" onClick={() => setOverlay('help')}>Need help? Talk to a business advisor</button><a className="phone-link" href="tel:+1888XXXXXXX">1 888 XXX-XXXX</a></div>{language && <><span className="vertical-divider"/><button className="language-button" lang="fr" onClick={french}>Français</button></>}{save && <><span className="vertical-divider"/><button className="link save-header" onClick={saveExit}>Save and finish later</button></>}</div>
  </header>
}

function Footer() {
  const { showToast } = useApp()
  return <footer className="site-footer"><nav className="footer-links" aria-label="Legal"><a href="about:blank" target="_blank" rel="noopener">Terms of use</a><a href="about:blank" target="_blank" rel="noopener">Privacy</a><a href="about:blank" target="_blank" rel="noopener">Security</a><a href="about:blank" target="_blank" rel="noopener">Accessibility</a><button className="link" lang="fr" onClick={() => showToast('French version not included in this prototype')}>Français</button></nav><span className="copyright">© National Bank of Canada. All rights reserved.</span></footer>
}

function Stepper({ current, signer = false, substep }: { current: number; signer?: boolean; substep?: number }) {
  const { go, state } = useApp()
  const labels = signer ? signerLabels : stepLabels
  const routes = signer ? signerRoutes : stepRoutes
  const sole = text(state.data.structure) === 'Sole proprietorship'
  return <div><p className="step-count">Step {current} of {labels.length}</p><nav aria-label="Application steps"><ol className="step-list">{labels.map((label,index) => {
    const number = index + 1
    const done = number < current
    const active = number === current
    const locked = !signer && number === 7 && current < 7
    const notNeeded = sole && number === 3 && !signer
    return <li className="step-item" key={label}><div className="step-indicator-col"><span className={`step-indicator ${done ? 'done' : active ? 'current' : locked ? 'locked' : ''}`}>{done ? <Check size={16}/> : locked ? <Lock size={12}/> : null}</span>{index < labels.length-1 && <span className={`step-connector ${done ? 'done' : ''}`}/>}</div><div className={`step-label ${done ? 'done' : active ? 'current' : ''}`} aria-current={active ? 'step' : undefined}>{done ? <a href={`#/${routes[index]}`} onClick={(event) => {event.preventDefault();go(routes[index])}} aria-label={`${label}, completed`}>{label}</a> : label}{notNeeded && <div className="small muted">Not needed for sole proprietors</div>}{active && !signer && current === 2 && <ol className="substeps">{['Business details','Address','Industry and employees','Documents'].map((item,i) => <li key={item} className={substep === i+1 || (!substep && i===0) ? 'current' : ''}>{item}</li>)}</ol>}{active && !signer && current === 3 && <div className="small muted">2 people added</div>}{active && !signer && current === 5 && <ol className="substeps"><li className={substep !== 2 ? 'current' : ''}>Tax residency</li><li className={substep === 2 ? 'current' : ''}>Declarations</li></ol>}</div></li>
  })}</ol></nav></div>
}

function HelpPanel({ onClose }: { onClose: () => void }) {
  const { showToast } = useApp()
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    ref.current?.focus()
    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab' && ref.current) {
        const items = [...ref.current.querySelectorAll<HTMLElement>('button,a,input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(item => !item.hasAttribute('disabled'))
        if (!items.length) return
        const first = items[0], last = items[items.length-1]
        if (document.activeElement === ref.current || !ref.current.contains(document.activeElement)) { event.preventDefault(); (event.shiftKey ? last : first).focus() }
        else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown',listener)
    return () => { document.removeEventListener('keydown',listener); previous?.focus() }
  },[onClose])
  return <div className="modal-scrim" onMouseDown={(event) => {if(event.target===event.currentTarget)onClose()}}><aside ref={ref} className="side-panel" role="dialog" aria-modal="true" aria-labelledby="help-title" tabIndex={-1}><div className="modal-header"><div><h2 id="help-title">Talk to a business advisor</h2><p className="helper">Help with Business information · Step 2 of 7</p></div><button className="icon-button" aria-label="Close help panel" onClick={onClose}><X size={20}/></button></div><div className="side-panel-body"><div className="panel"><span className="icon-circle"><Phone size={22}/></span><span className="helper">Call a business advisor</span><a href="tel:+1888XXXXXXX" style={{fontSize:24}}>1 888 XXX-XXXX</a><p>Monday to Friday, {'{hours}'} (Eastern time)</p><Button onClick={() => showToast('Callback request registered')}>Request a callback</Button><p className="xsmall muted">Choose a time and an advisor will call you at (450) 555-0137. Your application stays saved while you wait.</p></div><h3>Questions about this step</h3><details className="disclosure" open><summary>What's the difference between the legal name and the operating name?<span>−</span></summary><div className="disclosure-body">The legal name is the one on your registration documents, for example “Boulangerie Laval inc.”. The operating name is the name customers see on your sign or website. Leave it blank if it's the same.</div></details><details className="disclosure"><summary>Which business structure should I choose?<span>+</span></summary><div className="disclosure-body">Choose the structure shown on your registration documents.</div></details><details className="disclosure"><summary>Which documents will I need for this step?<span>+</span></summary><div className="disclosure-body">We’ll tell you exactly which documents are needed before you upload.</div></details></div><div className="side-panel-footer"><CircleCheck size={18} color="var(--color-success)"/><span className="small">Your progress is saved. Close this panel to go back to where you were.</span></div></aside></div>
}

function LeaveDialog({ onClose }: { onClose: () => void }) {
  const { go, markSaved, discardChanges } = useApp()
  return <Modal title="Leave this application?" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Stay here</Button><Button onClick={() => {markSaved();go('12-2-application-saved')}}>Save and finish later</Button></>}><div className="panel"><p><CircleCheck size={16} color="var(--color-success)"/> <strong>Your progress up to Business information is saved.</strong></p><p className="small">We'll email a link to marie@boulangerielaval.ca so you can pick up where you left off. Saved applications are kept for {'{N}'} days.</p></div><p>One thing isn't saved yet: the changes you made to Luc Gagnon's details on this page. Save them before you go, or they'll be lost.</p><LinkButton onClick={() => { discardChanges(); go('02-0-start') }}>Leave without saving this page</LinkButton></Modal>
}

export function Shell({ screen, children }: { screen: ScreenDef; children: ReactNode }) {
  const { state, overlay, setOverlay } = useApp()
  const location = useLocation()
  const forcedLeave = screen.id === '12-1-leave-dialog'
  const forcedHelp = screen.id === '12-7-help-panel'
  const effectiveStep = forcedLeave ? 3 : forcedHelp ? 2 : screen.step
  const isFlow = screen.shell === 'flow' || forcedLeave || forcedHelp
  const isSigner = screen.shell === 'signer'
  const isPre = screen.shell === 'pre' || screen.shell === 'status'
  const isPrepare = screen.shell === 'prepare'
  const substep = screen.id.includes('address') ? 2 : screen.id.includes('industry') ? 3 : screen.id.includes('documents') ? 4 : screen.id.includes('declarations') ? 2 : 1
  useEffect(() => {
    document.title = `${screen.title}${effectiveStep ? `: Step ${effectiveStep} of 7` : ''} — National Bank`
    const timer = window.setTimeout(() => document.querySelector<HTMLElement>('#main-content h1')?.focus(), 0)
    return () => window.clearTimeout(timer)
  },[location.pathname,screen.title,effectiveStep])
  if (screen.shell === 'email') return <>{children}{overlay === 'help' && <HelpPanel onClose={() => setOverlay(null)}/>}</>
  return <div className="app-shell"><a className="skip-link" href="#main-content" onClick={(event)=>{event.preventDefault();document.querySelector<HTMLElement>('#main-content h1')?.focus();document.getElementById('main-content')?.scrollIntoView()}}>Skip to main content</a><Header save={(isFlow || isSigner) && !forcedLeave && !forcedHelp} language={screen.shell === 'pre' && screen.id.startsWith('02')} bordered={!isFlow && !isSigner}/>{(isFlow || isSigner) && <div className="progress-track" aria-hidden="true"><div className="progress-fill" style={{width:`${(((effectiveStep ?? screen.signerStep ?? 1)-1)+.5)/(isSigner?4:7)*100}%`}}/></div>}<main id="main-content" className={isPre ? 'preflow-main' : isPrepare ? 'prepare-body' : 'flow-body'}>{(isFlow || isSigner) && <aside className="sidebar"><div className="sidebar-inner"><div><h2 className="sidebar-title">{isSigner ? 'Sign for a business account' : 'Open a business account'}</h2><p className="small muted">Boulangerie Laval inc.</p></div><Stepper current={effectiveStep ?? screen.signerStep ?? 1} signer={isSigner} substep={substep}/><div className="save-indicator" role="status"><CircleCheck size={16} color="var(--color-success)"/>Last saved at {state.lastSavedAt}</div></div></aside>}{isPre ? <div className={`preflow-column w${screen.width ?? 640} ${screen.shell === 'status' ? 'status-column' : ''} screen-${screen.id}`}>{children}</div> : isPrepare ? children : <div className="main-column"><div className={`content-column in-flow screen-${screen.id}`}>{children}</div></div>}</main><Footer/>{(overlay === 'help' || forcedHelp) && <HelpPanel onClose={() => forcedHelp ? history.back() : setOverlay(null)}/>}{(overlay === 'leave' || forcedLeave) && <LeaveDialog onClose={() => forcedLeave ? history.back() : setOverlay(null)}/>}</div>
}
