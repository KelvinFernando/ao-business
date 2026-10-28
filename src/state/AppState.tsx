import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { REFERENCE } from '../config/placeholders'
import { identityProvider } from '../identity/IdentityProvider'

export type Overlay = 'help' | 'leave' | 'why' | 'remove-person' | null
export type IdvResult = 'verified' | 'retry' | 'failed' | 'longer'
export type Status = 'not_started' | 'in_progress' | 'needs_attention' | 'waiting' | 'complete' | 'locked'
export type SectionId = 'before' | 'business' | 'package' | 'people' | 'you_id' | 'tax' | 'review'
export type PackageId = 'digital' | 'hybrid' | 'premium'
export type DemoPreset = 'fresh' | 'midway' | 'ready' | 'returning' | 'after-change'

export interface SectionState {
  status: Status
  reason?: string
  waitingOn?: string[]
  progress?: { done: number; total: number }
}

export interface Person {
  id: string
  firstName: string
  lastName: string
  title: string
  email: string
  mobile: string
  owner: boolean
  signer: boolean
  ownership: number
  primary?: boolean
  invited?: boolean
  mobileVerified?: boolean
}

export interface AppModel {
  reference: string
  startingPackage: PackageId
  package: PackageId | null
  language: 'en' | 'fr'
  legalName: string
  employees?: string
  taxCountries: { country: string; tin?: string }[]
  usPerson?: boolean
  people: Person[]
  sections: Record<SectionId, SectionState>
  pendingAttention: { section: SectionId; question: string }[]
  lastSeenAt?: string
  lastSavedAt: string
  submitted?: { at: string }
}

export interface DemoState extends AppModel {
  data: Record<string, unknown>
  dirty: boolean
  submitFailNext: boolean
  idvResult: IdvResult
}

const initialData: Record<string, unknown> = {
  structure: 'Corporation', soleRegistered: 'Yes', ownerCount: 2, signerCount: 2,
  ownersAllIndividuals: 'Yes', applicantIsOwnerSigner: 'Yes', signersAllOwners: 'Yes', all18: 'Yes', allInCanada: 'Yes',
  operatesInCanada: 'Yes', businessPurpose: 'Yes', onBehalf: 'No',
  legalBusinessName: 'Boulangerie Laval inc.', firstName: 'Marie', lastName: 'Tremblay', email: 'marie@boulangerielaval.ca', mobile: '(514) 555-0142',
  privacyConsent: true, accountLanguage: 'English', smsCredentials: false, phoneCode: '',
  consents: [true, false, false, false, false], signerConsents: [true, false, false],
  operatingName: 'Boulangerie Laval', businessPhone: '(450) 555-0137', website: 'boulangerielaval.ca', province: 'Quebec', neq: '1170 123 456', bn: '',
  operatingSixMonths: 'Yes', businessAddress: '1250 boul Saint-Mar', unit: '', mailingSame: 'Yes', ownLease: 'Lease',
  street: '1250 boul. Saint-Martin O', city: 'Laval', postal: 'H7S 1M', description: 'Artisan bakery in Laval. We bake bread and pastries on site and sell them in our shop, with a small café counter.',
  industry: 'Bakery that sells to the public', otherActivities: 'Yes', mainPercent: 80, otherPercent: 20, employees: 6, revenue: '$250,000 to $499,999',
  lucFirstName: 'Luc', lucLastName: 'Gagnon', lucEmail: 'luc@boulangerielaval.ca', lucMobile: '(514) 555-0177', lucTitle: 'Vice-president', lucOwner: true, lucSigner: true, lucPercent: 25,
  openingSigners: 'One signer', daySigners: 'Two signers', loanSigners: 'One signer',
  dobDay: '14', dobMonth: 'March', dobYear: '1984', homeAddress: '4820 rue Fabre, Montréal, QC H2J 3V8', homeMailingSame: 'Yes', occupation: 'Business owner', employment: 'Self-employed', sin: '123 456 482', preferredLanguage: 'English',
  otherTaxCountry: 'Yes', taxCountry: 'France', countryTin: '12 345 678 901', noCountryTin: false, usTin: 'No', thirdParty: 'No', pep: undefined,
  employeesToPay: '6 to 20', payFrequency: 'Every 2 weeks', payrollManager: 'My accountant', payrollOptIn: true,
  international: ['Pay suppliers abroad','Buy or sell foreign currency'], suppliers: ['Interac e-Transfer','Electronic funds transfer (EFT)'], projects: ['Equipment'],
  partnerPayments: false, partnerPayroll: false, requestCall: false,
  agreementChecks: [false,false,false], signature: '', signerAgreementChecks: [false,false,false], signerSignature: '',
  signerFirstName: 'Luc', signerLastName: 'Gagnon', signerDobDay: '14', signerDobMonth: 'March', signerDobYear: '1984', signerMobile: '(514) 555-0177', signerOccupation: 'Business owner', signerEmployment: 'Employed', signerHomeAddress: '4820 rue Fabre, Montréal, QC H2J 3V8', signerConfirm: false,
  fraudReport: false, dependencyAnswered: false, accountUses: ['Daily operations','Paying suppliers','Receiving customer payments','Cash deposits'], fundSources: ['Business revenue','Other'],
}

