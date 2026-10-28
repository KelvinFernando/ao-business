import type { AppModel, SectionId } from '../state/AppState'
import { ownershipTotal } from '../state/AppState'

export type ApplicationSectionId = Exclude<SectionId, 'before' | 'review'>

export interface SectionPart {
  label: string
  routes: string[]
}

export interface SectionConfig {
  label: string
  firstRoute: string
  minutes: number
  parts: SectionPart[]
}

export const applicationSectionOrder: ApplicationSectionId[] = ['business', 'package', 'people', 'you_id', 'tax']

export const sectionConfigs: Record<ApplicationSectionId, SectionConfig> = {
  business: {
    label: 'Business',
    firstRoute: '04-1-business-details',
    minutes: 5,
    parts: [
      { label: 'Business details', routes: ['04-0-find-business', '04-1-business-details'] },
      { label: 'Address', routes: ['04-2-address', '04-3-address-manual'] },
      { label: 'Industry and employees', routes: ['04-4-industry'] },
      { label: 'Documents', routes: ['04-5-documents', '04-6-documents-error'] },
    ],
  },
  package: {
    label: 'Package and services',
    firstRoute: '08-1-needs',
    minutes: 3,
    parts: [
      { label: 'Your needs', routes: ['08-1-needs', '08-1b-use-case-opener'] },
      { label: 'Your package', routes: ['08-2-recommendation', '08-2b-suggest-hybrid', '08-3-compare'] },
    ],
  },
  people: {
    label: 'Owners and signers',
    firstRoute: '05-1-people-under',
    minutes: 4,
    parts: [
      { label: 'Owners and signers', routes: ['05-1-people-under', '05-1-people-exact', '05-1-people-over', '05-2-person'] },
      { label: 'Signing requirements', routes: ['05-3-signing'] },
    ],
  },
  you_id: {
    label: 'You and your ID',
    firstRoute: '06-0-personal-info',
    minutes: 4,
    parts: [
      { label: 'About you', routes: ['06-0-personal-info'] },
      { label: 'Verify your identity', routes: ['06-1-idv-get-ready', '06-2-idv-phone-handoff', '06-3-idv-checking', '06-3b-idv-taking-longer', '06-4-idv-verified', '06-5-idv-try-again', '06-6-idv-another-way'] },
    ],
  },
  tax: {
    label: 'Tax and declarations',
    firstRoute: '07-1-tax-residency',
    minutes: 2,
    parts: [
      { label: 'Tax and declarations', routes: ['07-1-tax-residency', '07-2-declarations', '07-3-declarations-error', '07-4-purpose-funds'] },
    ],
  },
}

export const sectionForScreen = (screenId: string): SectionId | null => {
  if (screenId === '03-1-prepare' || screenId === '03-2-consent') return 'before'
  if (['09-1-review', '09-2-edit-business', '09-3-review-dependency', '09-5-submit-failed', '09-6-agreement'].includes(screenId)) return 'review'
  if (screenId === '09-7-change-impact') return 'business'
  if (screenId === '12-1-leave-dialog') return 'people'
  if (screenId === '12-7-help-panel') return 'business'
  for (const section of applicationSectionOrder) {
    if (sectionConfigs[section].parts.some((part) => part.routes.includes(screenId))) return section
  }
  return null
}

export const partForScreen = (screenId: string, section: SectionId | null = sectionForScreen(screenId)) => {
  if (!section || section === 'before' || section === 'review') return undefined
  const index = sectionConfigs[section].parts.findIndex((part) => part.routes.includes(screenId))
  return index < 0 ? undefined : index + 1
}

export const routeForSection = (model: AppModel, section: ApplicationSectionId) => {
  if (section === 'people' && ownershipTotal(model) === 100) return '05-1-people-exact'
  const stored = model.sections[section]
  const partIndex = stored.status === 'in_progress' && stored.progress ? Math.min(stored.progress.done, sectionConfigs[section].parts.length - 1) : 0
  return sectionConfigs[section].parts[partIndex].routes[0]
}
