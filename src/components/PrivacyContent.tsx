import LegalShell from './LegalShell';

const effective = 'September 24, 2026';

const providers = [
  { name: 'Neon', purpose: 'Database hosting for the waitlist', data: 'Email address, signup time' },
  { name: 'Resend', purpose: 'Email delivery', data: 'Email address' },
  { name: 'Cloudflare', purpose: 'Website hosting', data: 'Server logs' },
  { name: 'Google Analytics', purpose: 'Website analytics', data: 'Analytics information' },
  { name: 'PostHog', purpose: 'Website analytics and session recording', data: 'Analytics information, session recordings, email address if you join the waitlist' },
];

export default function PrivacyContent() {
  return (
    <LegalShell id="privacy" title="Privacy Policy" lead={<>Effective {effective}</>}>
      <h2 className="text-h4">1. Who we are</h2>
      <p className="text-body">
        devin.vc is operated by Devin Alexander ("we", "us"). We are
        responsible for the personal data described in this policy.
        You can contact us at{' '}
        <a className="text-link" href="mailto:me@devin.vc">me@devin.vc</a>.
      </p>

      <h2 className="text-h4">2. Information we collect</h2>
      <ul className="list text-body">
        <li>
          <strong>Waitlist information.</strong> Your email address, the
          date and time you joined, and your agreement to this policy.
        </li>
        <li>
          <strong>Analytics information.</strong> If you accept analytics
          cookies: pages viewed, the referring website, device type,
          browser, approximate location derived from your IP address,
          and interactions such as clicks and scrolling. PostHog also
          records sessions, a replay of how you moved through the
          pages, with text you type into form fields masked. If you
          join the waitlist after accepting, PostHog links your email
          address to this information. Analytics does not run unless
          you accept.
        </li>
        <li>
          <strong>Server logs.</strong> Our hosting provider records the
          IP address, requested page, and time of each request.
        </li>
      </ul>

      <h2 className="text-h4">3. How we use it</h2>
      <ul className="list text-body">
        <li>To confirm your waitlist signup and to email you about the course.</li>
        <li>To understand how visitors use the website and improve it.</li>
        <li>To keep the website secure and running.</li>
      </ul>

      <h2 className="text-h4">4. Legal basis</h2>
      <p className="text-body">
        We process waitlist and analytics information with your
        consent. We process server logs on the basis of our legitimate
        interest in operating a secure website.
      </p>

      <h2 className="text-h4">5. Service providers</h2>
      <p className="text-body">
        We share personal data only with the providers below, who
        process it on our behalf. We do not sell personal data.
      </p>
      <div className="table_wrapper">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Provider</th>
              <th scope="col">Purpose</th>
              <th scope="col">Data</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((provider) => (
              <tr key={provider.name}>
                <td>{provider.name}</td>
                <td>{provider.purpose}</td>
                <td>{provider.data}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-h4">6. International transfers</h2>
      <p className="text-body">
        Our providers may process data in the United States and other
        countries. Where required, these transfers rely on the
        safeguards the providers offer, such as the European
        Commission's Standard Contractual Clauses.
      </p>

      <h2 className="text-h4">7. Retention</h2>
      <p className="text-body">
        We keep your waitlist information until you unsubscribe or ask
        us to delete it. Analytics information and server logs are
        kept for the retention periods set in each provider's service.
      </p>

      <h2 className="text-h4">8. Your rights</h2>
      <p className="text-body">
        You may request access to, correction of, or deletion of your
        personal data, restrict or object to its processing, and
        receive a copy of it. You may withdraw consent at any time.
        Withdrawal does not affect processing that took place before
        it. To make a request, email{' '}
        <a className="text-link" href="mailto:me@devin.vc">me@devin.vc</a>.
        You also have the right to complain to your local data
        protection authority.
      </p>

      <h2 className="text-h4">9. Children</h2>
      <p className="text-body">
        This website is not directed to anyone under 16. We do not
        knowingly collect personal data from children.
      </p>

      <h2 className="text-h4">10. Changes</h2>
      <p className="text-body">
        We may update this policy. The effective date at the top shows
        when it last changed.
      </p>

      <h2 className="text-h4">11. Contact</h2>
      <p className="text-body">
        Questions about this policy go to{' '}
        <a className="text-link" href="mailto:me@devin.vc">me@devin.vc</a>.
        Our cookie use is described in the{' '}
        <a className="text-link" href="/cookies">Cookie Policy</a>.
      </p>
    </LegalShell>
  );
}