const peopleWithOwnership = (lucOwnership: number): Person[] => [
  { id: 'marie', firstName: 'Marie', lastName: 'Tremblay', title: 'President', email: 'marie@boulangerielaval.ca', mobile: '(514) 555-0142', owner: true, signer: true, ownership: 60, primary: true, mobileVerified: true },
  { id: 'luc', firstName: 'Luc', lastName: 'Gagnon', title: 'Vice-president', email: 'luc@boulangerielaval.ca', mobile: '(514) 555-0177', owner: true, signer: true, ownership: lucOwnership, invited: true, mobileVerified: true },
  { id: 'sophie', firstName: 'Sophie', lastName: 'Roy', title: 'Secretary', email: 'sophie@boulangerielaval.ca', mobile: '', owner: false, signer: true, ownership: 0, invited: true },
]

const sectionStates = (overrides: Partial<Record<SectionId, SectionState>> = {}): Record<SectionId, SectionState> => ({
  before: { status: 'not_started' },
  business: { status: 'not_started' },
  package: { status: 'not_started' },
  people: { status: 'not_started' },
  you_id: { status: 'not_started' },
  tax: { status: 'not_started' },
  review: { status: 'locked', reason: 'finish 5 more sections' },
  ...overrides,
})

const freshState = (): DemoState => ({
  reference: REFERENCE,
  startingPackage: 'digital',
  package: null,
  language: 'en',
  legalName: 'Boulangerie Laval inc.',
  employees: '6',
  taxCountries: [{ country: 'Canada' }, { country: 'France', tin: '12 345 678 901' }],
  usPerson: false,
  people: peopleWithOwnership(40),
  sections: sectionStates(),
  pendingAttention: [],
  lastSavedAt: '10:42',
  data: structuredClone(initialData),
  dirty: false,
  submitFailNext: false,
  idvResult: 'verified',
})

const applicationSections: Exclude<SectionId, 'before' | 'review'>[] = ['business', 'package', 'people', 'you_id', 'tax']

export function createDemoPreset(preset: DemoPreset): DemoState {
  const initial = freshState()
  const base = { ...initial, data: { ...initial.data, consents: [true, true, true, true, true] } }
  const beforeComplete = sectionStates({ before: { status: 'complete' } })
  if (preset === 'fresh') return { ...base, sections: beforeComplete }

  const midway: DemoState = {
    ...base,
    package: 'digital',
    people: peopleWithOwnership(25),
    sections: sectionStates({
      before: { status: 'complete' },
      business: { status: 'complete' },
      package: { status: 'complete' },
      people: { status: 'needs_attention', reason: '15% not assigned' },
      you_id: { status: 'in_progress', reason: 'ID check not started', progress: { done: 1, total: 2 } },
      tax: { status: 'not_started' },
      review: { status: 'locked', reason: 'finish 3 more sections' },
    }),
  }
  if (preset === 'midway') return midway
  if (preset === 'returning') return { ...midway, lastSeenAt: '2026-05-12T09:00:00.000Z' }

  const ready: DemoState = {
    ...base,
    package: 'digital',
    usPerson: false,
    data: { ...base.data, lucPercent: 40, pep: 'No' },
    people: peopleWithOwnership(40),
    sections: sectionStates({
      before: { status: 'complete' },
      business: { status: 'complete' },
      package: { status: 'complete' },
      people: { status: 'complete' },
      you_id: { status: 'complete' },
      tax: { status: 'complete' },
      review: { status: 'complete' },
    }),
  }
  if (preset === 'ready') return ready

  return {
    ...ready,
    data: { ...ready.data, industry: 'Restaurants (full service)', monthlyCash: '', dependencyAnswered: false },
    sections: {
      ...ready.sections,
      tax: { status: 'needs_attention', reason: '1 new question' },
      review: { status: 'locked', reason: 'fix 1 section' },
    },
    pendingAttention: [{ section: 'tax', question: 'Cash your business handles in a typical month' }],
  }
}

