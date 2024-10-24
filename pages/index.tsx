import { useRouter } from "next/router";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  // 屋台概要ページに飛ぶ際のパスワード確認
  const handleStallPageClick = () => {
    const password = prompt("パスワードを入力してください:");
    if (password === "cisco") {
      localStorage.setItem("authenticated", "true"); // 認証済みを保存
      router.push("/stall-about/stall_about_main");
    } else {
      alert("パスワードが違います。"); // パスワードが違う場合のアラート
    }
  };

  return (
    <div
      className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]"
    >
      <h1 className="text-4xl font-bold">
        Rootのページだよ！
      </h1>
      <div className="flex space-x-4">
        <Link
          href="/examplepage"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          画面遷移の例だよ！
        </Link>
        <Link
          href="/ordermanagement/liststalls"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          注文管理ページにいくよ！
        </Link>
        <Link
          href="/orderinput/orderpage"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          注文入力ページ！！
        </Link>
        {/* パスワードが必要なボタン */}
        <button
          onClick={handleStallPageClick}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          屋台概要ページ！！
        </button>
        <Link
          href="/ordercancel/cancelpage"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          cancelページ！！
        </Link>
        <Link
          href="/showcompleted/showcompletedpage"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          マックのやつ
        </Link>
      </div>
    </div>
  );
}
