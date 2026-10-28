import type { ScreenDef } from '../flow/registry'
import { AboutYouScreen, AssistanceScreen, BeforeYouApplyScreen, EligibleScreen, NotSupportedScreen, PackageScreen, PhoneScreen, PrepareScreen, PrequalScreen, StartScreen } from './Entry'
import { AddressScreen, BusinessDetailsScreen, DocumentsScreen, FindBusinessScreen, IndustryScreen, PeopleScreen, PersonScreen, SigningScreen } from './Business'
import { DeclarationsScreen, IdvAnotherWayScreen, IdvCheckingScreen, IdvHandoffScreen, IdvReadyScreen, IdvRetryScreen, IdvVerifiedScreen, PersonalInfoScreen, PurposeFundsScreen, TaxResidencyScreen } from './IdentityTax'
import { AgreementForm, CompareScreen, EditBusinessScreen, NeedsScreen, RecommendationScreen, ReviewScreen, SubmittedScreen } from './PackageReview'
import { OverviewScreen } from './Overview'
import { ConsentForm } from './shared'
import { ActionStatusScreen, ApprovedStatusScreen, DeclinedStatusScreen, ExpiredLinkScreen, InvitationEmailScreen, NotExpectingScreen, ResumeScreen, ReviewStatusScreen, SavedScreen, SignerDoneScreen, SignerOverviewScreen, WaitingStatusScreen } from './StatusSigner'

export function ScreenRenderer({ screen }: { screen: ScreenDef }) {
  switch (screen.id) {
    case '01-0-overview': return <OverviewScreen/>
    case '02-0-start': return <StartScreen/>
    case '02-0b-package': return <PackageScreen/>
    case '02-1-prequal': return <PrequalScreen/>
    case '02-2-eligible': return <EligibleScreen/>
    case '02-3-assistance': return <AssistanceScreen/>
    case '02-4-not-supported': return <NotSupportedScreen/>
    case '02-5-about-you': return <AboutYouScreen/>
    case '02-6-verify-phone': return <PhoneScreen/>
    case '02-7-verify-phone-wrong-code': return <PhoneScreen wrong/>
    case '03-1-prepare': return <PrepareScreen/>
    case '03-2-consent': return <BeforeYouApplyScreen/>
    case '04-0-find-business': return <FindBusinessScreen/>
    case '04-1-business-details': return <BusinessDetailsScreen/>
    case '04-2-address': return <AddressScreen/>
    case '04-3-address-manual': return <AddressScreen manual/>
    case '04-4-industry': return <IndustryScreen/>
    case '04-5-documents': return <DocumentsScreen/>
    case '04-6-documents-error': return <DocumentsScreen missing/>
    case '05-1-people-under': return <PeopleScreen variant="under"/>
    case '05-1-people-exact': return <PeopleScreen variant="exact"/>
    case '05-1-people-over': return <PeopleScreen variant="over"/>
    case '05-2-person': return <PersonScreen/>
    case '05-3-signing': return <SigningScreen/>
    case '06-0-personal-info': return <PersonalInfoScreen/>
    case '06-1-idv-get-ready': return <IdvReadyScreen/>
    case '06-2-idv-phone-handoff': return <IdvHandoffScreen/>
    case '06-3-idv-checking': return <IdvCheckingScreen/>
    case '06-3b-idv-taking-longer': return <IdvCheckingScreen longer/>
    case '06-4-idv-verified': return <IdvVerifiedScreen/>
    case '06-5-idv-try-again': return <IdvRetryScreen/>
    case '06-6-idv-another-way': return <IdvAnotherWayScreen/>
    case '07-1-tax-residency': return <TaxResidencyScreen/>
    case '07-2-declarations': return <DeclarationsScreen key="default"/>
    case '07-3-declarations-error': return <DeclarationsScreen key="error" error/>
    case '07-4-purpose-funds': return <PurposeFundsScreen/>
    case '08-1-needs': return <NeedsScreen/>
    case '08-1b-use-case-opener': return <NeedsScreen concept/>
    case '08-2-recommendation': return <RecommendationScreen/>
    case '08-2b-suggest-hybrid': return <RecommendationScreen hybrid/>
    case '08-3-compare': return <CompareScreen/>
    case '09-1-review': return <ReviewScreen/>
    case '09-2-edit-business': return <EditBusinessScreen/>
    case '09-3-review-dependency': return <ReviewScreen dependency/>
    case '09-7-change-impact': return <IndustryScreen/>
    case '09-6-agreement': return <AgreementForm/>
    case '09-5-submit-failed': return <ReviewScreen dependency failed/>
    case '09-4-submitted': return <SubmittedScreen/>
    case '10-1-status-waiting-signer': return <WaitingStatusScreen/>
    case '10-1b-reminder-sent': return <WaitingStatusScreen reminder/>
    case '10-2-action-required': return <ActionStatusScreen/>
    case '10-2b-uploading': return <ActionStatusScreen variant="uploading"/>
    case '10-2c-upload-failed': return <ActionStatusScreen variant="failed"/>
    case '10-3-under-review': return <ReviewStatusScreen/>
    case '10-4-account-open': return <ApprovedStatusScreen/>
    case '10-5-not-approved': return <DeclinedStatusScreen/>
    case '11-1-invitation-email': return <InvitationEmailScreen/>
    case '11-1b-not-expecting': return <NotExpectingScreen/>
    case '11-2-verify-code': return <PhoneScreen signer/>
    case '11-2b-link-expired': return <ExpiredLinkScreen/>
    case '11-3-signer-overview': return <SignerOverviewScreen/>
    case '11-4-signer-consent': return <ConsentForm signer/>
    case '11-5-signer-personal-info': return <PersonalInfoScreen signer/>
    case '11-6-signer-identity': return <IdvReadyScreen signer/>
    case '11-7-signer-agreement': return <AgreementForm signer/>
    case '11-8-signer-done': return <SignerDoneScreen/>
    case '12-1-leave-dialog': return <PersonScreen/>
    case '12-2-application-saved': return <SavedScreen/>
    case '12-7-help-panel': return <BusinessDetailsScreen/>
    case '12-9-resume-welcome-back': return <ResumeScreen/>
    default: return <StartScreen/>
  }
}
