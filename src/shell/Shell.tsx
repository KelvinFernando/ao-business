import { useEffect, useRef, type ReactNode } from 'react'
import { Check, CircleCheck, Home, Phone, X } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import logo from '../assets/nbc-logo.svg'
import { type ScreenDef } from '../flow/registry'
import { applicationSectionOrder, partForScreen, routeForSection, sectionConfigs, sectionForScreen, type ApplicationSectionId } from '../flow/sections'
import { chosenPackage, sectionStatus, useApp, type SectionState } from '../state/AppState'
import { Button, LinkButton, Modal, RailItem } from '../components/ui'

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

function SignerStepper({ current }: { current: number }) {
  const { go } = useApp()
  return <div><p className="step-count">Step {current} of 4</p><nav aria-label="Signer steps"><ol className="step-list">{signerLabels.map((label,index) => {
    const number = index + 1
    const done = number < current
    const active = number === current
    return <li className="step-item" key={label}><div className="step-indicator-col"><span className={`step-indicator ${done ? 'done' : active ? 'current' : ''}`}>{done && <Check size={16}/>}</span>{index < signerLabels.length-1 && <span className={`step-connector ${done ? 'done' : ''}`}/>}</div><div className={`step-label ${done ? 'done' : active ? 'current' : ''}`} aria-current={active ? 'step' : undefined}>{done ? <a href={`#/${signerRoutes[index]}`} onClick={(event) => {event.preventDefault();go(signerRoutes[index])}}>{label}</a> : label}</div></li>
  })}</ol></nav></div>
}

const packageName = (value: ReturnType<typeof chosenPackage>) => value === 'hybrid' ? 'Hybrid' : value === 'premium' ? 'Premium' : 'Digital'

