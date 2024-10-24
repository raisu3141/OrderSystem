import Link from "next/link";

export default function Home() {
  return (
    <div
      className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'
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
        <Link
          href="/stall-about/stall_about_main"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          屋台概要ページ！！
        </Link>
        <Link
          href="/ordercancel/cancelpage"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          cancelページ！！
        </Link>
      </div>
    </div>
  );
}