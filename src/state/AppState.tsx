import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

export type Overlay = 'help' | 'leave' | 'why' | 'remove-person' | null
export type IdvResult = 'verified' | 'retry' | 'failed' | 'longer'

export interface DemoState {
  package: 'digital' | 'hybrid' | 'premium'
  data: Record<string, unknown>
  lastSavedAt: string
  dirty: boolean
  submitFailNext: boolean
  idvResult: IdvResult
}

const initialData: Record<string, unknown> = {
  structure: 'Corporation', soleRegistered: 'Yes', ownerCount: 2, signerCount: 2,
  ownersAllIndividuals: 'Yes', applicantIsOwnerSigner: 'Yes', signersAllOwners: 'Yes', all18: 'Yes', allInCanada: 'Yes',
  operatesInCanada: 'Yes', businessPurpose: 'Yes', onBehalf: 'No',
  legalBusinessName: 'Boulangerie Laval inc.', firstName: 'Marie', lastName: 'Tremblay', email: 'marie@boulangerielaval.ca', mobile: '(514) 555-4821',
  privacyConsent: true, accountLanguage: 'English', smsCredentials: false, phoneCode: '',
  consents: [false, false, false, false, false], signerConsents: [false, false, false],
  operatingName: 'Boulangerie Laval', businessPhone: '(450) 555-0137', website: 'boulangerielaval.ca', province: 'Quebec', neq: '1170 123 456', bn: '',
  operatingSixMonths: 'Yes', businessAddress: '1250 boul Saint-Mar', unit: '', mailingSame: 'Yes', ownLease: 'Lease',
  street: '1250 boul. Saint-Martin O', city: 'Laval', postal: 'H7S 1M', description: 'Artisan bakery in Laval. We bake bread and pastries on site and sell them in our shop, with a small café counter.',
  industry: 'Bakery that sells to the public', otherActivities: 'Yes', mainPercent: 80, otherPercent: 20, employees: 6, revenue: '$250,000 to $499,999',
  lucFirstName: 'Luc', lucLastName: 'Gagnon', lucEmail: 'luc@boulangerielaval.ca', lucMobile: '(514) 555-0182', lucTitle: 'Vice-president', lucOwner: true, lucSigner: true, lucPercent: 25,
  openingSigners: 'One signer', daySigners: 'Two signers', loanSigners: 'One signer',
  dobDay: '14', dobMonth: '03', dobYear: '1984', homeAddress: '4820 rue Fabre, Montréal, QC H2J 3V8', homeMailingSame: 'Yes', occupation: 'Business owner', employment: 'Self-employed', sin: '123 456 482', preferredLanguage: 'English',
  otherTaxCountry: 'Yes', taxCountry: 'France', countryTin: '12 345 678 901', noCountryTin: false, usTin: 'No', thirdParty: 'No', pep: undefined,
  employeesToPay: '6 to 20', payFrequency: 'Every 2 weeks', payrollManager: 'My accountant', payrollOptIn: true,
  international: ['Pay suppliers abroad','Buy or sell foreign currency'], suppliers: ['Interac e-Transfer','Electronic funds transfer (EFT)'], projects: ['Equipment'],
  partnerPayments: false, partnerPayroll: false, requestCall: false,
  agreementChecks: [false,false,false], signature: '', signerAgreementChecks: [false,false,false], signerSignature: '',
  signerFirstName: 'Luc', signerLastName: 'Gagnon', signerDobDay: '', signerDobMonth: '', signerDobYear: '', signerMobile: '', signerOccupation: '', signerEmployment: 'Employed', signerConfirm: false,
  fraudReport: false, dependencyAnswered: false,
}

const freshState = (): DemoState => ({
  package: 'digital', data: structuredClone(initialData), lastSavedAt: '10:42', dirty: false, submitFailNext: false, idvResult: 'verified',
})

const loadState = (): DemoState => {
  try {
    const raw = sessionStorage.getItem('dco-demo-state-v1')
    if (!raw) return freshState()
    const saved = JSON.parse(raw) as Partial<DemoState>
    return { ...freshState(), ...saved, data: { ...initialData, ...(saved.data ?? {}) }, dirty: false }
  } catch { return freshState() }
}

interface AppContextValue {
  state: DemoState
  set: (key: string, value: unknown) => void
  setPackage: (value: DemoState['package']) => void
  go: (route: string, variant?: string) => void
  saveExit: () => void
  markSaved: () => void
  reset: () => void
  overlay: Overlay
  setOverlay: (overlay: Overlay) => void
  toast: string
  showToast: (message: string) => void
  setSubmitFailNext: (value: boolean) => void
  setIdvResult: (value: IdvResult) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(loadState)
  const [overlay, setOverlay] = useState<Overlay>(null)
  const [toast, setToast] = useState('')
  const navigate = useNavigate()

  const persist = useCallback((next: DemoState) => {
    sessionStorage.setItem('dco-demo-state-v1', JSON.stringify(next))
    return next
  }, [])

  const set = useCallback((key: string, value: unknown) => {
    setState((previous) => persist({ ...previous, data: { ...previous.data, [key]: value }, dirty: true }))
  }, [persist])

  const setPackage = useCallback((value: DemoState['package']) => {
    setState((previous) => persist({ ...previous, package: value, dirty: true }))
  }, [persist])

  const markSaved = useCallback(() => {
    setState((previous) => persist({ ...previous, dirty: false, lastSavedAt: new Date().toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: false }) }))
  }, [persist])

  const go = useCallback((route: string, variant = 'default') => {
    setState((previous) => persist({ ...previous, dirty: false, lastSavedAt: new Date().toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: false }) }))
    setOverlay(null)
    navigate(`/${route}?v=${variant}`)
    window.scrollTo(0, 0)
  }, [navigate, persist])

  const saveExit = useCallback(() => {
    if (state.dirty) setOverlay('leave')
    else go('12-2-application-saved')
  }, [go, state.dirty])

  const reset = useCallback(() => {
    const next = freshState()
    sessionStorage.removeItem('dco-demo-state-v1')
    setState(next)
    setOverlay(null)
    navigate('/02-0-start?v=default')
  }, [navigate])

  const showToast = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast((current) => current === message ? '' : current), 3200)
  }, [])

  const setSubmitFailNext = useCallback((value: boolean) => setState((previous) => persist({ ...previous, submitFailNext: value })), [persist])
  const setIdvResult = useCallback((value: IdvResult) => setState((previous) => persist({ ...previous, idvResult: value })), [persist])

  const value = useMemo(() => ({ state, set, setPackage, go, saveExit, markSaved, reset, overlay, setOverlay, toast, showToast, setSubmitFailNext, setIdvResult }), [state, set, setPackage, go, saveExit, markSaved, reset, overlay, toast, showToast, setSubmitFailNext, setIdvResult])
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
