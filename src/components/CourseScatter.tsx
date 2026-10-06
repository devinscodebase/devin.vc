import type { CSSProperties } from 'react';

import iconResearch from '../icons/freehand/research.svg?raw';
import iconHandshake from '../icons/freehand/handshake.svg?raw';
import iconFunnel from '../icons/freehand/funnel.svg?raw';
import iconBillboard from '../icons/freehand/billboard.svg?raw';
import iconRibbon from '../icons/freehand/ribbon.svg?raw';
import iconPalette from '../icons/freehand/palette.svg?raw';
import iconMegaphone from '../icons/freehand/megaphone.svg?raw';
import iconTarget from '../icons/freehand/target.svg?raw';
import iconPen from '../icons/freehand/pen.svg?raw';
import iconMoney from '../icons/freehand/money.svg?raw';
import iconMail from '../icons/freehand/mail.svg?raw';
import iconAnalytics from '../icons/freehand/analytics.svg?raw';
import iconLike from '../icons/freehand/like.svg?raw';

type Depth = 'mid' | 'far';

interface Course {
  lead: string;
  mark: string;
  icon: string;
  depth: Depth;
  x: string;
  y: string;
  ys?: string;
  w: string;
  ry: string;
  rx: string;
  rz: string;
}

const courses: Course[] = [
  { lead: 'Market', mark: 'research.', icon: iconResearch, depth: 'mid', x: '3.5%', y: '13%', ys: '9%', w: '15vw', ry: '22deg', rx: '6deg', rz: '-5deg' },
  { lead: '', mark: 'Networking.', icon: iconHandshake, depth: 'far', x: '21%', y: '9%', w: '10vw', ry: '16deg', rx: '-4deg', rz: '6deg' },
  { lead: '', mark: 'Funnels.', icon: iconFunnel, depth: 'mid', x: '-2.5%', y: '47%', w: '10.5vw', ry: '30deg', rx: '4deg', rz: '2deg' },
  { lead: '', mark: 'Advertising.', icon: iconBillboard, depth: 'mid', x: '83.5%', y: '20%', ys: '14%', w: '13.5vw', ry: '-24deg', rx: '8deg', rz: '4deg' },
  { lead: '', mark: 'Branding.', icon: iconRibbon, depth: 'far', x: '68%', y: '8%', w: '10.5vw', ry: '-14deg', rx: '-6deg', rz: '-6deg' },
  { lead: 'Visual', mark: 'identity.', icon: iconPalette, depth: 'far', x: '92%', y: '50%', w: '12vw', ry: '-30deg', rx: '2deg', rz: '-2deg' },
  { lead: 'Email', mark: 'marketing.', icon: iconMail, depth: 'far', x: '31%', y: '3%', w: '8vw', ry: '12deg', rx: '10deg', rz: '-3deg' },
  { lead: '', mark: 'Analytics.', icon: iconAnalytics, depth: 'far', x: '62%', y: '2.5%', w: '8vw', ry: '-12deg', rx: '10deg', rz: '4deg' },
  { lead: 'Social', mark: 'media.', icon: iconLike, depth: 'far', x: '95.5%', y: '27%', w: '9vw', ry: '-32deg', rx: '-2deg', rz: '5deg' },
  { lead: '', mark: 'Pricing.', icon: iconMoney, depth: 'far', x: '8%', y: '63%', w: '9.5vw', ry: '18deg', rx: '-6deg', rz: '-8deg' },
  { lead: 'Public', mark: 'relations.', icon: iconMegaphone, depth: 'far', x: '1%', y: '80%', w: '11vw', ry: '20deg', rx: '-8deg', rz: '3deg' },
  { lead: '', mark: 'Copywriting.', icon: iconPen, depth: 'far', x: '84%', y: '64%', w: '10vw', ry: '-18deg', rx: '-6deg', rz: '7deg' },
  { lead: '', mark: 'Positioning.', icon: iconTarget, depth: 'far', x: '89%', y: '82%', w: '10.5vw', ry: '-18deg', rx: '-10deg', rz: '-5deg' },
];

function entrance(course: Course) {
  const x = parseFloat(course.x) + 5;
  const y = parseFloat(course.y) + 8;
  const distance = Math.hypot(x - 50, (y - 45) * 0.6);
  return {
    delay: `${Math.round(320 + distance * 14)}ms`,
    dx: x < 50 ? '-5rem' : '5rem',
    dy: y < 45 ? '-2rem' : '2rem',
  };
}

export default function CourseScatter() {
  return (
    <div className="scatter" aria-hidden="true">
      {courses.map((course) => {
        const entry = entrance(course);
        return (
          <div
            className={`scatter_item is-${course.depth}`}
            key={course.mark}
            style={
              {
                '--x': course.x,
                '--y': course.y,
                '--ys': course.ys,
                '--w': course.w,
                '--ry': course.ry,
                '--rx': course.rx,
                '--rz': course.rz,
                '--delay': entry.delay,
                '--dx': entry.dx,
                '--dy': entry.dy,
              } as CSSProperties
            }
          >
            <div className="cover is-plain">
              <p className="cover_title">
                {course.lead && `${course.lead} `}
                <em className="highlight">{course.mark}</em>
              </p>
              <span className="cover_badge">
                <span className="icon" dangerouslySetInnerHTML={{ __html: course.icon }} />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
