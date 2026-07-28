"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { RubiksCube } from "./RubiksCube";
import styles from "./RubiksCube.module.css";

export type LazyRubiksCubeProps = ComponentProps<typeof RubiksCube>;

export const LazyRubiksCube = dynamic<LazyRubiksCubeProps>(
  () => import("./RubiksCube").then((module) => module.RubiksCube),
  {
    ssr: false,
    loading: () => (
      <div className={styles.loading} role="status">
        <span className={styles.spinner} aria-hidden="true" />
        <span>Đang tải mô hình 3D…</span>
      </div>
    ),
  },
);
