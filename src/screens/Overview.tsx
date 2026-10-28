import { Alert, AttentionRow, NextStepCard, WhoNeedsToAct } from '../components/ui'
import { applicationSectionOrder, routeForSection, sectionConfigs, type ApplicationSectionId } from '../flow/sections'
import { hasReturningNotice, isSectionAvailable, nextAction, sectionStatus, text, useApp, type SectionState, type Status } from '../state/AppState'
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
  const whoRows = [
    { name: 'Marie Tremblay (you)', description: `Primary applicant · owner ${marie?.ownership ?? 60}%`, action: `${incompleteCount} section${incompleteCount === 1 ? '' : 's'} left` },
    ...(state.data.lucAdded === true ? [{ name: 'Luc Gagnon', description: `Owner ${luc?.ownership ?? 25}% · authorized signer`, action: 'We’ll email him after you sign' }] : []),
  ]

  const openSection = (section: ApplicationSectionId) => {
    if (!isSectionAvailable(state, section)) return
    const route = routeForSection(state, section)
    const current = sectionStatus(state, section)
    if (current.status === 'not_started') setSection(section, { status: 'in_progress', progress: { done: 0, total: sectionConfigs[section].parts.length } })
    go(route)
  }

  const nextContent = next === 'before' ? {
    title: 'Finish Before you apply',
    description: 'Complete your preparation and consent before starting the five sections.',
    button: 'Continue',
  } : next === 'review' ? {
    title: 'Review and sign',
    description: 'All five sections are complete. Check your answers and sign when you’re ready.',
    button: 'Review and sign',
  } : next ? (() => {
    const section = next as ApplicationSectionId
    const current = sectionStatus(state, section)
    const label = sectionConfigs[section].label
    if (section === 'people' && current.status === 'needs_attention') return { title: 'Fix ownership in Owners and signers', description: `${current.reason?.replace(' not assigned', '')} of the business isn’t assigned to anyone. It must add up to 100%.`, button: 'Fix ownership' }
    if (current.status === 'needs_attention') return { title: `Fix ${label}`, description: rowReason(section, current), button: 'Fix' }
    if (current.status === 'in_progress') return { title: `Continue ${label}`, description: rowReason(section, current), button: 'Continue' }
    return { title: `Start ${label}`, description: rowReason(section, current), button: 'Start' }
  })() : null
  const remainingStatuses = statuses.filter((item) => item.section !== next && item.state.status !== 'complete')

  return <>
    <PageHeader eyebrow={`Application overview · ${completeCount} of 5 sections complete`} title={firstVisit ? 'Your application' : `Welcome back, ${firstName}`} lead="Complete the sections in order. We save as you go. When all five are complete, you can review and sign."/>
    {hasReturningNotice(state) && <div aria-live="polite"><Alert title="Since you were last here">We confirmed Boulangerie Laval inc. with the Quebec business registry. Nothing else changed.</Alert></div>}
    {nextContent && <NextStepCard title={nextContent.title} description={nextContent.description} buttonLabel={nextContent.button} onClick={() => next === 'before' ? go('03-2-consent') : next === 'review' ? go('09-1-review') : next ? openSection(next as ApplicationSectionId) : undefined}/>}
    {remainingStatuses.length > 0 && <section className="overview-group" aria-labelledby="remaining-sections">
      <h2 id="remaining-sections">Remaining sections</h2>
      <div className="stack-sm">{remainingStatuses.map(({ section, state: current }) => {
        const available = isSectionAvailable(state, section)
        const index = applicationSectionOrder.indexOf(section)
        const reason = available ? rowReason(section, current) : index === 0 ? 'Complete Before you apply first' : `Complete ${sectionConfigs[applicationSectionOrder[index - 1]].label} first`
        return <AttentionRow key={section} title={sectionConfigs[section].label} reason={reason} status={available ? current.status : 'locked'} waitingOn={current.waitingOn} buttonLabel={available ? actionLabel(current.status) : undefined} onClick={available ? () => current.status === 'waiting' ? showToast(`Reminder sent to ${current.waitingOn?.[0] ?? 'signer'}`) : openSection(section) : undefined}/>
      })}</div>
    </section>}
    <WhoNeedsToAct rows={whoRows}/>
  </>
}
