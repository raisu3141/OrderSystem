import Link from "next/link";


export  function ExamplePage() {

    return (
        <div
          className={` grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]`}
        >
          <h1 className="text-4xl font-bold">
            画面遷移の例だよ！
          </h1>
          <Link 
            href="/" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Rootのページに戻る
          </Link>
        </div>
    )
}

export default ExamplePage;