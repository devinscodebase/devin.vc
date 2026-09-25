import LegalShell from './LegalShell';

const effective = 'September 24, 2026';

const cookies = [
  { name: '_ga', provider: 'Google Analytics', purpose: 'Distinguishes visitors', duration: '2 years' },
  { name: '_ga_<id>', provider: 'Google Analytics', purpose: 'Maintains session state', duration: '2 years' },
  { name: 'ph_<key>_posthog', provider: 'PostHog', purpose: 'Distinguishes visitors and sessions', duration: '1 year' },
];

const storage = [
  { name: 'devin-vc-consent', purpose: 'Records your cookie choice' },
  { name: 'devin-vc-theme', purpose: 'Records your light or dark mode choice' },
];

export default function CookiesContent() {
  return (
    <LegalShell id="cookies" title="Cookie Policy" lead={<>Effective {effective}</>}>
      <h2 className="text-h4">1. What cookies are</h2>
      <p className="text-body">
        Cookies are small text files a website stores in your browser.
      </p>

      <h2 className="text-h4">2. How we use cookies</h2>
      <p className="text-body">
        We use cookies for analytics only, and only after you accept
        them in the cookie notice. We do not use advertising cookies.
        If you decline, no cookies are set.
      </p>

      <h2 className="text-h4">3. Cookies we use</h2>
      <div className="table_wrapper">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Provider</th>
              <th scope="col">Purpose</th>
              <th scope="col">Duration</th>
            </tr>
          </thead>
          <tbody>
            {cookies.map((cookie) => (
              <tr key={cookie.name}>
                <td><code>{cookie.name}</code></td>
                <td>{cookie.provider}</td>
                <td>{cookie.purpose}</td>
                <td>{cookie.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-h4">4. Local storage</h2>
      <p className="text-body">
        We also store two preferences in your browser's local storage.
        They are not cookies and are not sent to us.
      </p>
      <div className="table_wrapper">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Purpose</th>
            </tr>
          </thead>
          <tbody>
            {storage.map((item) => (
              <tr key={item.name}>
                <td><code>{item.name}</code></td>
                <td>{item.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-h4">5. Managing cookies</h2>
      <p className="text-body">
        You choose whether to accept analytics cookies on your first
        visit. To change your choice, clear this website's data in your
        browser and the notice will appear again. You can also block
        cookies in your browser settings, or install{' '}
        <a className="text-link" href="https://tools.google.com/dlpage/gaoptout">Google's opt-out add-on</a>{' '}
        to stop Google Analytics on every site.
      </p>

      <h2 className="text-h4">6. Changes</h2>
      <p className="text-body">
        We may update this policy. The effective date at the top shows
        when it last changed.
      </p>

      <h2 className="text-h4">7. Contact</h2>
      <p className="text-body">
        Questions about this policy go to{' '}
        <a className="text-link" href="mailto:me@devin.vc">me@devin.vc</a>.
        How we handle personal data is described in the{' '}
        <a className="text-link" href="/privacy">Privacy Policy</a>.
      </p>
    </LegalShell>
  );
}
