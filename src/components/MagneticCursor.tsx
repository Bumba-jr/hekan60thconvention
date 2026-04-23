/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function MagneticCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const dot = cursorDotRef.current;
    if (!cursor || !dot) return;

    const moveCursor = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.6,
        ease: 'power3.out',
      });
      gsap.to(dot, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: 'power3.out',
      });
    };

    const hoverEffect = () => {
      gsap.to(cursor, {
        scale: 2,
        backgroundColor: 'rgba(197, 160, 89, 0.2)',
        borderColor: 'rgba(197, 160, 89, 0.8)',
        duration: 0.3,
      });
    };

    const leaveEffect = () => {
      gsap.to(cursor, {
        scale: 1,
        backgroundColor: 'transparent',
        borderColor: 'rgba(197, 160, 89, 0.5)',
        duration: 0.3,
      });
    };

    window.addEventListener('mousemove', moveCursor);

    const interactiveElements = document.querySelectorAll('button, a, .interactive');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', hoverEffect);
      el.addEventListener('mouseleave', leaveEffect);
    });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', hoverEffect);
        el.removeEventListener('mouseleave', leaveEffect);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-10 h-10 border border-artistic-gold/50 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-screen hidden md:block"
      />
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-artistic-gold rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden md:block"
      />
    </>
  );
}
