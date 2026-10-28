import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowRight, Bell, Check, Clock3, Mail } from 'lucide-react'
import { ActionBar, Alert, Badge, Button, Card, Checkbox, ChoiceTiles, Field, LinkButton, Modal, SelectField } from '../components/ui'
import { array, bool, chosenPackage, reviewLocked, sectionStatus, text, useApp } from '../state/AppState'
import { AgreementForm, DefinitionGrid, PackageSelector, PageHeader, ReviewCards } from './shared'
import { ADVISOR_CALLBACK, PACKAGE_PRICES, PHONE, REVIEW_TIME } from '../config/placeholders'

const packageInfo={digital:['Digital Package',PACKAGE_PRICES.digital],hybrid:['Hybrid Package',PACKAGE_PRICES.hybrid],premium:['Premium Package',PACKAGE_PRICES.premium]} as const

export function NeedsScreen() {
  const { state, set, setSection, go } = useApp()
  const toggle = (key: string, value: string, none?: string) => {
    const current = array(state.data[key])
    const next = current.includes(value) ? current.filter((item) => item !== value) : value === none ? [value] : [...current.filter((item) => item !== none), value]
    set(key, next)
  }
  const [startingName, startingFee] = packageInfo[state.startingPackage]
  const businessComplete = sectionStatus(state, 'business').status === 'complete'
  const employeeCount = Number(state.employees ?? 0)
  const employeeRange = employeeCount === 0 ? 'No employees' : employeeCount <= 5 ? '1 to 5' : employeeCount <= 20 ? '6 to 20' : 'More than 20'
  const answered = [text(state.data.payrollManager), array(state.data.international).length > 0, array(state.data.suppliers).length > 0, array(state.data.projects).length > 0].filter(Boolean).length
  return <>
    <PageHeader eyebrow="Package and services · Part 1 of 2" title={`How will ${state.legalName} use its account?`} lead="Answer 4 quick questions to check your package still fits. It takes about a minute."/>
    <Card className="starting-package-card"><p className="eyebrow">YOU STARTED WITH</p><strong>{startingName} · {startingFee}/month</strong><p className="small muted">These questions check it still fits. You can keep it or choose another on the next page.</p></Card>
    <Card title="From your business information" className="business-info-card"><div className="row-between"><span className="muted">Industry</span><span>{text(state.data.industry)}</span></div><div className="row-between"><span className="muted">Employees</span><span>{employeeRange}</span></div><LinkButton onClick={() => go('04-1-business-details')}>{businessComplete ? 'Change in Business' : 'Add in Business'}</LinkButton></Card>
    <Alert>An estimate is fine. We use your answers to check your package, not to decide on your application. You can keep the {startingName} or choose another on the next page.</Alert>
    <Card>
      <div className="row-between"><strong>4 questions · all on this page</strong><Badge tone="success">{answered} of 4 answered</Badge></div>
      {employeeCount > 0 && <div className="panel"><p className="field-label">How often do you pay employees?</p><ChoiceTiles columns={4} name="payFrequency" value={text(state.data.payFrequency)} onChange={(value) => set('payFrequency', value)} options={['Weekly', 'Every 2 weeks', 'Monthly', 'As needed']}/></div>}
      <hr className="divider"/>
      <p className="field-label">1. Who manages payroll?</p><ChoiceTiles name="payrollManager" value={text(state.data.payrollManager)} onChange={(value) => set('payrollManager', value)} options={['I do it myself', 'My accountant', 'A bookkeeper or office manager', 'Doesn’t apply']}/>
      <Checkbox boxed checked={bool(state.data.payrollOptIn)} onChange={(value) => set('payrollOptIn', value)} label="Yes, I’d like to learn about payroll solutions"/>
      <hr className="divider"/>
      <p className="field-label">2. Does the business deal with other countries?</p><p className="helper">Select all that apply.</p><ChoiceTiles type="checkbox" name="international" value={array(state.data.international)} onChange={(value) => toggle('international', value, 'None of these')} options={['Receive payments from clients abroad', 'Pay suppliers abroad', 'Send international wires', 'Receive international wires', 'Buy or sell foreign currency', 'None of these']}/>
      <hr className="divider"/>
      <p className="field-label">3. How does the business pay its suppliers?</p><p className="helper">Select all that apply.</p><ChoiceTiles type="checkbox" name="suppliers" value={array(state.data.suppliers)} onChange={(value) => toggle('suppliers', value, 'We don’t pay suppliers regularly')} options={['Cheque', 'Interac e-Transfer', 'Electronic funds transfer (EFT)', 'Pre-authorized debit (PAD)', 'Wire transfer', 'We don’t pay suppliers regularly']}/>
      <hr className="divider"/>
      <p className="field-label">4. Any projects or big expenses coming up?</p><p className="helper">Select all that apply.</p><ChoiceTiles type="checkbox" name="projects" value={array(state.data.projects)} onChange={(value) => toggle('projects', value, 'Nothing planned')} options={['Equipment', 'Inventory', 'Vehicle', 'Expanding the business', 'Technology', 'Nothing planned']}/>
    </Card>
    <ActionBar back="01-0-overview" continueLabel="See my recommendation" onContinue={() => { setSection('package', { status: 'in_progress', progress: { done: 1, total: 2 } }); go('08-2-recommendation') }}/>
  </>
}

function PackageCompareModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, setPackage } = useApp()
  if (!open) return null
  const rows = [['Monthly fee', PACKAGE_PRICES.digital, PACKAGE_PRICES.hybrid, PACKAGE_PRICES.premium], ['Monthly fee reduction', '$0 with eligible card¹', '—', '$0 with $80,000+ balance; $80 with eligible card'], ['Digital transactions', 'Unlimited', '10 digital or assisted', 'Unlimited'], ['Assisted transactions', 'Not included', 'Included in the 10', '100'], ['Cheque deposits', 'Unlimited (ABM, mobile, scanner)', 'Unlimited', 'Unlimited'], ['Interac e-Transfers', '12', '2', 'Unlimited'], ['Cash deposits', 'Not included (fees apply)', 'Not included', 'Included'], ['Clover batch deposits', 'Included', '—', '—']]
  return <Modal title="Compare business packages" className="compare-modal" onClose={onClose} footer={<Button onClick={onClose}>Done</Button>}>
    <p>See what each package includes side by side. You can pick any package.</p>
    <div className="compare-modal-table"><table className="data-table compare-table"><thead><tr><th>Select a package</th>{(['digital', 'hybrid', 'premium'] as const).map((id) => <th key={id} className={chosenPackage(state) === id ? 'selected' : ''}><label className="stack-sm"><input type="radio" name="compare-package" checked={chosenPackage(state) === id} onChange={() => setPackage(id)}/><span>{packageInfo[id][0]}</span>{id === chosenPackage(state) && <Badge tone="primary">Your chosen package</Badge>}</label></th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={index} className={index > 0 && chosenPackage(state) === (['digital', 'hybrid', 'premium'] as const)[index - 1] ? 'selected' : ''}>{cell}</td>)}</tr>)}<tr><td/>{[0, 1, 2].map((index) => <td key={index}><a href="about:blank" target="_blank" rel="noopener">Full details and fees</a></td>)}</tr></tbody></table></div>
    <p className="small muted">Fees as of {'{date}'} · source nbc.ca. Other fees may apply. Partner solutions aren’t included in any package. Nothing is charged now.</p>
  </Modal>
}

