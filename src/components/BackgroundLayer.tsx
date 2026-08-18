"use client";

import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import { useAnimationFrame } from "@/hooks/useAnimationFrame";
import { FloatingImage } from "@/components/FloatingImage";
import type { FloatingImageConfig } from "@/types/floatingImage";
import type { HeroLoadPhase } from "@/hooks/useHeroLoadPhase";
import {
  CANVAS_H_VH,
  CANVAS_W_VW,
  getFocusSlotRevealOrder,
  INITIAL_FOCUS_BATCH,
  IMAGE_BOX_HEIGHT_VW,
  IMAGE_BOX_WIDTH_VW,
  IMAGE_BOX_HEIGHT_VW_MOBILE,
  IMAGE_BOX_WIDTH_VW_MOBILE,
  IMAGE_POSITIONS,
} from "@/lib/hero/focusSlots";

/** Below this width, floating images use the larger mobile box size. */
const MOBILE_BREAKPOINT_PX = 640;

/** Wait for entrance animation before revealing the next focus box. */
const FOCUS_ENTRANCE_MS = 500;
const FOCUS_SLOT_TIMEOUT_MS = 3000;

interface Props {
  containerRef: React.RefObject<HTMLElement | null>;
  floatingImages: FloatingImageConfig[];
  loadPhase: HeroLoadPhase;
  onFocusSequenceComplete: () => void;
  /** Whether the hero is currently in (or near) the viewport — false once
   *  scrolled well past it, so the mouse-parallax and per-image float rAF
   *  loops stop doing per-frame work they have no visible payoff for and
   *  would otherwise keep competing with scroll indefinitely. */
  active?: boolean;
}

function initialFocusStep(revealCount: number): number {
  if (revealCount === 0) return -1;
  return Math.min(INITIAL_FOCUS_BATCH - 1, revealCount - 1);
}

export function BackgroundLayer({
  containerRef,
  floatingImages,
  loadPhase,
  onFocusSequenceComplete,
  active = true,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ targetX: 0.5, targetY: 0.5, x: 0.5, y: 0.5 });
  const [isMobile, setIsMobile] = useState(false);
  const [focusStep, setFocusStep] = useState(-1);
  const focusStepRef = useRef(-1);
  const loadedFocusSlotsRef = useRef(new Set<number>());

  const focusRevealOrder = useMemo(() => getFocusSlotRevealOrder(), []);
  const initialBatchEnd = useMemo(
    () => initialFocusStep(focusRevealOrder.length),
    [focusRevealOrder.length],
  );

  focusStepRef.current = focusStep;

  const goToNextFocusSlot = useCallback(() => {
    const next = focusStepRef.current + 1;
    if (next >= focusRevealOrder.length) {
      onFocusSequenceComplete();
    } else {
      setFocusStep(next);
    }
  }, [focusRevealOrder.length, onFocusSequenceComplete]);

  useEffect(() => {
    if (loadPhase === "focus") {
      const start = initialFocusStep(focusRevealOrder.length);
      setFocusStep(start);
      focusStepRef.current = start;
      loadedFocusSlotsRef.current = new Set();
    }
  }, [loadPhase, focusRevealOrder.length]);

  useEffect(() => {
    if (loadPhase !== "focus") return;
    if (focusStep < 0 || focusStep >= focusRevealOrder.length) return;

    const timeout = window.setTimeout(goToNextFocusSlot, FOCUS_SLOT_TIMEOUT_MS);
    return () => window.clearTimeout(timeout);
  }, [loadPhase, focusStep, focusRevealOrder.length, goToNextFocusSlot]);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`);
    setIsMobile(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouseRef.current.targetX = (e.clientX - rect.left) / rect.width;
      mouseRef.current.targetY = (e.clientY - rect.top) / rect.height;
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, [containerRef]);

  useAnimationFrame(() => {
    if (loadPhase === "shell" || !active) return;

    const m = mouseRef.current;
    m.x += (m.targetX - m.x) * 0.08;
    m.y += (m.targetY - m.y) * 0.08;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const offsetX = -m.x * ((CANVAS_W_VW / 100 - 1) * vw);
    const offsetY = -m.y * ((CANVAS_H_VH / 100 - 1) * vh);

    canvas.style.transform = `translate3d(${offsetX.toFixed(1)}px, ${offsetY.toFixed(1)}px, 0)`;
  });

  function shouldAdvanceFocusSequence(step: number, slotIndex: number): boolean {
    const orderIndex = focusRevealOrder.indexOf(slotIndex);
    if (orderIndex === -1 || orderIndex > step) return false;

    loadedFocusSlotsRef.current.add(slotIndex);

    if (step <= initialBatchEnd) {
      const batch = focusRevealOrder.slice(0, initialBatchEnd + 1);
      return batch.every((slot) => loadedFocusSlotsRef.current.has(slot));
    }

    return focusRevealOrder[step] === slotIndex;
  }

  function handleFocusLoaded(slotIndex: number) {
    if (loadPhase !== "focus") return;
    if (!shouldAdvanceFocusSequence(focusStepRef.current, slotIndex)) return;

    window.setTimeout(goToNextFocusSlot, FOCUS_ENTRANCE_MS);
  }

  return (
    <div
      ref={canvasRef}
      className="pointer-events-none absolute z-0"
      style={{
        width: `${CANVAS_W_VW}vw`,
        height: `${CANVAS_H_VH}dvh`,
        left: 0,
        top: 0,
        willChange: "transform",
      }}
    >
      <div className="pointer-events-auto relative h-full w-full">
        {floatingImages.map((img, i) => {
          const orderIndex = focusRevealOrder.indexOf(i);

          if (img.inFocus) {
            if (loadPhase === "shell") return null;
            if (orderIndex === -1 || orderIndex > focusStep) return null;
          } else if (loadPhase !== "complete") {
            return null;
          }

          const isPriorityFocus =
            img.inFocus &&
            (orderIndex <= initialBatchEnd || orderIndex === focusStep);

          const entranceDelay =
            img.inFocus && orderIndex <= initialBatchEnd ? orderIndex * 0.08 : 0;

          const boxWidth = isMobile ? IMAGE_BOX_WIDTH_VW_MOBILE : IMAGE_BOX_WIDTH_VW;
          const boxHeight = isMobile ? IMAGE_BOX_HEIGHT_VW_MOBILE : IMAGE_BOX_HEIGHT_VW;

          return (
            <div
              key={i}
              className="absolute z-0 hover:z-20"
              style={{
                left: IMAGE_POSITIONS[i].left,
                top: IMAGE_POSITIONS[i].top,
                width: `${boxWidth}vw`,
                height: `${boxHeight}vw`,
              }}
            >
              <FloatingImage
                {...img}
                priority={isPriorityFocus || img.priority}
                visible
                paused={!active}
                animateEntrance={img.inFocus ? "full" : "fade"}
                entranceDelay={entranceDelay}
                onLoadingComplete={
                  img.inFocus ? () => handleFocusLoaded(i) : undefined
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
