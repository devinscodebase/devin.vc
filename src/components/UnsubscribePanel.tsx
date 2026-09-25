import { useEffect, useState } from 'react';

type View =
  | { kind: 'loading' }
  | { kind: 'confirm'; email: string; token: string }
  | { kind: 'done' }
  | { kind: 'invalid' }
  | { kind: 'failed' };

export default function UnsubscribePanel() {
  const [view, setView] = useState<View>({ kind: 'loading' });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const email = params.get('e');
    const token = params.get('t');
    if (status === 'done') setView({ kind: 'done' });
    else if (status === 'failed') setView({ kind: 'failed' });
    else if (email && token) setView({ kind: 'confirm', email, token });
    else setView({ kind: 'invalid' });
  }, []);

  if (view.kind === 'loading') return null;

  if (view.kind === 'confirm') {
    return (
      <div className="section_head text-center motion-fade-up">
        <h1 className="text-h2">Unsubscribe?</h1>
        <p className="section_lead text-body-lg max-w-measure-sm mx-auto">
          You'll stop getting emails at <strong className="font-semibold text-ink">{view.email}</strong>, including the one
          when the course opens.
        </p>
        <form className="button-group justify-center" action="/api/unsubscribe" method="post">
          <input type="hidden" name="e" value={view.email} />
          <input type="hidden" name="t" value={view.token} />
          <button className="button is-hero" type="submit">Unsubscribe</button>
          <a className="button is-hero is-secondary" href="/">Keep me on the list</a>
        </form>
      </div>
    );
  }

  const copy = {
    done: {
      title: "You're unsubscribed.",
      body: "You won't get any more emails from me. If you change your mind, you can join the waitlist again on the home page.",
    },
    invalid: {
      title: "This link doesn't work.",
      body: 'It may be incomplete. Email me@devin.vc and I will remove you by hand.',
    },
    failed: {
      title: "That didn't go through.",
      body: 'Try the link again in a minute, or email me@devin.vc and I will remove you by hand.',
    },
  }[view.kind];

  return (
    <div className="section_head text-center motion-fade-up">
      <h1 className="text-h2">{copy.title}</h1>
      <p className="section_lead text-body-lg max-w-measure-sm mx-auto">{copy.body}</p>
      <div className="button-group justify-center">
        <a className="button is-hero is-secondary" href="/">Back to devin.vc</a>
      </div>
    </div>
  );
}