export const isDemoPreset = (value: string): value is DemoPreset => ['fresh', 'midway', 'ready', 'returning', 'after-change'].some((preset) => preset === value)

export const chosenPackage = (model: AppModel): PackageId => model.package ?? model.startingPackage
export const ownershipTotal = (model: AppModel) => model.people.reduce((sum, person) => sum + (person.owner ? person.ownership : 0), 0)
export const maskedPhone = (phone: string) => `…${phone.replace(/\D/g, '').slice(-4)}`
export const personMaskedPhone = (model: AppModel, personId: string) => maskedPhone(model.people.find((person) => person.id === personId)?.mobile ?? '')
export const hasReturningNotice = (model: AppModel) => Boolean(model.lastSeenAt)

export function sectionStatus(model: AppModel, section: SectionId): SectionState {
  if (section === 'review') {
    const attentionCount = new Set(model.pendingAttention.map((entry) => entry.section)).size
    if (attentionCount > 0) return { ...model.sections.review, status: 'locked', reason: `fix ${attentionCount} section${attentionCount === 1 ? '' : 's'}` }
    const incomplete = applicationSections.filter((id) => sectionStatus(model, id).status !== 'complete').length
    if (incomplete > 0) return { ...model.sections.review, status: 'locked', reason: `finish ${incomplete} more section${incomplete === 1 ? '' : 's'}` }
    return { ...model.sections.review, status: 'complete', reason: undefined }
  }

  const stored = model.sections[section]
  if (section === 'people') {
    const total = ownershipTotal(model)
    if (total !== 100) return { ...stored, status: 'needs_attention', reason: total < 100 ? `${100 - total}% not assigned` : `${total - 100}% over 100%` }
    if (stored.status === 'needs_attention' && (stored.reason?.includes('not assigned') || stored.reason?.includes('over 100%'))) {
      const complete = stored.progress ? stored.progress.done === stored.progress.total : false
      return { ...stored, status: complete ? 'complete' : 'in_progress', reason: undefined }
    }
  }

  const attentionCount = model.pendingAttention.filter((entry) => entry.section === section).length
  if (attentionCount > 0) return { ...stored, status: 'needs_attention', reason: `${attentionCount} new question${attentionCount === 1 ? '' : 's'}` }
  return stored
}

export function nextAction(model: AppModel): SectionId | null {
  const actionable = applicationSections.map((section) => ({ section, state: sectionStatus(model, section) }))
  const priorities: Status[] = ['needs_attention', 'in_progress', 'not_started']
  for (const status of priorities) {
    const match = actionable.find((item) => item.state.status === status)
    if (match) return match.section
  }
  return reviewLocked(model) ? null : 'review'
}

export const reviewLocked = (model: AppModel) => sectionStatus(model, 'review').status === 'locked'

export type AppAction =
  | { type: 'set'; key: string; value: unknown }
  | { type: 'set-package'; value: PackageId }
  | { type: 'set-starting-package'; value: PackageId }
  | { type: 'set-section'; section: SectionId; value: SectionState }
  | { type: 'resolve-attention'; section: SectionId }
  | { type: 'mark-saved'; at: string }
  | { type: 'replace'; state: DemoState }
  | { type: 'apply-preset'; preset: DemoPreset }
  | { type: 'set-submit-fail-next'; value: boolean }
  | { type: 'set-idv-result'; value: IdvResult }

