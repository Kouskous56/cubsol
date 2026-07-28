"use client";

import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import type { CubeState, Face, Move } from "@/src/domain/cube";
import { SceneManager } from "./SceneManager";
import styles from "./RubiksCube.module.css";

interface RubiksCubeProps {
  cubeState: CubeState;
  onStickerClick?: ((face: Face, index: number) => void) | null;
  animatedMove?: Move | null;
  onAnimationComplete?: (() => void) | null;
  className?: string;
}

export function RubiksCube({
  cubeState,
  onStickerClick,
  animatedMove,
  onAnimationComplete,
  className,
}: RubiksCubeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<SceneManager | null>(null);
  const animatingRef = useRef(false);
  const animMoveRef = useRef<Move | null>(null);
  const mountKeyRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    mountKeyRef.current += 1;
    const key = mountKeyRef.current;

    try {
      const manager = new SceneManager(container);
      if (!manager.isValid()) {
        manager.dispose();
        startTransition(() => setError("Trình duyệt không hỗ trợ WebGL."));
        return;
      }
      managerRef.current = manager;
      manager.updateState(cubeState);
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        manager.resize(rect.width, rect.height);
      }
      startTransition(() => setReady(true));
    } catch (err) {
      console.error("[RubiksCube] failed to init 3D:", err);
      startTransition(() => setError("Không thể khởi tạo mô hình 3D."));
    }

    return () => {
      if (mountKeyRef.current === key || mountKeyRef.current === 0) {
        managerRef.current?.dispose();
        managerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (managerRef.current) {
      managerRef.current.updateState(cubeState);
    }
  }, [cubeState]);

  useEffect(() => {
    if (!managerRef.current) return;
    managerRef.current.setOnStickerClick(onStickerClick ?? null);
  }, [onStickerClick]);

  useEffect(() => {
    if (
      !animatedMove ||
      animatingRef.current ||
      animMoveRef.current === animatedMove
    ) {
      return;
    }

    animMoveRef.current = animatedMove;
    animatingRef.current = true;

    let active = true;
    managerRef.current?.animateMove(animatedMove).then(() => {
      if (!active) return;
      animatingRef.current = false;
      animMoveRef.current = null;
      onAnimationComplete?.();
    });

    return () => {
      active = false;
    };
  }, [animatedMove, onAnimationComplete]);

  const handleResize = useCallback(() => {
    if (!managerRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      managerRef.current.resize(rect.width, rect.height);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);
    return () => ro.disconnect();
  }, [handleResize]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        minHeight: 200,
        position: "relative",
        cursor: "grab",
        touchAction: "none",
      }}
    >
      {error && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffc0ba",
            fontSize: 14,
            textAlign: "center",
            padding: 20,
          }}
        >
          {error}
        </div>
      )}
      {!ready && !error && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className={styles.spinner} />
        </div>
      )}
    </div>
  );
}
