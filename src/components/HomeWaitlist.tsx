import { useEffect, useRef, useState, type CSSProperties } from 'react';

import WaitlistForm from './WaitlistForm';

type Phase = 'form' | 'leaving' | 'joined';

export default function HomeWaitlist() {
  const [phase, setPhase] = useState<Phase>('form');
  const [email, setEmail] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (phase === 'joined') headingRef.current?.focus({ preventScroll: true });
  }, [phase]);

  function onJoined(joinedEmail: string) {
    setEmail(joinedEmail);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPhase(reduced ? 'joined' : 'leaving');
  }

  if (phase === 'joined') {
    return (
      <div className="section_head text-center" role="status">
        <h1 className="text-h3 sm:text-h2 md:text-h1 motion-fade-up focus-visible:outline-none focus-visible:shadow-none" ref={headingRef} tabIndex={-1}>
          You're on the list.
        </h1>
        <p className="section_lead text-body-lg md:text-h4 font-body font-normal tracking-normal leading-normal text-balance max-w-sm mx-auto motion-fade-up" style={{ '--m-delay': '120ms' } as CSSProperties}>
          A confirmation is on its way to{' '}
          <em className="highlight is-swept is-revealed [overflow-wrap:anywhere]" style={{ '--m-delay': '520ms' } as CSSProperties}>{email}</em>.
          {' '}You'll be first to know when the course opens.
        </p>
      </div>
    );
  }

  return (
    <div
      className={phase === 'leaving' ? 'motion-leave-up' : undefined}
      onAnimationEnd={(event) => {
        if (phase === 'leaving' && event.target === event.currentTarget) setPhase('joined');
      }}
    >
      <div className="section_head text-center">
        <h1 className="text-h3 sm:text-h2 md:text-h1 motion-fade-up">Master the entire marketing subject.</h1>
        <p className="section_lead text-body-md md:text-body-lg max-w-measure-sm mx-auto motion-fade-up" style={{ '--m-delay': '90ms' } as CSSProperties}>
          A marketing course for CEOs, owners, and aspiring marketers. Learn the theory behind professional marketing, and
          how to apply it to your own work.
        </p>
      </div>
      <div className="section_body mt-large md:mt-xlarge motion-fade-up" style={{ '--m-delay': '180ms' } as CSSProperties}>
        <WaitlistForm onJoined={onJoined} />
      </div>
    </div>
  );
}
