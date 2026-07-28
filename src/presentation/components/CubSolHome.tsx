"use client";

import { useCubSolStore } from "@/src/application/store/cubsolStore";
import { ManualCubeEditor } from "./ManualCubeEditor";
import styles from "./CubSolHome.module.css";

const methods = [
  ["01", "Quét camera", "Căn từng mặt vào lưới 3×3 và kiểm tra lại trước khi giải.", "Sắp ra mắt"],
  ["02", "Tải sáu ảnh", "Nhận diện màu ngay trên thiết bị, không gửi ảnh lên máy chủ.", "Sắp ra mắt"],
  ["03", "Điền thủ công", "Chủ động nhập chính xác 54 ô màu bằng bảng màu trực quan.", "Sẵn sàng"],
] as const;

const pipeline = [
  ["Nhập liệu", "Camera · Ảnh · Thủ công"],
  ["Xác thực", "Đếm màu · Kiểm tra vật lý"],
  ["Tìm lời giải", "Kociemba chạy trên thiết bị"],
  ["Hướng dẫn", "Chuỗi WCA · Trình chiếu 3D"],
] as const;

export function CubSolHome() {
  const status = useCubSolStore((state) => state.status);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="#" aria-label="CubSol — Trang chủ">
          <span className={styles.mark} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>CubSol</span>
        </a>

        <div className={styles.headerMeta}>
          <span className={styles.privacy}>
            <span aria-hidden="true">●</span> Xử lý riêng tư trên thiết bị
          </span>
          <span className={styles.version}>WASM Solver · Tuần 4</span>
        </div>
      </header>

      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Rubik 3×3 · Rõ từng bước</p>
          <h1 id="hero-title">
            Từ khối Rubik đang rối
            <span> đến lời giải bạn nhìn thấy.</span>
          </h1>
          <p className={styles.lead}>
            CubSol đang được xây dựng để đọc trạng thái khối, kiểm tra tính hợp
            lệ và hướng dẫn từng nước xoay — ngay trong trình duyệt.
          </p>

          <div className={styles.heroActions}>
            <a className={styles.primaryAction} href="#input-methods">
              Xem phương thức nhập
              <span aria-hidden="true">↘</span>
            </a>
            <p>
              Trạng thái hệ thống
              <strong>{status === "IDLE" ? "Sẵn sàng nền tảng" : status}</strong>
            </p>
          </div>
        </div>

        <div
          className={styles.cubeStage}
          role="img"
          aria-label="Minh họa khối Rubik CubSol ba mặt màu tím, trắng và đỏ"
        >
          <div className={styles.glow} />
          <div className={styles.cube} aria-hidden="true">
            {(["front", "top", "side"] as const).map((face) => (
              <div className={`${styles.cubeFace} ${styles[face]}`} key={face}>
                {Array.from({ length: 9 }, (_, index) => (
                  <i key={`${face}-${index}`} />
                ))}
              </div>
            ))}
          </div>
          <div className={styles.stageLabel}>
            <span>01</span>
            <p>
              Mô hình 3D
              <strong>Sẵn sàng</strong>
            </p>
          </div>
        </div>
      </section>

      <section className={styles.pipeline} aria-label="Luồng xử lý CubSol">
        {pipeline.map(([title, detail], index) => (
          <article key={title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h2>{title}</h2>
              <p>{detail}</p>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.methods} id="input-methods" aria-labelledby="methods-title">
        <div className={styles.sectionHeading}>
          <p>Ba cách bắt đầu</p>
          <h2 id="methods-title">Chọn cách phù hợp với khối của bạn.</h2>
        </div>

        <div className={styles.methodGrid}>
          {methods.map(([index, title, description, state]) => (
            <article className={styles.methodCard} key={index}>
              <div className={styles.cardTop}>
                <span>{index}</span>
                <span>{state}</span>
              </div>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <ManualCubeEditor />

      <footer className={styles.footer}>
        <p>Đặt tính đúng, sự rõ ràng và quyền riêng tư làm nền tảng.</p>
        <span>© 2026 CubSol</span>
      </footer>
    </main>
  );
}
