export type ShellKind = 'pre' | 'flow' | 'status' | 'signer' | 'prepare' | 'email' | 'overlay'
export type Persona = 'applicant' | 'signer'

export interface ScreenDef {
  id: string
  code: string
  title: string
  group: string
  paper: string
  shell: ShellKind
  step?: number
  signerStep?: number
  width?: 560 | 640 | 880
  baseId?: string
  variant: string
  concept?: boolean
}

const P = 'https://app.paper.design/file/01M5K2CTDSQRYB21MG46D07SWK'
const s = (id: string, code: string, title: string, group: string, page: string, node: string, shell: ShellKind, options: Partial<ScreenDef> = {}): ScreenDef => ({
  id, code, title, group, paper: `${P}/${page}/${node}`, shell, variant: 'default', ...options,
})

export const screens: ScreenDef[] = [
  s('01-0-overview','C1','Application overview','01 Application overview','p-14-0','Y6W-0','flow'),
  s('02-0-start','02.0','Start','02 Entry & pre-qualification','p-14-0','XN5-0','pre',{width:640}),
  s('02-0b-package','02.0b','Choose your package','02 Entry & pre-qualification','p-8-0','R4D-0','pre',{width:640}),
  s('02-1-prequal','02.1','Pre-qualification questions','02 Entry & pre-qualification','p-8-0','4GB-0','flow',{width:880}),
  s('02-2-eligible','02.2','Eligible','02 Entry & pre-qualification','p-14-0','XPU-0','flow',{width:640}),
  s('02-3-assistance','02.3','Assistance required','02 Entry & pre-qualification','p-8-0','4P4-0','flow',{width:640}),
  s('02-4-not-supported','02.4','Not supported online','02 Entry & pre-qualification','p-8-0','4R8-0','flow',{width:640}),
  s('02-5-about-you','02.5','About you','02 Entry & pre-qualification','p-8-0','D1H-0','flow',{width:640}),
  s('02-6-verify-phone','02.6','Verify your phone','02 Entry & pre-qualification','p-8-0','D3L-0','flow',{width:560}),
  s('02-7-verify-phone-wrong-code','02.7','Wrong code','02 Entry & pre-qualification','p-8-0','D5P-0','flow',{width:560,baseId:'02-6-verify-phone',variant:'wrong'}),
  s('03-1-prepare','03.1','Before you start','03 Prepare & consent','p-14-0','XV1-0','prepare'),
  s('03-2-consent','03.2','Before you start','03 Prepare & consent','p-14-0','XV1-0','flow'),
  s('04-0-find-business','04.0','Find your business','04 Business information','p-B-0','MKN-0','flow',{step:2,baseId:'04-1-business-details',variant:'concept-find',concept:true}),
  s('04-1-business-details','04.1','Business details','04 Business information','p-14-0','Z2V-0','flow',{step:2}),
  s('04-2-address','04.2','Address lookup','04 Business information','p-B-0','AAG-0','flow',{step:2,baseId:'04-1-business-details',variant:'address-lookup'}),
  s('04-3-address-manual','04.3','Manual address, postal code error','04 Business information','p-B-0','AF4-0','flow',{step:2,baseId:'04-2-address',variant:'manual-error'}),
  s('04-4-industry','04.4','Industry and employees','04 Business information','p-B-0','AJS-0','flow',{step:2}),
  s('04-5-documents','04.5','Documents','04 Business information','p-B-0','AOG-0','flow',{step:2}),
  s('04-6-documents-error','04.6','Documents: missing required','04 Business information','p-B-0','AY7-0','flow',{step:2,baseId:'04-5-documents',variant:'missing-error'}),
  s('08-1-needs','08.1','Business needs','08 Package','p-14-0','YI2-0','flow',{step:6}),
  s('08-1b-use-case-opener','08.1b','Use-case opener','08 Package','p-E-0','M57-0','flow',{step:6,baseId:'08-1-needs',variant:'concept-use-case',concept:true}),
  s('08-2-recommendation','08.2','Your package','08 Package','p-14-0','YPC-0','flow',{step:6}),
  s('08-2b-suggest-hybrid','08.2b','Answers suggest Hybrid','08 Package','p-14-0','YPC-0','flow',{step:6,baseId:'08-2-recommendation',variant:'suggest-hybrid'}),
  s('08-3-compare','08.3','Compare packages','08 Package','p-14-0','YPC-0','flow',{step:6,baseId:'08-2-recommendation',variant:'compare'}),
  s('05-1-people-under','05.1','Owners and signers: under 100%','05 Owners & signers','p-14-0','ZC2-0','flow',{step:3}),
  s('05-1-people-exact','05.1','Exactly 100%','05 Owners & signers','p-14-0','ZC2-0','flow',{step:3,baseId:'05-1-people-under',variant:'exact'}),
  s('05-1-people-over','05.1','Over 100% error','05 Owners & signers','p-14-0','ZC2-0','flow',{step:3,baseId:'05-1-people-under',variant:'over'}),
  s('05-2-person','05.2','Add or edit person','05 Owners & signers','p-D-0','1AQ-0','flow',{step:3}),
  s('05-3-signing','05.3','Signing requirements','05 Owners & signers','p-D-0','FXA-0','flow',{step:3}),
  s('06-0-personal-info','06.0','Your personal information','06 Personal & identity','p-14-0','ZKN-0','flow',{step:4}),
  s('06-1-idv-get-ready','06.1','Verify your identity','06 Personal & identity','p-9-0','8UE-0','flow',{step:4}),
  s('06-2-idv-phone-handoff','06.2','Finish on your phone','06 Personal & identity','p-9-0','91L-0','flow',{step:4}),
  s('06-3-idv-checking','06.3','Checking photos','06 Personal & identity','p-9-0','96Q-0','flow',{step:4}),
  s('06-3b-idv-taking-longer','06.3b','Taking longer','06 Personal & identity','p-9-0','E2D-0','flow',{step:4,baseId:'06-3-idv-checking',variant:'longer'}),
  s('06-4-idv-verified','06.4','You’re verified','06 Personal & identity','p-9-0','9B8-0','flow',{step:4}),
  s('06-5-idv-try-again','06.5','Let’s try that again','06 Personal & identity','p-9-0','9FY-0','flow',{step:4}),
  s('06-6-idv-another-way','06.6','Verify another way','06 Personal & identity','p-9-0','9KD-0','flow',{step:4}),
  s('07-1-tax-residency','07.1','Tax and declarations','07 Tax & declarations','p-14-0','ZUL-0','flow',{step:5}),
  s('07-2-declarations','07.2','Two more questions','07 Tax & declarations','p-14-0','ZUL-0','flow',{step:5}),
  s('07-3-declarations-error','07.3','Missing answer error','07 Tax & declarations','p-14-0','ZUL-0','flow',{step:5,baseId:'07-1-tax-residency',variant:'error'}),
  s('07-4-purpose-funds','07.4','Purpose & source of funds','07 Tax & declarations','p-5-0','PTJ-0','flow',{step:5,concept:true}),
  s('09-1-review','09.1','Review and sign','09 Review & submit','p-14-0','105B-0','flow',{step:7}),
  s('09-2-edit-business','09.2','Edit business information','09 Review & submit','p-3-0','2QZ-0','flow',{step:7}),
  s('09-3-review-dependency','09.3','Edit added a question','09 Review & submit','p-3-0','2Z0-0','flow',{step:7,baseId:'09-1-review',variant:'dependency'}),
  s('09-7-change-impact','F2','Change-impact dialog','09 Review & submit','p-14-0','10LA-0','overlay',{baseId:'04-4-industry',variant:'impact'}),
  s('09-6-agreement','09.6','Account agreement','09 Review & submit','p-3-0','H1J-0','flow',{step:7}),
  s('09-5-submit-failed','09.5','Submit failed','09 Review & submit','p-3-0','CMJ-0','flow',{step:7,baseId:'09-1-review',variant:'failed'}),
  s('09-4-submitted','09.4','Application submitted','09 Review & submit','p-14-0','10MR-0','status',{width:640}),
  s('10-1-status-waiting-signer','10.1','Waiting for another signer','10 Application status','p-4-0','7VB-0','status',{width:640}),
  s('10-1b-reminder-sent','10.1b','Reminder sent','10 Application status','p-4-0','EJT-0','status',{width:640,baseId:'10-1-status-waiting-signer',variant:'reminder'}),
  s('10-2-action-required','10.2','Action required from you','10 Application status','p-4-0','81E-0','status',{width:640}),
  s('10-2b-uploading','10.2b','Uploading document','10 Application status','p-4-0','EDE-0','status',{width:640,baseId:'10-2-action-required',variant:'uploading'}),
  s('10-2c-upload-failed','10.2c','Upload failed','10 Application status','p-4-0','NQM-0','status',{width:640,baseId:'10-2-action-required',variant:'failed'}),
  s('10-3-under-review','10.3','In progress with us','10 Application status','p-4-0','84E-0','status',{width:640}),
  s('10-4-account-open','10.4','Account open','10 Application status','p-4-0','87E-0','status',{width:640}),
  s('10-5-not-approved','10.5','Not approved','10 Application status','p-4-0','E7J-0','status',{width:640}),
  s('11-1-invitation-email','11.1','Invitation email','11 Signer journey','p-C-0','5JE-0','email'),
  s('11-1b-not-expecting','11.1b','Not expecting this','11 Signer journey','p-C-0','O0Y-0','status',{width:640}),
  s('11-2-verify-code','11.2','Verify code','11 Signer journey','p-C-0','55Y-0','status',{width:560}),
  s('11-2b-link-expired','11.2b','Link expired','11 Signer journey','p-C-0','O9Z-0','status',{width:560,baseId:'11-2-verify-code',variant:'expired'}),
  s('11-3-signer-overview','11.3','Signer overview','11 Signer journey','p-14-0','10T0-0','status',{width:640}),
  s('11-4-signer-consent','11.4','Signer consent','11 Signer journey','p-C-0','5LE-0','signer',{signerStep:1}),
  s('11-5-signer-personal-info','11.5','Signer personal info','11 Signer journey','p-14-0','10XT-0','signer',{signerStep:2}),
  s('11-6-signer-identity','11.6','Signer identity','11 Signer journey','p-C-0','5VE-0','signer',{signerStep:3}),
  s('11-7-signer-agreement','11.7','Signer agreement','11 Signer journey','p-14-0','115S-0','signer',{signerStep:4}),
  s('11-8-signer-done','11.8','Signer done','11 Signer journey','p-C-0','6IU-0','status',{width:640}),
  s('12-1-leave-dialog','12.1','Leave with unsaved changes','12 System states','p-7-0','1NM-0','overlay'),
  s('12-2-application-saved','12.2','Application saved','12 System states','p-7-0','1WO-0','status',{width:640}),
  s('12-7-help-panel','12.7','Help panel','12 System states','p-7-0','OUK-0','overlay'),
  s('12-9-resume-welcome-back','12.9','Welcome back','12 System states','p-7-0','PAN-0','status',{width:640}),
]

export const screenById = Object.fromEntries(screens.map((screen) => [screen.id, screen])) as Record<string, ScreenDef>
export const screenGroups = [...new Set(screens.map((screen) => screen.group))]
export const variantsFor = (screen: ScreenDef) => {
  const base = screen.baseId ?? screen.id
  return screens.filter((candidate) => candidate.id === base || candidate.baseId === base)
}
export const personaFor = (screen: ScreenDef): Persona => screen.group.startsWith('11') ? 'signer' : 'applicant'
export const nextRoute = (current: ScreenDef, direction: 1 | -1) => {
  const index = screens.findIndex((screen) => screen.id === current.id)
  return screens[(index + direction + screens.length) % screens.length]
}
