import { Alert, Button, Modal } from '../components/ui'

export function ChangeImpactDialog({ changeLabel, sectionLabel, question, onKeep, onSave }: { changeLabel: string; sectionLabel: string; question: string; onKeep: () => void; onSave: () => void }) {
  return <Modal title="This change affects another section" className="change-impact-dialog" onClose={onKeep} footer={<><Button variant="secondary" onClick={onKeep}>Keep my old answer</Button><Button onClick={onSave}>Save and answer now</Button></>}>
    <p>{changeLabel} We’ll need 1 more answer before you can sign.</p>
    <Alert tone="warning" title={`${sectionLabel} · 1 new question`}>{question}</Alert>
    <p className="small muted">Everything else stays complete. Review and sign will unlock again once you answer.</p>
  </Modal>
}
