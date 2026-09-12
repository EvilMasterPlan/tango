import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import '@/pages/Legal/Legal.scss';

export function LegalTermsPage() {
  return (
    <>
      <Helmet>
        <title>Tango Tanuki - Terms of Service</title>
      </Helmet>
      <div className="legal-page">
        <div className="legal-page__inner">
          <Link to="/" className="legal-page__home-link">
            ← Back to Tango Tanuki
          </Link>
          <h1 className="legal-page__title">Tango Tanuki Terms of Service</h1>
          <p className="legal-page__updated">Last updated: September 11, 2026</p>

          <h2>Introduction</h2>
          <p>
            Welcome to Tango Tanuki (the "Service"). Tango Tanuki is a product provided by Overmind Labs
            ("Company", "we", "our", "us").
          </p>
          <p>
            These Terms of Service ("Terms", "Terms of Service") govern your use of our web pages located at
            https://evilmasterplan.github.io/tango operated by us.
          </p>
          <p>
            Our Privacy Policy also governs your use of our Service and explains how we collect, safeguard
            and disclose information that results from your use of our web pages. Please read it{' '}
            <Link to="/legal/privacy">here</Link>.
          </p>
          <p>
            Your agreement with us includes these Terms and our Privacy Policy ("Agreements"). You
            acknowledge that you have read and understood the Agreements, and agree to be bound by them.
          </p>
          <p>
            If you do not agree with (or cannot comply with) the Agreements, then you may not use the
            Service, but please let us know by emailing martin@evilmasterplan.net so we can try to find a
            solution. These Terms apply to all visitors, users and others who wish to access or use the
            Service.
          </p>

          <h2>Communications</h2>
          <p>
            By creating an Account on our Service, you agree to subscribe to newsletters, marketing or
            promotional materials and other information we may send. However, you may opt out of receiving
            any, or all, of these communications from us by following the unsubscribe link or by emailing
            martin@evilmasterplan.net.
          </p>

          <h2>Purchases</h2>
          <p>
            If you wish to purchase any product or service made available through the Service ("Purchase"),
            you may be asked to supply certain information relevant to your Purchase including, without
            limitation, your credit card number, the expiration date of your credit card, your billing
            address, and your shipping information.
          </p>
          <p>
            You represent and warrant that: (i) you have the legal right to use any credit card(s) or other
            payment method(s) in connection with any Purchase; and that (ii) the information you supply to
            us is true, correct and complete.
          </p>
          <p>
            We may employ the use of third party services for the purpose of facilitating payment and the
            completion of Purchases. By submitting your information, you grant us the right to provide the
            information to these third parties subject to our Privacy Policy.
          </p>
          <p>
            We reserve the right to refuse or cancel your order at any time for reasons including but not
            limited to: product or service availability, errors in the description or price of the product
            or service, error in your order, or suspected fraud or unauthorized or illegal transactions.
          </p>

          <h2>Subscriptions</h2>
          <p>
            Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be
            billed in advance on a recurring and periodic basis ("Billing Cycle"). Billing cycles are set
            either on a monthly or annual basis, depending on the type of subscription plan you select when
            purchasing a Subscription.
          </p>
          <p>
            At the end of each Billing Cycle, your Subscription will automatically renew under the exact
            same conditions unless you cancel it or Tango Tanuki cancels it. You may cancel your Subscription
            renewal either through your online account management page or by contacting us.
          </p>
          <p>
            A valid payment method, including credit card, is required to process the payment for your
            subscription. You shall provide us with accurate and complete billing information including full
            name, address, state, zip code, telephone number, and a valid payment method. By submitting such
            payment information, you automatically authorize us to charge all Subscription fees incurred
            through your account to any such payment instruments.
          </p>
          <p>
            Should automatic billing fail to occur for any reason, we will issue an electronic invoice
            indicating that you must proceed manually, within a certain deadline date, with the full payment
            corresponding to the billing period as indicated on the invoice.
          </p>

          <h2>Free Trial</h2>
          <p>Tango Tanuki may, at its sole discretion, offer a Subscription with a free trial for a limited period of time ("Free Trial").</p>
          <p>You may be required to enter your billing information in order to sign up for a Free Trial.</p>
          <p>
            If you do enter your billing information when signing up for a Free Trial, you will not be
            charged until the Free Trial has expired. On the last day of the Free Trial period, unless you
            cancelled your Subscription, you will be automatically charged the applicable Subscription fees
            for the type of Subscription you have selected.
          </p>
          <p>At any time and without notice, we reserve the right to (i) modify the Terms of Service of a Free Trial offer, or (ii) cancel such a Free Trial offer.</p>

          <h2>Fee Changes</h2>
          <p>We, in our sole discretion and at any time, may modify Subscription fees for the Subscriptions. Any Subscription fee change will become effective at the end of the then-current Billing Cycle.</p>
          <p>We will provide you with reasonable prior notice of any change in Subscription fees to give you an opportunity to terminate your Subscription before such change becomes effective.</p>
          <p>Your continued use of the Service after a Subscription fee change comes into effect constitutes your agreement to pay the modified Subscription fee amount.</p>

          <h2>Refunds</h2>
          <p>Except when required by law, paid Subscription fees are non-refundable.</p>

          <h2>Content</h2>
          <p>
            Our Service allows you to post, link, store, share and otherwise make available certain
            information, text, or other material ("Content"). You are responsible for Content that you post
            on or through the Service, including its legality, reliability, and appropriateness.
          </p>
          <p>
            By posting Content on or through the Service, you represent and warrant that: (i) the Content is
            yours (you own it) and/or you have the right to use it and the right to grant us the rights and
            license as provided in these Terms, and (ii) the posting of your Content on or through the
            Service does not violate the privacy rights, publicity rights, copyrights, contract rights or
            any other rights of any person or entity. We reserve the right to terminate the account of anyone
            found to be infringing on a copyright.
          </p>
          <p>
            You retain any and all of your rights to any Content you submit, post or display on or through
            the Service and you are responsible for protecting those rights. However, by posting Content
            using the Service you grant us the right and license to use, modify, publicly perform, publicly
            display, reproduce, and distribute such Content on and through the Service.
          </p>
          <p>Tango Tanuki has the right but not the obligation to monitor and edit all Content provided by users.</p>

          <h2>Prohibited Uses</h2>
          <p>You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service:</p>
          <ul>
            <li>In any way that violates any applicable national or international law or regulation.</li>
            <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way by exposing them to inappropriate content or otherwise.</li>
            <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," "spam," or any other similar solicitation.</li>
            <li>To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity.</li>
            <li>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful, or in connection with any unlawful, illegal, fraudulent, or harmful purpose or activity.</li>
            <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which, as determined by us, may harm or offend the Company or users of the Service or expose them to liability.</li>
          </ul>
          <p>Additionally, you agree not to:</p>
          <ul>
            <li>Use the Service in any manner that could disable, overburden, damage, or impair the Service or interfere with any other party's use of the Service.</li>
            <li>Use any robot, spider, crawler, or other automatic device, process, or means to access the Service for any purpose, including monitoring or copying any of the material on the Service.</li>
            <li>Use any manual process to monitor or copy any of the material on the Service or for any other unauthorized purpose without our prior written consent.</li>
            <li>Use any device, software, or routine that interferes with the proper working of the Service.</li>
            <li>Introduce any viruses, trojan horses, worms, logic bombs, or other material which is malicious or technologically harmful.</li>
            <li>Attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Service, the server on which the Service is stored, or any server, computer, or database connected to the Service.</li>
            <li>Attack the Service via a denial-of-service attack or a distributed denial-of-service attack.</li>
            <li>Otherwise attempt to interfere with the proper working of the Service.</li>
          </ul>

          <h2>Accounts</h2>
          <p>
            When you create an account with us, you guarantee that the information you provide us is
            accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may
            result in the immediate termination of your account on the Service. If you are under the age of
            18, you represent that you have your parent or legal guardian's permission to use the Service and
            that they have read and agree to these Terms on your behalf.
          </p>
          <p>
            You are responsible for maintaining the confidentiality of your account and password, including
            but not limited to the restriction of access to your computer and/or account. You agree to
            accept responsibility for any and all activities or actions that occur under your account and/or
            password. You must notify us immediately upon becoming aware of any breach of security or
            unauthorized use of your account.
          </p>
          <p>We reserve the right to refuse service, terminate accounts, remove or edit content, or cancel orders in our sole discretion.</p>

          <h2>Intellectual Property</h2>
          <p>
            The Service and its original content (excluding Content provided by users), features and
            functionality are and will remain the exclusive property of Tango Tanuki and Overmind Labs and
            its licensors. The Service is protected by copyright, trademark, and other laws of the United
            States. Our trademarks and trade dress may not be used in connection with any product or service
            without the prior written consent of Overmind Labs.
          </p>

          <h2>Copyright Policy</h2>
          <p>
            We respect the intellectual property rights of others. It is our policy to respond to any claim
            that Content posted on the Service infringes on the copyright or other intellectual property
            rights ("Infringement") of any person or entity.
          </p>
          <p>
            If you are a copyright owner, or authorized on behalf of one, and you believe that the
            copyrighted work has been copied in a way that constitutes copyright infringement, please submit
            your claim via email to martin@evilmasterplan.net, with the subject line "Copyright Infringement"
            and include in your claim a detailed description of the alleged Infringement as detailed below,
            under "DMCA Notice and Procedure for Copyright Infringement Claims."
          </p>
          <p>You may be held accountable for damages (including costs and attorneys' fees) for misrepresentation or bad-faith claims of infringement on any Content found on and/or through the Service.</p>

          <h2>DMCA Notice and Procedure for Copyright Infringement Claims</h2>
          <p>You may submit a notification pursuant to the Digital Millennium Copyright Act (DMCA) by providing our Copyright Agent with the following information in writing (see 17 U.S.C 512(c)(3) for further detail):</p>
          <ul>
            <li>an electronic or physical signature of the person authorized to act on behalf of the owner of the copyright's interest;</li>
            <li>a description of the copyrighted work that you claim has been infringed, including the URL (i.e., web page address) of the location where the copyrighted work exists or a copy of the copyrighted work;</li>
            <li>identification of the URL or other specific location on the Service where the material that you claim is infringing is located;</li>
            <li>your address, telephone number, and email address;</li>
            <li>a statement by you that you have a good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law;</li>
            <li>a statement by you, made under penalty of perjury, that the above information in your notice is accurate and that you are the copyright owner or authorized to act on the copyright owner's behalf.</li>
          </ul>
          <p>You can contact our Copyright Agent via email at martin@evilmasterplan.net.</p>

          <h2>Error Reporting and Feedback</h2>
          <p>
            You may provide us either directly at martin@evilmasterplan.net or via third party sites and
            tools with information and feedback concerning errors, suggestions for improvements, ideas,
            problems, complaints, and other matters related to our Service ("Feedback"). You acknowledge and
            agree that: (i) you shall not retain, acquire or assert any intellectual property right or other
            right, title or interest in or to the Feedback; (ii) the Company may have development ideas
            similar to the Feedback; (iii) Feedback does not contain confidential information or proprietary
            information from you or any third party; and (iv) the Company is not under any obligation of
            confidentiality with respect to the Feedback.
          </p>

          <h2>Links To Other Web Sites</h2>
          <p>Our Service may contain links to third party web sites or services that are not owned or controlled by Tango Tanuki or Overmind Labs.</p>
          <p>Overmind Labs has no control over, and assumes no responsibility for the content, privacy policies, or practices of any third party web sites or services. We do not warrant the offerings of any of these entities/individuals or their websites.</p>
          <p>
            YOU ACKNOWLEDGE AND AGREE THAT OVERMIND LABS SHALL NOT BE RESPONSIBLE OR LIABLE, DIRECTLY OR
            INDIRECTLY, FOR ANY DAMAGE OR LOSS CAUSED OR ALLEGED TO BE CAUSED BY OR IN CONNECTION WITH USE OF
            OR RELIANCE ON ANY SUCH CONTENT, GOODS OR SERVICES AVAILABLE ON OR THROUGH ANY SUCH THIRD PARTY
            WEB SITES OR SERVICES. WE STRONGLY ADVISE YOU TO READ THE TERMS OF SERVICE AND PRIVACY POLICIES OF
            ANY THIRD PARTY WEB SITES OR SERVICES THAT YOU VISIT.
          </p>

          <h2>Disclaimer Of Warranty</h2>
          <p>
            THE SERVICE IS PROVIDED BY THE COMPANY ON AN "AS IS" AND "AS AVAILABLE" BASIS. THE COMPANY MAKES
            NO REPRESENTATIONS OR WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, AS TO THE OPERATION OF THE
            SERVICE, OR THE INFORMATION, CONTENT OR MATERIALS INCLUDED THEREIN. YOU EXPRESSLY AGREE THAT YOUR
            USE OF THE SERVICE, ITS CONTENT, AND ANY SERVICES OR ITEMS OBTAINED FROM US IS AT YOUR SOLE RISK.
            THE COMPANY DISCLAIMS ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, STATUTORY, OR
            OTHERWISE, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF MERCHANTABILITY, NON-INFRINGEMENT, AND
            FITNESS FOR A PARTICULAR PURPOSE. THE FOREGOING DOES NOT AFFECT ANY WARRANTIES WHICH CANNOT BE
            EXCLUDED OR LIMITED UNDER APPLICABLE LAW.
          </p>

          <h2>Limitation Of Liability</h2>
          <p>
            EXCEPT AS PROHIBITED BY LAW, YOU WILL HOLD US AND OUR OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS
            HARMLESS FOR ANY INDIRECT, PUNITIVE, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGE, HOWEVER IT
            ARISES, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE, OR OTHER TORTIOUS ACTION, OR ARISING OUT OF
            OR IN CONNECTION WITH THIS AGREEMENT. EXCEPT AS PROHIBITED BY LAW, IF THERE IS LIABILITY FOUND ON
            THE PART OF THE COMPANY, IT WILL BE LIMITED TO THE AMOUNT PAID FOR THE PRODUCTS AND/OR SERVICES,
            AND UNDER NO CIRCUMSTANCES WILL THERE BE CONSEQUENTIAL OR PUNITIVE DAMAGES. SOME STATES DO NOT
            ALLOW THE EXCLUSION OR LIMITATION OF PUNITIVE, INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THE PRIOR
            LIMITATION OR EXCLUSION MAY NOT APPLY TO YOU.
          </p>

          <h2>Termination</h2>
          <p>We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of these Terms.</p>
          <p>If you wish to terminate your account, you may simply discontinue using the Service.</p>
          <p>All provisions of these Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of liability.</p>

          <h2>Governing Law</h2>
          <p>These Terms shall be governed and construed in accordance with the laws of the State of Washington without regard to its conflict of law provisions.</p>
          <p>
            Our failure to enforce any right or provision of these Terms will not be considered a waiver of
            those rights. If any provision of these Terms is held to be invalid or unenforceable by a court,
            the remaining provisions of these Terms will remain in effect. These Terms constitute the entire
            agreement between us regarding our Service and supersede and replace any prior agreements we
            might have had between us regarding the Service.
          </p>

          <h2>Changes To Service</h2>
          <p>We reserve the right to withdraw or amend our Service, and any service or material we provide via the Service, in our sole discretion without notice. We will not be liable if for any reason all or any part of the Service is unavailable at any time or for any period.</p>

          <h2>Amendments To Terms</h2>
          <p>We may amend these Terms at any time by posting the amended terms on this site. It is your responsibility to review these Terms periodically.</p>
          <p>Your continued use of the Service following the posting of revised Terms means that you accept and agree to the changes. You are expected to check this page frequently so you are aware of any changes, as they are binding on you.</p>

          <h2>Waiver And Severability</h2>
          <p>No waiver by the Company of any term or condition set forth in these Terms shall be deemed a further or continuing waiver of such term or condition or a waiver of any other term or condition, and any failure of the Company to assert a right or provision under these Terms shall not constitute a waiver of such right or provision.</p>
          <p>If any provision of these Terms is held by a court or other tribunal of competent jurisdiction to be invalid, illegal or unenforceable for any reason, such provision shall be eliminated or limited to the minimum extent such that the remaining provisions of these Terms will continue in full force and effect.</p>

          <h2>Acknowledgement</h2>
          <p>BY USING THE SERVICE OR OTHER SERVICES PROVIDED BY US, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE AND AGREE TO BE BOUND BY THEM.</p>

          <h2>Contact Us</h2>
          <p>Please send your feedback, comments, and requests for technical support:</p>
          <ul>
            <li>By email: martin@evilmasterplan.net</li>
          </ul>
        </div>
      </div>
    </>
  );
}
