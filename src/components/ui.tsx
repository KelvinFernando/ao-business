import { useEffect, useId, useRef, type ChangeEvent, type ReactNode } from 'react'
import { AlertCircle, Check, CircleAlert, CircleCheck, Clock3, CloudUpload, FileText, Info, LoaderCircle, Minus, Plus, Save, TriangleAlert, X } from 'lucide-react'
import { useApp, type Status } from '../state/AppState'

export function Button({ children, variant = 'primary', small = false, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary'; small?: boolean }) {
  return <button className={`btn ${variant} ${small ? 'small' : ''} ${className}`} {...props}>{children}</button>
}

export function LinkButton({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={`link ${className}`} {...props}>{children}</button>
}

export function Badge({ children, tone = '', className = '' }: { children: ReactNode; tone?: string; className?: string }) {
  return <span className={`badge ${tone} ${className}`}>{children}</span>
}

const statusWord = (status: Status, waitingOn?: string[]) => status === 'not_started' ? 'Not started' : status === 'in_progress' ? 'In progress' : status === 'needs_attention' ? 'Needs attention' : status === 'waiting' ? `Waiting for ${waitingOn?.[0] ?? 'someone'}` : status === 'locked' ? 'Locked' : 'Complete'

export function StatusIcon({ status }: { status: Status }) {
  const content = status === 'complete' ? <><circle cx="12" cy="12" r="12" fill="var(--color-success)"/><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></> : status === 'in_progress' ? <><circle cx="12" cy="12" r="11" fill="#FFFFFF" stroke="var(--color-primary)" strokeWidth="2"/><path d="M12 4a8 8 0 0 1 0 16z" fill="var(--color-primary)"/></> : status === 'needs_attention' ? <><path d="M12 2.5L22.5 21h-21z" fill="var(--color-warning)"/><path d="M12 9v5M12 17v.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/></> : status === 'waiting' ? <><circle cx="12" cy="12" r="11" fill="#FFFFFF" stroke="var(--color-primary)" strokeWidth="2"/><path d="M12 11v6M12 7.5v.5" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round"/></> : status === 'locked' ? <><circle cx="12" cy="12" r="11.5" fill="var(--color-grey050)" stroke="var(--color-grey300)"/><rect x="8" y="11" width="8" height="6.5" rx="1" fill="var(--color-grey600)"/><path d="M10 11V9.5a2 2 0 0 1 4 0V11" fill="none" stroke="var(--color-grey600)" strokeWidth="1.4"/></> : <circle cx="12" cy="12" r="11" fill="#FFFFFF" stroke="var(--color-grey300)" strokeWidth="2"/>
  return <svg className="status-icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">{content}</svg>
}

export function StatusLine({ status, reason, waitingOn, ready = false }: { status: Status; reason?: string; waitingOn?: string[]; ready?: boolean }) {
  return <span className={`status-line status-${status}`}>{ready && status === 'complete' ? 'Ready' : statusWord(status, waitingOn)}{reason ? ` · ${reason}` : ''}</span>
}

export function RailItem({ label, status, reason, waitingOn, current = false, connector = false, ready = false, onClick, substeps = [] }: { label: string; status: Status; reason?: string; waitingOn?: string[]; current?: boolean; connector?: boolean; ready?: boolean; onClick?: () => void; substeps?: { label: string; current: boolean }[] }) {
  return <li className={`rail-item ${current ? 'current' : ''}`}>
    <div className="step-indicator-col"><StatusIcon status={status}/>{connector && <span className={`step-connector ${status === 'complete' ? 'done' : ''}`}/>}</div>
    <div className="rail-item-content">
      {onClick ? <button type="button" className="rail-label" aria-current={current ? 'step' : undefined} onClick={onClick}>{label}</button> : <span className="rail-label" aria-current={current ? 'step' : undefined}>{label}</span>}
      <StatusLine status={status} reason={reason} waitingOn={waitingOn} ready={ready}/>
      {current && substeps.length > 0 && <ol className="substeps">{substeps.map((substep) => <li key={substep.label} className={substep.current ? 'current' : ''}>{substep.label}</li>)}</ol>}
    </div>
  </li>
}

export function NextStepCard({ title, description, buttonLabel, onClick }: { title: string; description: string; buttonLabel: string; onClick: () => void }) {
  return <Card className="next-step-card"><div className="next-step-copy"><p className="eyebrow">YOUR NEXT STEP</p><h2>{title}</h2><p className="small muted">{description}</p></div><Button onClick={onClick}>{buttonLabel}</Button></Card>
}

export function AttentionRow({ title, reason, status, waitingOn, buttonLabel, onClick }: { title: string; reason: string; status: Status; waitingOn?: string[]; buttonLabel: string; onClick: () => void }) {
  return <Card className="attention-row"><div className="attention-row-main"><StatusIcon status={status}/><div><h3>{title}</h3><p className="small muted">{reason}</p><span className="sr-only">{statusWord(status, waitingOn)}</span></div></div><Button variant="secondary" onClick={onClick}>{buttonLabel}</Button></Card>
}

export function WhoNeedsToAct({ rows }: { rows: { name: string; description: string; action: string }[] }) {
  return <Card className="who-act-card" title="Who needs to act">{rows.map((row, index) => <div className={`who-act-row ${index > 0 ? 'separated' : ''}`} key={row.name}><div><strong>{row.name}</strong><p className="small muted">{row.description}</p></div><span className="small">{row.action}</span></div>)}</Card>
}

export function Card({ children, className = '', title, subtitle, ...props }: React.HTMLAttributes<HTMLElement> & { children: ReactNode; title?: string; subtitle?: string }) {
  return <section className={`card ${className}`} {...props}>
    {(title || subtitle) && <div className="stack-sm">{title && <h2 className="card-title">{title}</h2>}{subtitle && <p className="card-subtitle">{subtitle}</p>}</div>}
    {children}
  </section>
}

export function Alert({ children, title, tone = 'info', icon }: { children: ReactNode; title?: string; tone?: 'info' | 'success' | 'warning' | 'error'; icon?: ReactNode }) {
  const defaultIcon = tone === 'success' ? <CircleCheck size={24} /> : tone === 'warning' ? <TriangleAlert size={24} /> : tone === 'error' ? <CircleAlert size={24} /> : <Info size={24} />
  return <div className={`alert ${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
    <span aria-hidden="true">{icon ?? defaultIcon}</span>
    <div className="alert-content">{title && <p className="alert-title">{title}</p>}<div className="alert-body">{children}</div></div>
  </div>
}

export function ErrorSummary({ title = 'There’s 1 thing to fix', items }: { title?: string; items: { id: string; label: string }[] }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { ref.current?.focus() }, [])
  return <div ref={ref} tabIndex={-1} className="error-summary" role="alert" aria-labelledby="error-summary-title">
    <CircleAlert size={24} color="var(--color-error)" aria-hidden="true" />
    <div><h2 id="error-summary-title" style={{fontFamily:'var(--font-body)',fontSize:16,lineHeight:'24px',fontWeight:700}}>{title}</h2>
      <ul>{items.map((item) => <li key={item.id}><a href={`#${item.id}`} onClick={(event) => { event.preventDefault(); document.getElementById(item.id)?.focus(); document.getElementById(item.id)?.scrollIntoView({block:'center'}) }}>{item.label}</a></li>)}</ul>
    </div>
  </div>
}

interface FieldProps {
  id?: string
  label: string
  value: string | number
  onChange?: (value: string) => void
  onBlur?: () => void
  helper?: ReactNode
  helperPosition?: 'before' | 'after'
  error?: string
  type?: string
  placeholder?: string
  readOnly?: boolean
  required?: boolean
  autoComplete?: string
  inputMode?: 'text' | 'numeric' | 'tel' | 'email' | 'url' | 'search' | 'decimal' | 'none'
  width?: 'full' | 'w480' | 'w360' | 'w320' | 'w296' | 'w240' | 'w200' | 'w160' | 'w120'
  maxLength?: number
  prefix?: string
  suffix?: string
  trailing?: ReactNode
}

export function Field({ id: providedId, label, value, onChange, onBlur, helper, helperPosition = 'before', error, type = 'text', placeholder, readOnly, autoComplete, inputMode, width = 'w480', maxLength, prefix, suffix, trailing }: FieldProps) {
  const generated = useId()
  const id = providedId ?? generated
  const describedBy = [helper ? `${id}-helper` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined
  const control = <input id={id} className={`input ${error ? 'error' : ''}`} type={type} value={value} onChange={(event) => onChange?.(event.target.value)} onBlur={onBlur} placeholder={placeholder} readOnly={readOnly} autoComplete={autoComplete} inputMode={inputMode} maxLength={maxLength} aria-invalid={!!error} aria-describedby={describedBy} />
  return <div className={`field ${width}`}>
    <label className="field-label" htmlFor={id}>{label}</label>
    {helper && helperPosition === 'before' && <div className="helper" id={`${id}-helper`}>{helper}</div>}
    {error && <div className="field-error" id={`${id}-error`}><AlertCircle size={16} aria-hidden="true" /><span>{error}</span></div>}
    {prefix ? <div className="input-prefix"><span className="prefix">{prefix}</span>{control}</div> : suffix ? <div className="input-suffix">{control}<span className="suffix">{suffix}</span></div> : trailing ? <div style={{position:'relative'}}>{control}<div style={{position:'absolute',right:12,top:10}}>{trailing}</div></div> : control}
    {helper && helperPosition === 'after' && <div className="helper" id={`${id}-helper`}>{helper}</div>}
  </div>
}

export function SelectField({ id: providedId, label, value, onChange, options, helper, error, width = 'w296', placeholder }: { id?: string; label: string; value: string; onChange: (value: string) => void; options: string[]; helper?: ReactNode; error?: string; width?: FieldProps['width']; placeholder?: string }) {
  const generated = useId(); const id = providedId ?? generated
  return <div className={`field ${width}`}><label className="field-label" htmlFor={id}>{label}</label>{helper && <div className="helper">{helper}</div>}{error && <div className="field-error"><AlertCircle size={16}/>{error}</div>}<select id={id} className={`select ${error ? 'error' : ''}`} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={!!error}>{placeholder && <option value="">{placeholder}</option>}{options.map((option) => <option key={option}>{option}</option>)}</select></div>
}

export function TextareaField({ id: providedId, label, value, onChange, helper, maxLength = 500, error }: { id?: string; label: string; value: string; onChange: (value: string) => void; helper?: string; maxLength?: number; error?: string }) {
  const generated = useId(); const id = providedId ?? generated
  return <div className="field full"><label className="field-label" htmlFor={id}>{label}</label>{helper && <p className="helper">{helper}</p>}{error && <p className="field-error"><AlertCircle size={16}/>{error}</p>}<textarea id={id} className={`textarea ${error ? 'error' : ''}`} maxLength={maxLength} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={!!error}/><div className="counter" aria-live="polite">{value.length} of {maxLength} characters</div></div>
}

export function Checkbox({ id: providedId, checked, onChange, label, helper, error, boxed = false }: { id?: string; checked: boolean; onChange: (checked: boolean) => void; label: ReactNode; helper?: ReactNode; error?: string; boxed?: boolean }) {
  const generated = useId(); const id = providedId ?? generated
  return <div className="stack-sm" style={{gap:8}}>
    <label className={`checkbox-row ${boxed ? 'boxed-check' : ''}`} htmlFor={id}><input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} aria-invalid={!!error}/><span className="checkbox-box"><Check size={15} strokeWidth={2.5}/></span><span>{label}</span></label>
    {helper && <div className="helper" style={{paddingLeft:36}}>{helper}</div>}
    {error && <div className="field-error" style={{paddingLeft:36}}><AlertCircle size={16}/>{error}</div>}
  </div>
}

export function RadioRow({ name, value, checked, onChange, label }: { name: string; value: string; checked: boolean; onChange: (value: string) => void; label: string }) {
  const id = useId()
  return <label className="radio-row" htmlFor={id}><input id={id} type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)}/><span className="radio-dot"/><span>{label}</span></label>
}

function ChoiceCheck() {
  return <svg width="12" height="10" viewBox="0 0 12 10" aria-hidden="true"><path d="M1 5l3.5 3.5L11 1.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
}

export function ChoiceTiles({ name, value, onChange, options, columns = 2, type = 'radio', disabledOptions = [] }: { name: string; value: string | string[]; onChange: (value: string) => void; options: (string | { label: string; description?: string; value?: string })[]; columns?: 1 | 2 | 3 | 4; type?: 'radio' | 'checkbox'; disabledOptions?: string[] }) {
  const groupId = useId()
  return <div className={`choice-grid ${columns === 4 ? 'four' : columns === 3 ? 'three' : columns === 1 ? 'single' : ''}`} role={type === 'radio' ? 'radiogroup' : 'group'} aria-label={name}>
    {options.map((raw, index) => {
      const option = typeof raw === 'string' ? { label: raw, value: raw } : { ...raw, value: raw.value ?? raw.label }
      const checked = Array.isArray(value) ? value.includes(option.value) : value === option.value
      const disabled = disabledOptions.includes(option.value)
      const id = `${groupId}-${index}`
      return <label key={option.value} className={`choice-tile ${disabled ? 'disabled' : ''}`} htmlFor={id}>
        <input id={id} type={type} name={name} value={option.value} checked={checked} disabled={disabled} onChange={() => onChange(option.value)}/>
        {option.description ? <><span className="choice-tile-title">{type === 'radio' ? <span className="radio-dot"/> : <span className="checkbox-box"><ChoiceCheck/></span>}<span className="choice-title">{option.label}</span></span><span className="choice-description">{option.description}</span></> : <>{type === 'radio' ? <span className="radio-dot"/> : <span className="checkbox-box"><ChoiceCheck/></span>}<span className="stack-sm" style={{gap:4}}><span className="choice-title">{option.label}</span></span></>}
      </label>
    })}
  </div>
}

export function YesNo({ name, value, onChange, compact = false, options = ['Yes','No'], error }: { name: string; value?: string; onChange: (value: string) => void; compact?: boolean; options?: string[]; error?: string }) {
  return <div className="stack-sm" style={{gap:8}}><div className={`yesno ${compact ? 'compact' : ''}`} role="radiogroup" aria-label={name}>
    {options.map((option) => <label key={option} className="choice-tile"><input type="radio" name={name} value={option} checked={value === option} onChange={() => onChange(option)}/><span className="radio-dot"/><span className="choice-title">{option}</span></label>)}
  </div>{error && <div className="field-error"><AlertCircle size={16}/>{error}</div>}</div>
}

export function NumberStepper({ value, onChange, min = 1, max = 99, label }: { value: number; onChange: (value: number) => void; min?: number; max?: number; label: string }) {
  return <div className="number-stepper"><button type="button" aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => onChange(Math.max(min,value-1))}><Minus size={18}/></button><input aria-label={label} type="number" inputMode="numeric" value={value} min={min} max={max} onChange={(event) => onChange(Math.max(min,Math.min(max,Number(event.target.value) || min)))}/><button type="button" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(Math.min(max,value+1))}><Plus size={18}/></button></div>
}