export function RecommendationScreen({ hybrid = false }: { hybrid?: boolean }) {
  const { state, set, go, showToast, setSection } = useApp()
  const location = useLocation()
  const variant = new URLSearchParams(location.search).get('v')
  const isHybrid = hybrid || variant === 'suggest-hybrid'
  const suggested = isHybrid ? 'hybrid' : 'digital'
  const [startingName] = packageInfo[state.startingPackage]
  const [manualCompare, setManualCompare] = useState(false)
  useEffect(() => { const open = () => setManualCompare(true); window.addEventListener('dco-compare-packages', open); return () => window.removeEventListener('dco-compare-packages', open) }, [])
  const compareOpen = manualCompare || variant === 'compare'
  const closeCompare = () => { setManualCompare(false); if (variant === 'compare') go('08-2-recommendation') }
  const lead = suggested === state.startingPackage ? `You started with the ${startingName}, and your answers say it still fits. Keep it, or pick another below. You can change it until you sign.` : `You started with the ${startingName}. Your answers suggest the Hybrid Package. Keep it, or pick another below. You can change it until you sign.`
  return <>
    <PageHeader eyebrow="Package and services · Part 2 of 2" title="Here’s a package that may fit your business" lead={lead}/>
    <Card><div className="row-between"><span className="eyebrow">BASED ON YOUR ANSWERS</span><LinkButton onClick={() => go('08-1-needs')}>Change my answers</LinkButton></div><div className="badges">{['6 to 20 employees, paid every 2 weeks', 'Pays suppliers abroad', 'Equipment purchase coming up'].map((item) => <Badge key={item}>{item} <LinkButton aria-label={`Edit ${item}`} onClick={() => go('08-1-needs')}>Edit</LinkButton></Badge>)}</div></Card>
    {isHybrid && <Alert title="Based on your answers, the Hybrid Package may fit better">You said you make about 15 assisted (in-branch) transactions a month. The Digital Package doesn’t include assisted transactions, so fees may apply. The Hybrid Package includes 10 digital or assisted transactions for {PACKAGE_PRICES.hybrid}/month. <LinkButton onClick={() => document.getElementById('package-hybrid')?.scrollIntoView({ block: 'center' })}>Review Hybrid Package</LinkButton></Alert>}
    <PackageSelector recommendation suggested={suggested}/>
    <Card title="Included with every business account" subtitle="Whatever package you choose, you get these at no extra cost."><div className="definition-grid">{['Online banking', 'Mobile banking', 'Bill payments', 'Government remittances', 'Mobile cheque deposit', 'Interac e-Transfer Autodeposit', 'Unlimited incoming Interac e-Transfers'].map((item) => <span key={item}><Check className="text-success" size={16}/> {item}</span>)}</div></Card>
    <Card><div className="row-between"><div><h2>Need more advanced capabilities?</h2><p className="small muted">Direct deposit and payroll, scanner deposit, electronic funds transfer (EFT), pre-authorized debit (PAD), wire transfers, foreign exchange, and treasury and cash management.</p></div><Button variant="secondary" onClick={() => document.getElementById('package-premium')?.scrollIntoView({ block: 'center' })}>See the Premium Package</Button></div></Card>
    {bool(state.data.payrollOptIn) && <Card><div className="row-between"><h2>Optional solutions from our partners</h2><Badge tone="outline">Not part of your package</Badge></div><p className="small muted">Because you’d like to learn about payroll solutions. Nothing is set up now, and these have their own terms and fees.</p>{[['partnerPayments', 'Payment solutions by {Partner}', 'Accept debit and credit cards in store and online.'], ['partnerPayroll', 'Payroll services by {Partner}', 'Pay employees and send government remittances on time.']].map(([key, title, body]) => <div className="row-between" key={key}><div><strong>{title}</strong><p className="small muted">{body}</p></div><Checkbox checked={bool(state.data[key])} onChange={(value) => set(key, value)} label="Have an advisor tell me more"/></div>)}</Card>}
    <div className="panel row-between"><div><strong>Not sure this is the right fit?</strong><p className="small">A business banking specialist can help you choose. We’ll call you within {ADVISOR_CALLBACK}.</p></div><LinkButton onClick={() => { set('requestCall', true); showToast(`A specialist will call you within ${ADVISOR_CALLBACK}`) }}>Request a call</LinkButton></div>
    {bool(state.data.requestCall) && <Alert tone="success">A business banking specialist will call you within {ADVISOR_CALLBACK}.</Alert>}
    <Alert title="What happens next">Nothing is charged now. Fees start after approval and you can change package later.</Alert>
    <ActionBar back="08-1-needs" continueLabel="Finish Package and services" onContinue={() => { setSection('package', { status: 'complete' }); go('01-0-overview') }}/>
    <PackageCompareModal open={compareOpen} onClose={closeCompare}/>
  </>
}