function ApplicationRail({ screen }: { screen: ScreenDef }) {
  const { go, state } = useApp()
  const currentSection = sectionForScreen(screen.id)
  const currentPart = partForScreen(screen.id, currentSection)
  const before = sectionStatus(state, 'before')
  const beforeDisplay = currentSection === 'before' && before.status !== 'complete' ? { ...before, status: 'in_progress' as const, reason: 'part 4 of 4' } : before
  const review = sectionStatus(state, 'review')
  const reasonFor = (section: ApplicationSectionId, current: SectionState) => {
    if (current.status === 'complete' && section === 'package') return `${packageName(chosenPackage(state))} Package`
    if (current.status === 'in_progress' && currentSection === section && currentPart) return `part ${currentPart} of ${sectionConfigs[section].parts.length}`
    if (current.status === 'not_started' && section === 'package') return `${packageName(state.startingPackage)} chosen at start`
    return current.reason
  }
  return <>
    <button type="button" className={`overview-home ${screen.id === '01-0-overview' ? 'current' : ''}`} aria-current={screen.id === '01-0-overview' ? 'page' : undefined} onClick={() => go('01-0-overview')}><Home size={20}/>Application overview</button>
    <nav className="section-rail" aria-label="Application sections"><ol className="section-rail-list">
      <RailItem label="Before you apply" status={beforeDisplay.status} reason={beforeDisplay.reason} current={currentSection === 'before'} connector onClick={() => go('03-2-consent')} substeps={currentSection === 'before' && before.status !== 'complete' ? ['Check you can apply', 'About you', 'Confirm your mobile', 'Prepare and consent'].map((label) => ({ label, current: label === 'Prepare and consent' })) : []}/>
      <li className="rail-group-label">YOUR APPLICATION · {before.status === 'complete' ? 'ANY ORDER' : 'OPENS NEXT'}</li>
      {applicationSectionOrder.map((section) => {
        const current = sectionStatus(state, section)
        const config = sectionConfigs[section]
        return <RailItem key={section} label={config.label} status={current.status} reason={reasonFor(section, current)} waitingOn={current.waitingOn} current={currentSection === section} connector onClick={before.status === 'complete' ? () => go(routeForSection(state, section)) : undefined} substeps={config.parts.length > 1 ? config.parts.map((part,index) => ({ label: part.label, current: currentPart === index + 1 })) : []}/>
      })}
      <RailItem label="Review and sign" status={review.status} reason={review.reason} current={currentSection === 'review'} ready={review.status === 'complete'} onClick={review.status === 'locked' ? undefined : () => go('09-1-review')}/>
    </ol></nav>
  </>
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
  return <div className="modal-scrim" onMouseDown={(event) => {if(event.target===event.currentTarget)onClose()}}><aside ref={ref} className="side-panel" role="dialog" aria-modal="true" aria-labelledby="help-title" tabIndex={-1}><div className="modal-header"><div><h2 id="help-title">Talk to a business advisor</h2><p className="helper">Help with your application</p></div><button className="icon-button" aria-label="Close help panel" onClick={onClose}><X size={20}/></button></div><div className="side-panel-body"><div className="panel"><span className="icon-circle"><Phone size={22}/></span><span className="helper">Call a business advisor</span><a href="tel:+1888XXXXXXX" style={{fontSize:24}}>1 888 XXX-XXXX</a><p>Monday to Friday, {'{hours}'} (Eastern time)</p><Button onClick={() => showToast('Callback request registered')}>Request a callback</Button><p className="xsmall muted">Choose a time and an advisor will call you at (450) 555-0137. Your application stays saved while you wait.</p></div><h3>Questions about this step</h3><details className="disclosure" open><summary>What's the difference between the legal name and the operating name?<span>−</span></summary><div className="disclosure-body">The legal name is the one on your registration documents, for example “Boulangerie Laval inc.”. The operating name is the name customers see on your sign or website. Leave it blank if it's the same.</div></details><details className="disclosure"><summary>Which business structure should I choose?<span>+</span></summary><div className="disclosure-body">Choose the structure shown on your registration documents.</div></details><details className="disclosure"><summary>Which documents will I need for this step?<span>+</span></summary><div className="disclosure-body">We’ll tell you exactly which documents are needed before you upload.</div></details></div><div className="side-panel-footer"><CircleCheck size={18} color="var(--color-success)"/><span className="small">Your progress is saved. Close this panel to go back to where you were.</span></div></aside></div>
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
  const isFlow = screen.shell === 'flow' || screen.id === '09-7-change-impact' || forcedLeave || forcedHelp
  const isSigner = screen.shell === 'signer'
  const isPre = screen.shell === 'pre' || screen.shell === 'status'
  const isPrepare = screen.shell === 'prepare'
  const completeCount = applicationSectionOrder.filter((section) => sectionStatus(state, section).status === 'complete').length
  const signerStep = screen.signerStep ?? 1
  const progress = isSigner ? ((signerStep - 1) + .5) / 4 * 100 : completeCount / 5 * 100
  useEffect(() => {
    document.title = `${screen.title}${isSigner ? `: Step ${signerStep} of 4` : ''} — National Bank`
    const timer = window.setTimeout(() => document.querySelector<HTMLElement>('#main-content h1')?.focus(), 0)
    return () => window.clearTimeout(timer)
  },[location.pathname,screen.title,isSigner,signerStep])
  if (screen.shell === 'email') return <>{children}{overlay === 'help' && <HelpPanel onClose={() => setOverlay(null)}/>}</>
  return <div className="app-shell"><a className="skip-link" href="#main-content" onClick={(event)=>{event.preventDefault();document.querySelector<HTMLElement>('#main-content h1')?.focus();document.getElementById('main-content')?.scrollIntoView()}}>Skip to main content</a><Header save={(isFlow || isSigner) && !forcedLeave && !forcedHelp} language={screen.shell === 'pre' && screen.id.startsWith('02')} bordered={!isFlow && !isSigner}/>{(isFlow || isSigner) && <div className="progress-track" aria-hidden="true"><div className="progress-fill" style={{width:`${progress}%`}}/></div>}<main id="main-content" className={isPre ? 'preflow-main' : isPrepare ? 'prepare-body' : 'flow-body'}>{(isFlow || isSigner) && <aside className="sidebar"><div className="sidebar-inner"><div><h2 className="sidebar-title">{isSigner ? 'Sign for a business account' : 'Open a business account'}</h2><p className="small muted">Boulangerie Laval inc.</p></div>{isSigner ? <SignerStepper current={signerStep}/> : <ApplicationRail screen={screen}/>}<div className="save-indicator" role="status"><CircleCheck size={16} color="var(--color-success)"/>Last saved at {state.lastSavedAt}</div></div></aside>}{isPre ? <div className={`preflow-column w${screen.width ?? 640} ${screen.shell === 'status' ? 'status-column' : ''} screen-${screen.id}`}>{children}</div> : isPrepare ? children : <div className="main-column"><div className={`content-column in-flow screen-${screen.id}`}>{children}</div></div>}</main><Footer/>{(overlay === 'help' || forcedHelp) && <HelpPanel onClose={() => forcedHelp ? history.back() : setOverlay(null)}/>}{(overlay === 'leave' || forcedLeave) && <LeaveDialog onClose={() => forcedLeave ? history.back() : setOverlay(null)}/>}</div>
}