export function DateField({ label, day, month, year, onDay, onMonth, onYear, yearOptional = false }: { label: string; day: string; month: string; year?: string; onDay: (value: string) => void; onMonth: (value: string) => void; onYear?: (value: string) => void; yearOptional?: boolean }) {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return <fieldset className="field full"><legend className="field-label">{label}</legend><div className="date-row"><div className="date-part"><span>Day</span><input className="input" aria-label={`${label} day`} style={{width:64}} inputMode="numeric" maxLength={2} value={day} onChange={(e) => onDay(e.target.value)}/></div><div className="date-part"><span>Month</span><select className="select" aria-label={`${label} month`} style={{width:148}} value={month} onChange={(e) => onMonth(e.target.value)}>{months.map((m) => <option key={m}>{m}</option>)}</select></div>{!yearOptional && <div className="date-part"><span>Year</span><input className="input" aria-label={`${label} year`} style={{width:96}} inputMode="numeric" maxLength={4} value={year} onChange={(e) => onYear?.(e.target.value)}/></div>}</div></fieldset>
}

export function ActionBar({ back, continueLabel = 'Continue', onContinue, save = true, hideBack = false, backLabel = 'Back', continueVariant = 'primary', busy = false }: { back?: string | (() => void); continueLabel?: string; onContinue?: () => void; save?: boolean; hideBack?: boolean; backLabel?: string; continueVariant?: 'primary' | 'secondary'; busy?: boolean }) {
  const { go, saveExit } = useApp()
  return <div className="action-bar"><div>{!hideBack && back && <Button variant="secondary" onClick={() => typeof back === 'string' ? go(back) : back()}>{backLabel}</Button>}</div><div className="action-group">{save && <button type="button" className="save-link" onClick={saveExit}><Save size={16}/>Save and finish later</button>}{onContinue && <Button variant={continueVariant} onClick={onContinue} disabled={busy} aria-busy={busy}>{busy && <LoaderCircle className="spinner" size={20}/>} {busy ? 'Saving…' : continueLabel}</Button>}</div></div>
}