export function CompareScreen() {
  const {state,setPackage,go}=useApp(); const [name,fee]=packageInfo[chosenPackage(state)]
  const rows=[['Monthly fee','$7','$10','$100'],['Monthly fee reduction','$0 with eligible card¹','—','$0 with $80,000+ balance; $80 with eligible card'],['Digital transactions','Unlimited','10 digital or assisted','Unlimited'],['Assisted transactions','Not included','Included in the 10','100'],['Cheque deposits','Unlimited (ABM, mobile, scanner)','Unlimited','Unlimited'],['Interac e-Transfers','12','2','Unlimited'],['Cash deposits','Not included (fees apply)','Not included','Included'],['Clover batch deposits','Included','—','—']]
  return <><PageHeader eyebrow="Package and services · Part 2 of 2" title="Compare business packages" lead="See what each package includes side by side. Your recommended package is selected, but you can pick any of them."/><Card style={{overflowX:'auto'}}><table className="data-table compare-table"><thead><tr><th>Select a package</th>{(['digital','hybrid','premium'] as const).map(id=><th key={id} className={chosenPackage(state)===id?'selected':''}><label className="stack-sm"><input type="radio" name="compare-package" checked={chosenPackage(state)===id} onChange={()=>setPackage(id)}/><span>{packageInfo[id][0]}</span>{id===chosenPackage(state)&&<Badge tone="primary">Your chosen package</Badge>}</label></th>)}</tr></thead><tbody>{rows.map(row=><tr key={row[0]}>{row.map((cell,i)=><td key={i} className={i>0&&chosenPackage(state)===(['digital','hybrid','premium'] as const)[i-1]?'selected':''}>{cell}</td>)}</tr>)}<tr><td/>{[0,1,2].map(i=><td key={i}><a href="about:blank" target="_blank" rel="noopener">Full details and fees</a></td>)}</tr></tbody></table></Card><p className="small muted">Fees as of {'{date}'} · source nbc.ca. Other fees may apply. Partner solutions aren’t included in any package. Nothing is charged now. Fees start after approval and you can change package later.</p><ActionBar back="08-2-recommendation" continueLabel={`Continue with ${name} – ${fee}/month`} onContinue={()=>go('09-1-review')}/></>
}

export function ReviewScreen({ dependency = false, failed = false }: { dependency?: boolean; failed?: boolean }) {
  const { state, go } = useApp()
  const location = useLocation()
  const locked = reviewLocked(state)
  void dependency
  useEffect(() => { if (location.hash === '#sign') document.getElementById('sign')?.scrollIntoView() }, [location.hash])
  if (locked) return <><PageHeader eyebrow="Review and sign" title="Review and sign is locked" lead="Complete all five sections and fix anything that needs attention before you review and sign."/><Alert tone="warning" title="Locked">{sectionStatus(state, 'review').reason}</Alert><Button variant="secondary" onClick={() => go('01-0-overview')}>Back to application overview</Button></>
  return <>
    <PageHeader eyebrow="Review and sign · 1 page" title="Review and sign" lead="Check your answers, then sign at the bottom of this page. To fix something, select Edit. You’ll come straight back here."/>
    <ReviewCards/>
    <div id="sign"><AgreementForm embedded failed={failed}/></div>
  </>
}

