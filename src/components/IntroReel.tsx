import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import iconPlay from '../icons/freehand/play.svg?raw';
import iconPause from '../icons/freehand/pause.svg?raw';
import iconVolume from '../icons/freehand/volume.svg?raw';
import iconVolumeOff from '../icons/freehand/volume-off.svg?raw';
import iconExpand from '../icons/freehand/expand.svg?raw';
import iconCaptions from '../icons/freehand/captions.svg?raw';
import iconClose from '../icons/freehand/close.svg?raw';

const SRC = '/video/intro.mp4';
const CAPTIONS = '/video/intro.vtt';
const POSTER = '/video/intro-poster.jpg';
const THUMB = '/video/intro-thumb.jpg';
const LENGTH = 151.5;
const IDLE_MS = 2500;
const EASE = [0.16, 1, 0.3, 1] as const;

type Video = RefObject<HTMLVideoElement | null>;

function clock(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

function Icon({ svg }: { svg: string }) {
  return <span className="icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
}

export default function IntroReel() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  function close(join = false) {
    setOpen(false);
    requestAnimationFrame(() => {
      if (join) document.getElementById('waitlist-email')?.focus();
      else triggerRef.current?.focus({ preventScroll: true });
    });
  }

  const layout = reduced ? undefined : 'intro-screen';

  return (
    <>
      <button className="reel" type="button" ref={triggerRef} aria-haspopup="dialog" aria-label="Watch the intro video" onClick={() => setOpen(true)}>
        <span className="reel_card">
          <span className="reel_tab" aria-hidden="true">Watch the intro</span>
          <motion.span className="reel_frame" layoutId={layout} transition={{ duration: 0.5, ease: EASE }} style={{ borderRadius: '0.1875rem' }}>
            <img src={THUMB} alt="" width={960} height={540} />
          </motion.span>
          <span className="reel_play" aria-hidden="true">
            <Icon svg={iconPlay} />
          </span>
        </span>
      </button>
      {mounted &&
        createPortal(
          <AnimatePresence>{open && <Theater key="theater" layout={layout} onClose={close} />}</AnimatePresence>,
          document.body,
        )}
    </>
  );
}

