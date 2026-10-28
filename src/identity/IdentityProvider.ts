export type IdentityOutcome = 'idle' | 'handoff_sent' | 'in_progress' | 'passed' | 'failed' | 'assisted'

export interface IdentityProvider {
  start(personId: string): Promise<IdentityOutcome>
  sendHandoff(personId: string): Promise<IdentityOutcome>
  getStatus(personId: string): Promise<IdentityOutcome>
}

export class MockIdentityProvider implements IdentityProvider {
  private outcomes = new Map<string, IdentityOutcome>()

  start(personId: string) {
    this.outcomes.set(personId, 'in_progress')
    return Promise.resolve<IdentityOutcome>('in_progress')
  }

  sendHandoff(personId: string) {
    this.outcomes.set(personId, 'handoff_sent')
    return Promise.resolve<IdentityOutcome>('handoff_sent')
  }

  getStatus(personId: string) {
    return Promise.resolve<IdentityOutcome>(this.outcomes.get(personId) ?? 'idle')
  }

  setOutcome(personId: string, outcome: IdentityOutcome) {
    this.outcomes.set(personId, outcome)
  }
}

export const identityProvider = new MockIdentityProvider()
