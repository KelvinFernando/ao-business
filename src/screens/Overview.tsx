import { Alert, AttentionRow, NextStepCard, WhoNeedsToAct } from '../components/ui'
import { applicationSectionOrder, routeForSection, sectionConfigs, type ApplicationSectionId } from '../flow/sections'
import { hasReturningNotice, nextAction, sectionStatus, text, useApp, type SectionState, type Status } from '../state/AppState'
import { PageHeader } from './shared'

const actionLabel = (status: Status) => status === 'needs_attention' ? 'Fix' : status === 'in_progress' ? 'Continue' : status === 'waiting' ? 'Send a reminder' : 'Start'

const rowReason = (section: ApplicationSectionId, state: SectionState) => {
  if (state.status === 'not_started') return `About ${sectionConfigs[section].minutes} minutes`
  if (section === 'you_id' && state.status === 'in_progress') return 'Personal details done. Identity check not started.'
  if (state.reason) return state.reason
  if (state.progress) return `Part ${Math.min(state.progress.done + 1, state.progress.total)} of ${state.progress.total}`
  return 'Answers saved'
}

export function OverviewScreen() {
  const { state, go, setSection, showToast } = useApp()
  const statuses = applicationSectionOrder.map((section) => ({ section, state: sectionStatus(state, section) }))
  const completeCount = statuses.filter((item) => item.state.status === 'complete').length
  const next = nextAction(state)
  const firstVisit = completeCount === 0 && statuses.every((item) => item.state.status === 'not_started') && !hasReturningNotice(state)
  const firstName = text(state.data.firstName, 'Marie')
  const incompleteCount = statuses.length - completeCount
  const marie = state.people.find((person) => person.id === 'marie')
  const luc = state.people.find((person) => person.id === 'luc')

  const openSection = (section: ApplicationSectionId) => {
    const route = routeForSection(state, section)
    const current = sectionStatus(state, section)
    if (current.status === 'not_started') setSection(section, { status: 'in_progress', progress: { done: 0, total: sectionConfigs[section].parts.length } })
    go(route)
  }

  const nextContent = next === 'review' ? {
    title: 'Review and sign',
    description: 'All five sections are complete. Check your answers and sign when you’re ready.',
    button: 'Review and sign',
  } : next && next !== 'before' ? (() => {
    const section = next as ApplicationSectionId
    const current = sectionStatus(state, section)
    const label = sectionConfigs[section].label
    if (section === 'people' && current.status === 'needs_attention') return { title: 'Fix ownership in Owners and signers', description: `${current.reason?.replace(' not assigned', '')} of the business isn’t assigned to anyone. It must add up to 100%.`, button: 'Fix ownership' }
    if (current.status === 'needs_attention') return { title: `Fix ${label}`, description: rowReason(section, current), button: 'Fix' }
    if (current.status === 'in_progress') return { title: `Continue ${label}`, description: rowReason(section, current), button: 'Continue' }
    return { title: `Start ${label}`, description: rowReason(section, current), button: 'Start' }
  })() : null

  return <>
    <PageHeader eyebrow={`Application overview · ${completeCount} of 5 sections complete`} title={firstVisit ? 'Your application' : `Welcome back, ${firstName}`} lead="Fill in the sections in any order. We save as you go. When all five are complete, you can review and sign."/>
    {hasReturningNotice(state) && <div aria-live="polite"><Alert title="Since you were last here">We confirmed Boulangerie Laval inc. with the Quebec business registry. Nothing else changed.</Alert></div>}
    {nextContent && <NextStepCard title={nextContent.title} description={nextContent.description} buttonLabel={nextContent.button} onClick={() => next === 'review' ? go('09-1-review') : next && next !== 'before' ? openSection(next as ApplicationSectionId) : undefined}/>} 
    {statuses.some((item) => item.section !== next && item.state.status !== 'complete') && <section className="overview-group" aria-labelledby="also-in-progress">
      <h2 id="also-in-progress">Also in progress</h2>
      <div className="stack-sm">{statuses.filter((item) => item.section !== next && item.state.status !== 'complete').map(({ section, state: current }) => <AttentionRow key={section} title={sectionConfigs[section].label} reason={rowReason(section, current)} status={current.status} waitingOn={current.waitingOn} buttonLabel={actionLabel(current.status)} onClick={() => current.status === 'waiting' ? showToast(`Reminder sent to ${current.waitingOn?.[0] ?? 'signer'}`) : openSection(section)}/>)}</div>
    </section>}
    <WhoNeedsToAct rows={[
      { name: 'Marie Tremblay (you)', description: `Primary applicant · owner ${marie?.ownership ?? 60}%`, action: `${incompleteCount} section${incompleteCount === 1 ? '' : 's'} left` },
      { name: 'Luc Gagnon', description: `Owner ${luc?.ownership ?? 25}% · authorized signer`, action: 'We’ll email him after you sign' },
    ]}/>
  </>
}