function Theater({ layout, onClose }: { layout?: string; onClose: (join?: boolean) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const idleTimer = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [captions, setCaptions] = useState(true);
  const [ready, setReady] = useState(!layout);
  const [idle, setIdle] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    for (const track of Array.from(video.textTracks)) track.mode = 'hidden';
    video.play().catch(() => {});
    document.body.style.overflow = 'hidden';
    screenRef.current?.focus({ preventScroll: true });
    const timer = window.setTimeout(() => setReady(true), 520);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(idleTimer.current);
      document.body.style.overflow = '';
    };
  }, []);

  const wake = useCallback(() => {
    setIdle(false);
    window.clearTimeout(idleTimer.current);
    const video = videoRef.current;
    if (video && !video.paused) idleTimer.current = window.setTimeout(() => setIdle(true), IDLE_MS);
  }, []);

  useEffect(() => {
    wake();
  }, [playing, wake]);

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) video.play().catch(() => {});
    else video.pause();
  }

  function seek(to: number) {
    const video = videoRef.current;
    if (!video) return;
    const end = Number.isFinite(video.duration) ? video.duration : LENGTH;
    video.currentTime = Math.min(Math.max(to, 0), end);
  }

  function replay() {
    seek(0);
    videoRef.current?.play().catch(() => {});
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    if (video.muted || video.volume === 0) {
      video.muted = false;
      if (video.volume === 0) video.volume = 0.6;
    } else {
      video.muted = true;
    }
  }

  function changeVolume(next: number) {
    const video = videoRef.current;
    if (!video) return;
    video.volume = Math.min(Math.max(next, 0), 1);
    video.muted = video.volume === 0;
  }

  function fullscreen() {
    const screen = screenRef.current;
    const video = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (document.fullscreenElement) document.exitFullscreen();
    else if (screen?.requestFullscreen) screen.requestFullscreen();
    else video?.webkitEnterFullscreen?.();
  }

  function close(join = false) {
    videoRef.current?.pause();
    if (document.fullscreenElement) document.exitFullscreen();
    setClosing(true);
    onClose(join);
  }

  function onKeyDown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    const video = videoRef.current;
    wake();
    if (event.key === 'Escape') {
      if (document.fullscreenElement) return;
      event.preventDefault();
      close();
    } else if (event.key === 'Tab') {
      const focusable = screenRef.current?.querySelectorAll<HTMLElement>('button, input');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!screenRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    } else if (event.key === ' ' || event.key === 'k') {
      if (event.key === ' ' && target.closest('.player_close, .player_cta, .player_bar.is-end')) return;
      event.preventDefault();
      if (!event.repeat) toggle();
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      if (video) seek(video.currentTime + (event.key === 'ArrowRight' ? 5 : -5));
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      if (video) changeVolume((video.muted ? 0 : video.volume) + (event.key === 'ArrowUp' ? 0.1 : -0.1));
    } else if (event.key === 'm') {
      toggleMute();
    } else if (event.key === 'c') {
      setCaptions((on) => !on);
    } else if (event.key === 'f') {
      fullscreen();
    }
  }

  const keyHandler = useRef(onKeyDown);
  keyHandler.current = onKeyDown;

  useEffect(() => {
    const listener = (event: KeyboardEvent) => keyHandler.current(event);
    const swallow = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (event.key === ' ' && !target.closest('.player_close, .player_cta, .player_bar.is-end')) event.preventDefault();
    };
    document.addEventListener('keydown', listener);
    document.addEventListener('keyup', swallow);
    return () => {
      document.removeEventListener('keydown', listener);
      document.removeEventListener('keyup', swallow);
    };
  }, []);

  const hidden = !ready || (idle && playing);
  const level = muted ? 0 : volume;

  return (
    <div className="theater" role="dialog" aria-modal="true" aria-label="Course intro video">
      <motion.div
        className="theater_backdrop"
        aria-hidden="true"
        onClick={() => close()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
      />
      <div className="theater_sheet">
        <motion.div
          className={hidden ? 'player_screen is-idle' : 'player_screen'}
          data-theme="light"
          tabIndex={-1}
          ref={screenRef}
          layoutId={layout}
          transition={{ duration: 0.5, ease: EASE }}
          style={{ borderRadius: '0.1875rem' }}
          initial={layout ? undefined : { opacity: 0 }}
          animate={layout ? undefined : { opacity: 1 }}
          exit={layout ? undefined : { opacity: 0 }}
          onPointerMove={wake}
          onPointerDown={wake}
          onFocus={wake}
        >
          <video
            ref={videoRef}
            src={SRC}
            poster={POSTER}
            playsInline
            preload="auto"
            onClick={toggle}
            onPlay={() => {
              setPlaying(true);
              setEnded(false);
            }}
            onPause={() => setPlaying(false)}
            onEnded={() => {
              setPlaying(false);
              setEnded(true);
              if (document.fullscreenElement) document.exitFullscreen();
            }}
            onVolumeChange={(event) => {
              setMuted(event.currentTarget.muted);
              setVolume(event.currentTarget.volume);
            }}
          >
            <track kind="captions" src={CAPTIONS} srcLang="en" label="English" default />
          </video>
          {!closing && (
            <>
              {captions && !ended && <Captions video={videoRef} />}
              <button className="player_control player_close" type="button" aria-label="Close the video" onClick={() => close()}>
                <Icon svg={iconClose} />
              </button>
              {ended && document.getElementById('waitlist-email') && (
                <button className="player_cta" type="button" aria-label="Join the waitlist" onClick={() => close(true)} />
              )}
              {ended ? (
                <div className="player_bar is-end">
                  <button className="button is-secondary is-small" type="button" onClick={replay}>
                    Watch again
                  </button>
                </div>
              ) : (
                <div className="player_bar">
                  <button className="player_control is-primary" type="button" aria-label={playing ? 'Pause' : 'Play'} onClick={toggle}>
                    <Icon svg={playing ? iconPause : iconPlay} />
                  </button>
                  <Timeline video={videoRef} onSeek={seek} />
                  <div className="player_volume">
                    <button className="player_control" type="button" aria-label={level === 0 ? 'Unmute' : 'Mute'} onClick={toggleMute}>
                      <Icon svg={level === 0 ? iconVolumeOff : iconVolume} />
                    </button>
                    <input
                      className="player_range"
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={level}
                      aria-label="Volume"
                      aria-valuetext={`${Math.round(level * 100)}%`}
                      style={{ '--range-fill': `${level * 100}%` } as CSSProperties}
                      onChange={(event) => changeVolume(Number(event.target.value))}
                    />
                  </div>
                  <button className="player_control" type="button" aria-label="Captions" aria-pressed={captions} onClick={() => setCaptions((on) => !on)}>
                    <Icon svg={iconCaptions} />
                  </button>
                  <button className="player_control" type="button" aria-label="Full screen" onClick={fullscreen}>
                    <Icon svg={iconExpand} />
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function Timeline({ video, onSeek }: { video: Video; onSeek: (to: number) => void }) {
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(LENGTH);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    let frame = 0;
    const read = () => {
      setTime(element.currentTime);
      if (Number.isFinite(element.duration) && element.duration > 0) setDuration(element.duration);
    };
    const tick = () => {
      read();
      if (!element.paused) frame = requestAnimationFrame(tick);
    };
    const start = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    };
    read();
    if (!element.paused) start();
    element.addEventListener('play', start);
    element.addEventListener('seeked', read);
    element.addEventListener('timeupdate', read);
    element.addEventListener('loadedmetadata', read);
    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener('play', start);
      element.removeEventListener('seeked', read);
      element.removeEventListener('timeupdate', read);
      element.removeEventListener('loadedmetadata', read);
    };
  }, [video]);

  return (
    <>
      <span className="player_time">
        {clock(time)}
        <span className="player_total"> / {clock(duration)}</span>
      </span>
      <div className="player_scrub">
        <input
          className="player_range"
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={time}
          aria-label="Seek"
          aria-valuetext={`${clock(time)} of ${clock(duration)}`}
          style={{ '--range-fill': `${(time / duration) * 100}%` } as CSSProperties}
          onChange={(event) => {
            const to = Number(event.target.value);
            setTime(to);
            onSeek(to);
          }}
        />
      </div>
    </>
  );
}

function Captions({ video }: { video: Video }) {
  const [text, setText] = useState('');

  useEffect(() => {
    const track = video.current?.textTracks[0];
    if (!track) return;
    track.mode = 'hidden';
    const read = () => {
      const cues = Array.from(track.activeCues ?? []) as VTTCue[];
      setText(cues.map((cue) => cue.text).join('\n'));
    };
    read();
    track.addEventListener('cuechange', read);
    return () => track.removeEventListener('cuechange', read);
  }, [video]);

  return (
    <div className="player_captions" aria-hidden="true">
      {text && <span className="player_caption">{text}</span>}
    </div>
  );
}
