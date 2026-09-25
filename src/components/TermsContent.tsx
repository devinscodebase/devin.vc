import LegalShell from './LegalShell';

const effective = 'September 24, 2026';

export default function TermsContent() {
  return (
    <LegalShell id="terms" title="Terms of Use" lead={<>Effective {effective}</>}>
      <h2 className="text-h4">1. Acceptance</h2>
      <p className="text-body">
        These terms govern your use of devin.vc, operated by Devin
        Alexander ("we", "us"). By using the website, you agree to
        them. If you do not agree, do not use the website.
      </p>

      <h2 className="text-h4">2. The waitlist</h2>
      <p className="text-body">
        Joining the waitlist is free and creates no obligation to buy.
        You must use an email address you own. You may leave the
        waitlist at any time by unsubscribing or emailing us.
      </p>

      <h2 className="text-h4">3. Educational content</h2>
      <p className="text-body">
        The content on this website is general marketing education. It
        is not professional advice for your business. We do not
        guarantee any result from using it, and you are responsible for
        your own decisions.
      </p>

      <h2 className="text-h4">4. Course purchases</h2>
      <p className="text-body">
        The course is not yet available for purchase. Pricing, access,
        and refund terms will be published before sales open and will
        apply to each purchase.
      </p>

      <h2 className="text-h4">5. Intellectual property</h2>
      <p className="text-body">
        All content on this website, including text, design, images,
        and course material, is owned by Devin Alexander. You may quote
        short excerpts with a link to the source. Any other copying,
        distribution, or commercial use requires our written
        permission.
      </p>

      <h2 className="text-h4">6. Acceptable use</h2>
      <p className="text-body">
        You may not submit another person's email address, create
        signups by automated means, scrape the website, or interfere
        with its operation.
      </p>

      <h2 className="text-h4">7. Disclaimer</h2>
      <p className="text-body">
        The website is provided "as is" and "as available", without
        warranties of any kind.
      </p>

      <h2 className="text-h4">8. Limitation of liability</h2>
      <p className="text-body">
        To the extent permitted by law, we are not liable for any
        indirect, incidental, or consequential damages arising from
        your use of the website or its unavailability.
      </p>

      <h2 className="text-h4">9. Changes</h2>
      <p className="text-body">
        We may update these terms. The effective date at the top shows
        when they last changed. Continued use of the website after a
        change means you accept the updated terms.
      </p>

      <h2 className="text-h4">10. Contact</h2>
      <p className="text-body">
        Questions about these terms go to{' '}
        <a className="text-link" href="mailto:me@devin.vc">me@devin.vc</a>.
      </p>
    </LegalShell>
  );
}
