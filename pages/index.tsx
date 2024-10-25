import { useRouter } from "next/router";
import Link from "next/link";
import styles from '../styles/index.module.css';

export default function Home() {
  const router = useRouter();

  const handleStallPageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const password = prompt("パスワードを入力してください:");
    if (password === "cisco") {
      localStorage.setItem("authenticated", "true");
      router.push("/stall-about/stall_about_main");
    } else {
      alert("パスワードが違います。");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.backgroundText} aria-hidden="true">
        NANCA NANCA NANCA NANCA
      </div>
      <h1 className={styles.title}>
        NANCA 注文管理システム
      </h1>
      <ul className={styles.listContainer}>
        <li className={styles.listItem}>
          <Link href="/ordermanagement/liststalls" className={styles.link}>
            注文管理ページ
          </Link>
        </li>
        <li className={styles.listItem}>
          <Link href="/orderinput/testorderpage" className={styles.link}>
            注文入力ページ
          </Link>
        </li>
        <li className={styles.listItem}>
          <a href="#" onClick={handleStallPageClick} className={styles.link}>
            屋台概要ページ
          </a>
        </li>
        <li className={styles.listItem}>
          <Link href="/ordercancel/cancelpage" className={styles.link}>
            キャンセルページ
          </Link>
        </li>
        <li className={styles.listItem}>
          <Link href="/showcompleted/showcompletedpage" className={styles.link}>
            受け取り待ち番号表示ページ
          </Link>
        </li>
      </ul>
    </div>
  );
}