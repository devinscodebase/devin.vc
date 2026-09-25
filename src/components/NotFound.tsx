import iconSmileyInTrouble from '../icons/freehand/smiley-in-trouble.svg?raw';
import iconArrowRight from '../icons/freehand/arrow-right.svg?raw';

export default function NotFound() {
  return (
    <section className="section_layout" id="not-found">
      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-large">
            <div className="empty max-w-measure-sm mx-auto text-center">
              <span className="icon" style={{ width: '2em', height: '2em' }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconSmileyInTrouble }} />
              <h1 className="text-h4 mt-medium">This page doesn't exist.</h1>
              <p className="text-small text-ink-muted mt-xsmall">
                The link may be old, or typed wrong. Nothing on this site links here.
              </p>
              <a className="button mt-medium" href="/">
                Back to the homepage <span className="icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconArrowRight }} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
