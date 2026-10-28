import type { SectionId } from '../state/AppState'

export type ChangeId =
  | 'industry'
  | 'business-structure'
  | 'ownership'
  | 'signers'
  | 'province-registration'
  | 'primary-identity'
  | 'package'
  | 'invitee-email'

export type ImpactEffect = 'redo' | 'reconfirm' | 'lock'
export type ImpactedSectionId = Exclude<SectionId, 'before'>

export interface DependencyImpact {
  section: ImpactedSectionId
  effect?: ImpactEffect
  documents?: Exclude<ImpactEffect, 'lock'>
  invites?: 'redo'
  newQuestion?: string
  revokeOldLink?: boolean
}

export interface DependencyRule {
  condition?: 'cash-intensive-industry'
  impacts: DependencyImpact[]
}

export const CASH_QUESTION = 'Cash your business handles in a typical month'

export const dependencyMatrix: Record<ChangeId, DependencyRule> = {
  industry: {
    condition: 'cash-intensive-industry',
    impacts: [
      { section: 'tax', effect: 'redo', newQuestion: CASH_QUESTION },
      { section: 'review', effect: 'lock' },
    ],
  },
  'business-structure': {
    impacts: [
      { section: 'business', effect: 'reconfirm', documents: 'redo' },
      { section: 'people', effect: 'redo' },
      { section: 'tax', effect: 'reconfirm' },
      { section: 'review', effect: 'redo' },
    ],
  },
  ownership: {
    impacts: [
      { section: 'business', documents: 'reconfirm' },
      { section: 'people', effect: 'redo' },
      { section: 'review', effect: 'redo' },
    ],
  },
  signers: {
    impacts: [
      { section: 'business', documents: 'reconfirm' },
      { section: 'people', effect: 'reconfirm', invites: 'redo' },
      { section: 'review', effect: 'redo' },
    ],
  },
  'province-registration': {
    impacts: [
      { section: 'business', effect: 'redo' },
      { section: 'tax', effect: 'reconfirm' },
      { section: 'review', effect: 'redo' },
    ],
  },
  'primary-identity': {
    impacts: [
      { section: 'people', effect: 'reconfirm' },
      { section: 'you_id', effect: 'redo' },
      { section: 'review', effect: 'redo' },
    ],
  },
  package: {
    impacts: [
      { section: 'business', documents: 'reconfirm' },
      { section: 'package', effect: 'redo' },
      { section: 'you_id', effect: 'reconfirm' },
      { section: 'review', effect: 'reconfirm' },
    ],
  },
  'invitee-email': {
    impacts: [
      { section: 'people', effect: 'reconfirm', revokeOldLink: true },
    ],
  },
}

export const impactsForChange = (change: ChangeId) => dependencyMatrix[change].impacts
export const isCashIntensiveIndustry = (industry: string) => industry === 'Restaurants (full service)'