export function appReducer(state: DemoState, action: AppAction): DemoState {
  switch (action.type) {
    case 'set': {
      const next = { ...state, data: { ...state.data, [action.key]: action.value }, dirty: true }
      if (action.key === 'legalBusinessName') return { ...next, legalName: String(action.value) }
      if (action.key === 'employees') return { ...next, employees: String(action.value) }
      if (action.key === 'accountLanguage' || action.key === 'preferredLanguage') return { ...next, language: action.value === 'Français' || action.value === 'fr' ? 'fr' : 'en' }
      if (action.key === 'usPerson') return { ...next, usPerson: action.value === true || action.value === 'Yes' }
      if (action.key === 'taxCountries') return { ...next, taxCountries: action.value as { country: string; tin?: string }[] }
      if (action.key === 'lucPercent') return { ...next, people: next.people.map((person) => person.id === 'luc' ? { ...person, ownership: Number(action.value) } : person) }
      return next
    }
    case 'set-package': return { ...state, package: action.value, dirty: true }
    case 'set-starting-package': return { ...state, startingPackage: action.value, dirty: true }
    case 'set-section': return { ...state, sections: { ...state.sections, [action.section]: action.value }, dirty: true }
    case 'resolve-attention': return { ...state, pendingAttention: state.pendingAttention.filter((entry) => entry.section !== action.section), dirty: true }
    case 'mark-saved': return { ...state, dirty: false, lastSavedAt: action.at }
    case 'replace': return action.state
    case 'apply-preset': return createDemoPreset(action.preset)
    case 'set-submit-fail-next': return { ...state, submitFailNext: action.value }
    case 'set-idv-result': return { ...state, idvResult: action.value }
  }
}

export const STATE_KEY = 'dco-demo-state-v2'

const loadState = (initial: DemoState): DemoState => {
  try {
    const raw = sessionStorage.getItem(STATE_KEY)
    if (!raw) return initial
    const saved = JSON.parse(raw) as Partial<DemoState>
    return {
      ...initial,
      ...saved,
      data: { ...initial.data, ...(saved.data ?? {}) },
      sections: { ...initial.sections, ...(saved.sections ?? {}) },
      people: saved.people ?? initial.people,
      pendingAttention: saved.pendingAttention ?? initial.pendingAttention,
      dirty: false,
    }
  } catch { return initial }
}

interface AppContextValue {
  state: DemoState
  set: (key: string, value: unknown) => void
  setPackage: (value: PackageId) => void
  setStartingPackage: (value: PackageId) => void
  setSection: (section: SectionId, value: SectionState) => void
  resolveAttention: (section: SectionId) => void
  applyPreset: (preset: DemoPreset) => void
  go: (route: string, variant?: string) => void
  saveExit: () => void
  markSaved: () => void
  discardChanges: () => void
  reset: () => void
  overlay: Overlay
  setOverlay: (overlay: Overlay) => void
  toast: string
  showToast: (message: string) => void
  setSubmitFailNext: (value: boolean) => void
  setIdvResult: (value: IdvResult) => void
}

const AppContext = createContext<AppContextValue | null>(null)
const savedTime = () => new Date().toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: false })

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, freshState(), loadState)
  const stateRef = useRef(state)
  const checkpoint = useRef<DemoState>(state)
  const [overlay, setOverlay] = useState<Overlay>(null)
  const [toast, setToast] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    stateRef.current = state
    sessionStorage.setItem(STATE_KEY, JSON.stringify(state))
  }, [state])

  const update = useCallback((action: AppAction) => {
    stateRef.current = appReducer(stateRef.current, action)
    dispatch(action)
  }, [])
  const set = useCallback((key: string, value: unknown) => update({ type: 'set', key, value }), [update])
  const setPackage = useCallback((value: PackageId) => update({ type: 'set-package', value }), [update])
  const setStartingPackage = useCallback((value: PackageId) => update({ type: 'set-starting-package', value }), [update])
  const setSection = useCallback((section: SectionId, value: SectionState) => update({ type: 'set-section', section, value }), [update])
  const resolveAttention = useCallback((section: SectionId) => update({ type: 'resolve-attention', section }), [update])
  const applyPreset = useCallback((preset: DemoPreset) => {
    checkpoint.current = createDemoPreset(preset)
    update({ type: 'apply-preset', preset })
  }, [update])

  const markSaved = useCallback(() => {
    update({ type: 'mark-saved', at: savedTime() })
    checkpoint.current = stateRef.current
  }, [update])

  const discardChanges = useCallback(() => {
    update({ type: 'replace', state: { ...checkpoint.current, dirty: false } })
  }, [update])

  const go = useCallback((route: string, variant = 'default') => {
    markSaved()
    setOverlay(null)
    navigate(`/${route}?v=${variant}`)
    window.scrollTo(0, 0)
  }, [markSaved, navigate])

  const saveExit = useCallback(() => {
    if (state.dirty) setOverlay('leave')
    else go('12-2-application-saved')
  }, [go, state.dirty])

  const reset = useCallback(() => {
    const next = freshState()
    sessionStorage.removeItem(STATE_KEY)
    checkpoint.current = next
    update({ type: 'replace', state: next })
    setOverlay(null)
    navigate('/02-0-start?v=default')
  }, [navigate, update])

  const showToast = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast((current) => current === message ? '' : current), 3200)
  }, [])

  const setSubmitFailNext = useCallback((value: boolean) => update({ type: 'set-submit-fail-next', value }), [update])
  const setIdvResult = useCallback((value: IdvResult) => {
    const outcome = value === 'verified' ? 'passed' : value === 'retry' || value === 'failed' ? 'failed' : 'in_progress'
    identityProvider.setOutcome('marie', outcome)
    identityProvider.setOutcome('luc', outcome)
    update({ type: 'set-idv-result', value })
  }, [update])

  const value = useMemo(() => ({ state, set, setPackage, setStartingPackage, setSection, resolveAttention, applyPreset, go, saveExit, markSaved, discardChanges, reset, overlay, setOverlay, toast, showToast, setSubmitFailNext, setIdvResult }), [state, set, setPackage, setStartingPackage, setSection, resolveAttention, applyPreset, go, saveExit, markSaved, discardChanges, reset, overlay, toast, showToast, setSubmitFailNext, setIdvResult])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppStateProvider')
  return context
}