export function EditBusinessScreen() {
  const {state,set,go}=useApp()
  const [showNumber,setShowNumber]=useState(false)
  const [form,setForm]=useState({
    legalBusinessName:text(state.data.legalBusinessName),
    operatingName:text(state.data.operatingName),
    structure:'Corporation (Québec)',
    industry:'Restaurants (full service)',
    businessAddress:'1250 boul. Saint-Martin O, Laval QC H7S 1M9',
  })
  const update=(key:keyof typeof form,value:string)=>setForm(current=>({...current,[key]:value}))
  const save=()=>{Object.entries(form).forEach(([key,value])=>set(key,value));go(form.industry==='Bakeries and pastry shops'?'09-1-review':'09-3-review-dependency',form.industry==='Bakeries and pastry shops'?'default':'dependency')}
  return <><PageHeader eyebrow="Review and submit · Editing" title="Edit business information" lead="Make your changes, then save. You’ll go straight back to the review page."/><Card><div className="form-row"><Field label="Legal name" value={form.legalBusinessName} onChange={v=>update('legalBusinessName',v)}/><Field label="Operating name (optional)" value={form.operatingName} onChange={v=>update('operatingName',v)}/></div><div className="form-row"><SelectField label="Business structure" value={form.structure} onChange={v=>update('structure',v)} options={['Corporation (Québec)','Partnership','Sole proprietorship']}/><Field label="Business number" value={showNumber?'117 123 789':'*** *** 789'} onChange={()=>{}} readOnly trailing={<LinkButton onClick={()=>setShowNumber(!showNumber)}>{showNumber?'Hide':'Show'}</LinkButton>}/></div><Field label="Industry" value={form.industry} onChange={v=>update('industry',v)} helper="Start typing and choose the closest match."/><Alert>Changing your industry can change the questions we need to ask. If it does, we’ll show you what to update when you return to the review page.</Alert><Field label="Business address" value={form.businessAddress} onChange={v=>update('businessAddress',v)}/></Card><div className="action-bar"><Button variant="secondary" onClick={()=>go('09-1-review')}>Cancel</Button><Button onClick={save}>Save and return to review</Button></div></>
}

export function SubmittedScreen() {
  const { go, state } = useApp()
  const otherSigners = state.people.filter((person) => person.signer && !person.primary)
  const submittedAt = state.submitted?.at ? new Date(state.submitted.at).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' }) : 'May 12, 2025 at 11:20 a.m. ET'
  return <>
    <span className="icon-circle success large"><Check size={32}/></span>
    <PageHeader title="Your part is done, Marie" lead={otherSigners.length ? `We received the application for ${state.legalName}. Our review starts once Luc Gagnon verifies his identity and signs.` : `We received the application for ${state.legalName}. Our review starts now.`}/>
    <Card className="status-card"><p><Mail size={16}/> We’ve emailed a confirmation to {text(state.data.email)}.</p><p><Bell size={16}/> We’ll email you and update your dashboard at each stage.</p><p><Clock3 size={16}/> Typical review: {REVIEW_TIME} after everyone signs. We’ll only contact you if we need more information.</p></Card>
    <Card className="application-summary"><div className="summary-heading"><span className="muted">Business account application</span><div className="row-between"><h2>{state.legalName}</h2><Badge tone={otherSigners.length ? 'warning' : 'tint'}>{otherSigners.length ? 'Waiting for another signer' : 'Ready for review'}</Badge></div></div>{otherSigners.length > 0 && <p>Your application is on hold until every authorized signer completes their part.</p>}<hr className="divider"/><DefinitionGrid items={[["Reference", state.reference], ["Submitted on", submittedAt], ["Product", packageInfo[chosenPackage(state)][0]]]}/></Card>
    {otherSigners.length > 0 && <Card title="What Luc needs to do" subtitle="We emailed Luc a secure link that’s unique to him."><ol className="number-list">{[
      ['Consent', 'Allow us to collect, use and verify his information.'],
      ['Confirm your details', 'Check what Marie entered and add the details only he can give.'],
      ['Verify your identity', 'Use valid government-issued photo ID, like a driver’s licence or passport.'],
      ['Review and sign', 'Accept the account agreement electronically.'],
    ].map(([title, body], index) => <li key={title}><span className="number-circle">{index + 1}</span><div><strong>{title}</strong><p className="small muted">{body}</p></div></li>)}</ol></Card>}
    <Alert>You can no longer change your answers online. If something is wrong, call us at {PHONE} and give your reference number.</Alert>
    <div className="row"><Button onClick={() => go('10-1-status-waiting-signer')}>See application status<ArrowRight size={16}/></Button><a href="https://www.nbc.ca/en/business/accounts.html">Go to nbc.ca</a></div>
  </>
}

export { AgreementForm }