export function OtpInput({ value, onChange, error, label = 'Verification code' }: { value: string; onChange: (value: string) => void; error?: string; label?: string }) {
  const id = useId(); const ref = useRef<HTMLInputElement>(null)
  const digits = Array.from({length:6},(_,index) => value[index] ?? '')
  return <div className="field full"><label htmlFor={id} className="field-label">{label}</label>{error && <div className="field-error"><AlertCircle size={16}/>{error}</div>}<div className={`otp-wrap ${error ? 'error' : ''}`} onClick={() => ref.current?.focus()}><input ref={ref} id={id} className="otp-input" autoComplete="one-time-code" inputMode="numeric" maxLength={6} value={value} onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value.replace(/\D/g,'').slice(0,6))} aria-invalid={!!error}/><div className="otp-boxes" aria-hidden="true">{digits.map((digit,index) => <span key={index} className={`otp-box ${value.length === index ? 'active' : ''}`}>{digit}</span>)}</div></div></div>
}

export function UploadDrop({ title = 'Drag and drop a file here', onUpload, error }: { title?: string; onUpload: (file?: File) => void; error?: boolean }) {
  const input = useRef<HTMLInputElement>(null)
  return <div className={`upload-drop ${error ? 'error' : ''}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); onUpload(event.dataTransfer.files[0]) }}><CloudUpload size={40} color="var(--color-primary)"/><div className="grow"><strong>{title}</strong><p className="helper">PDF, JPG or PNG, up to 10 MB</p></div><Button variant="secondary" small onClick={() => input.current?.click()}>Browse files</Button><input ref={input} className="sr-only" type="file" aria-label="Upload document" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => onUpload(event.target.files?.[0])}/></div>
}

export function FileRow({ name, state = 'done', progress = 64, onRemove, onRetry }: { name: string; state?: 'done' | 'uploading' | 'error'; progress?: number; onRemove?: () => void; onRetry?: () => void }) {
  return <div className={`file-row ${state === 'error' ? 'error' : ''}`} aria-live="polite">{state === 'done' ? <span className="icon-circle success" style={{width:32,height:32,flexBasis:32}}><Check size={18}/></span> : state === 'error' ? <CircleAlert size={32} color="var(--color-error)"/> : <FileText size={32} color="var(--color-grey600)"/>}<div className="grow stack-sm" style={{gap:6}}><strong className="small">{name}</strong>{state === 'done' && <span className="xsmall muted">Uploaded · 1.8 MB</span>}{state === 'uploading' && <><div className="file-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><div style={{width:`${progress}%`}}/></div><span className="xsmall muted">Uploading… {progress}%</span></>}{state === 'error' && <span className="xsmall text-error">This file type isn’t supported. Upload a PDF, JPG or PNG.</span>}</div>{state === 'done' && <div className="row"><LinkButton onClick={() => window.open('about:blank','_blank','noopener')}>View</LinkButton><LinkButton onClick={onRetry}>Replace</LinkButton><LinkButton onClick={onRemove}>Remove</LinkButton></div>}{state === 'uploading' && <LinkButton onClick={onRemove}>Cancel</LinkButton>}{state === 'error' && <LinkButton onClick={onRetry}>Choose another file</LinkButton>}</div>
}

export function QRCode() {
  return <div className="qr" role="img" aria-label="QR code to continue identity verification on your phone">{Array.from({length:121},(_,i) => <i key={i} style={{opacity: ((i * 17 + i % 7 * 13) % 5 < 2 || i < 20 || i > 100) ? 1 : 0}}/>)}</div>
}

export type TrackerMode = 'waiting' | 'action' | 'review' | 'approved' | 'declined' | 'submitted'
export function StatusTracker({ mode = 'waiting', title = 'Your application', compact = false }: { mode?: TrackerMode; title?: string; compact?: boolean }) {
  const active = mode === 'waiting' || mode === 'submitted' ? 2 : mode === 'approved' || mode === 'declined' ? 4 : 3
  const stages = ['Application submitted','Primary applicant completed','Signers to complete','Under review','Final decision']
  return <Card className={`status-tracker ${mode}`} title={title} subtitle={mode === 'submitted' ? 'Application status: waiting for signers to complete their information.' : undefined}><ol className="status-list">{stages.map((stage,index) => {
    const done = index < active || mode === 'approved' || (mode === 'declined' && index < 4)
    const current = index === active && mode !== 'approved' && mode !== 'declined'
    const declined = mode === 'declined' && index === 4
    const approved = mode === 'approved' && index === 4
    const status = approved ? 'Decided {date}' : declined ? 'Not approved' : done ? compact && mode === 'approved' ? 'Completed {date}' : mode === 'submitted' ? 'Complete' : 'Completed' : current ? mode === 'submitted' ? '1 left' : mode === 'action' ? 'Paused · waiting for you' : mode === 'waiting' ? 'In progress · 1 of 2 done' : 'In progress' : 'Not started'
    const details = [
      'Submitted {date} at 11:20 · Marie Tremblay',
      'Completed {date} at 11:20 · Marie Tremblay',
      done ? 'Completed {date} · Marie Tremblay and Luc Gagnon signed' : 'Waiting for Luc Gagnon — nothing needed from you',
      mode === 'action' ? 'Waiting for you — send {document requested} by {date}' : done ? 'Completed {date} · reviewed by NBC' : current ? 'NBC is reviewing — no action needed from you' : 'Starts when everyone has signed. Usually {N}–{N} business days.',
      approved ? 'Decided {date}' : declined ? 'Decided {date} · see “What you can do next” above' : 'We’ll email you and update this page.',
    ][index]
    return <li key={stage} className={`status-stage ${done || approved ? 'done' : ''} ${current ? 'current' : ''} ${!done && !current && !declined && !approved ? 'muted-stage' : ''}`} aria-current={current ? 'step' : undefined}><div className="status-stage-icon"><span className={`icon-circle ${done || approved ? 'success' : current && mode !== 'review' ? 'waiting-current' : !done && !current && !declined && !approved ? 'pending' : ''}`} style={{width:28,height:28,flexBasis:28,background: declined ? 'var(--color-grey600)' : undefined,color: declined ? 'var(--color-white)' : undefined}}>{done || approved ? <Check size={17}/> : current ? mode === 'action' ? <AlertCircle size={17}/> : <Clock3 size={17}/> : declined ? <X size={16}/> : null}</span></div><div className="status-stage-content"><div className="row-between"><span className="status-stage-title">{approved && index === 4 ? 'Final decision · Approved' : stage}</span><span className={`status-stage-state ${approved || done ? 'completed' : declined ? 'declined' : !current ? 'muted' : ''}`}>{status}</span></div>{(!compact || current) && <div className="status-stage-details">{!compact && <p className={`small ${current && mode === 'waiting' ? 'status-current-primary' : 'muted'}`}>{details}</p>}{current && mode !== 'submitted' && <p className="small muted">Usually {'{N}'}–{'{N}'} business days{mode === 'waiting' ? ' · his invitation expires {date}' : ''}</p>}</div>}{mode === 'waiting' && index === 2 && <div className="panel signer-panel"><div className="row-between"><span>Marie Tremblay (you)<br/><span className="xsmall muted">Primary applicant · Signed {'{date}'}</span></span><span className="signer-status-complete"><Check size={16}/>Completed</span></div><hr className="divider"/><div className="row-between"><span>Luc Gagnon<br/><span className="xsmall muted">Owner, 40% · Invited {'{date}'}</span></span><Badge tone="warning">Waiting for Luc</Badge></div></div>}</div></li>
  })}</ol></Card>
}

export function Modal({ title, children, footer, onClose }: { title: string; children: ReactNode; footer?: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    ref.current?.focus()
    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab' && ref.current) {
        const items = [...ref.current.querySelectorAll<HTMLElement>('button,a,input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter((item) => !item.hasAttribute('disabled'))
        if (!items.length) return
        const first = items[0], last = items[items.length-1]
        if (document.activeElement === ref.current || !ref.current.contains(document.activeElement)) { event.preventDefault(); (event.shiftKey ? last : first).focus() }
        else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown',listener)
    return () => { document.removeEventListener('keydown',listener); previous?.focus() }
  }, [onClose])
  return <div className="modal-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><div ref={ref} className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1}><div className="modal-header"><h2 id="modal-title">{title}</h2><button className="icon-button" aria-label="Close" onClick={onClose}><X size={20}/></button></div><div className="modal-body">{children}</div>{footer && <div className="modal-footer">{footer}</div>}</div></div>
}