export const text = (value: unknown, fallback = '') => typeof value === 'string' ? value : fallback
export const bool = (value: unknown) => value === true
export const array = (value: unknown): string[] => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
export const boolArray = (value: unknown, length: number): boolean[] => Array.isArray(value) ? Array.from({length}, (_, index) => value[index] === true) : Array.from({length}, () => false)

export function runStateModelChecks() {
  const fresh = createDemoPreset('fresh')
  const midway = createDemoPreset('midway')
  const ready = createDemoPreset('ready')
  const returning = createDemoPreset('returning')
  const afterChange = createDemoPreset('after-change')
  const checks: [string, boolean][] = [
    ['fresh: Before you apply complete', sectionStatus(fresh, 'before').status === 'complete'],
    ['fresh: all application sections not started', applicationSections.every((section) => sectionStatus(fresh, section).status === 'not_started')],
    ['fresh: Review locked', reviewLocked(fresh)],
    ['fresh: starting package separate from final package', fresh.startingPackage === 'digital' && fresh.package === null && chosenPackage(fresh) === 'digital'],
    ['midway: Business complete', sectionStatus(midway, 'business').status === 'complete'],
    ['midway: Package complete with Digital', sectionStatus(midway, 'package').status === 'complete' && chosenPackage(midway) === 'digital'],
    ['midway: 85% ownership gives 15% not assigned', ownershipTotal(midway) === 85 && sectionStatus(midway, 'people').reason === '15% not assigned'],
    ['midway: You and your ID in progress', sectionStatus(midway, 'you_id').status === 'in_progress'],
    ['midway: Tax not started', sectionStatus(midway, 'tax').status === 'not_started'],
    ['midway: Review locked for 3 sections', sectionStatus(midway, 'review').reason === 'finish 3 more sections'],
    ['midway: needs attention is next', nextAction(midway) === 'people'],
    ['ready: all application sections complete', applicationSections.every((section) => sectionStatus(ready, section).status === 'complete')],
    ['ready: Review ready', !reviewLocked(ready) && sectionStatus(ready, 'review').status === 'complete'],
    ['ready: next action is Review', nextAction(ready) === 'review'],
    ['returning: notice enabled', hasReturningNotice(returning)],
    ['returning: midway state retained', sectionStatus(returning, 'people').reason === '15% not assigned'],
    ['after-change: Tax needs one answer', sectionStatus(afterChange, 'tax').status === 'needs_attention' && sectionStatus(afterChange, 'tax').reason === '1 new question'],
    ['after-change: Review locked for one fix', sectionStatus(afterChange, 'review').reason === 'fix 1 section'],
    ['after-change: Tax is next', nextAction(afterChange) === 'tax'],
    ['phone mask comes from person state', personMaskedPhone(midway, 'luc') === '…0177'],
  ]
  checks.forEach(([name, passed]) => console.assert(passed, `DCO state check failed: ${name}`))
  const passed = checks.every(([, result]) => result)
  if (passed) console.info(`DCO state checks: ${checks.length} passed`)
  return passed
}

if (import.meta.env.DEV) runStateModelChecks()
