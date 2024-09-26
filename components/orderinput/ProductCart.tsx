export function Cart() {
  return (
    <div className="w-64  bg-white p-4 shadow-lg">
      <h2 className="text-center font-semibold mb-4 border-b-2">注文内容</h2>
      {/* スクロールするならここに追加 */}
      <div className="h-[calc(100vh-20rem)]">
        <div className="flex justify-between items-center border-b-2 pb-2">
        <p>たこ焼き</p>
        <p>￥800</p>
      </div>
      </div>
      <div className="flex justify-between items-center border-t-2 pb-2">
        <span>合計</span>
        <span>￥800</span>
      </div>
      <button className="w-full mt-4">注文</button>
    </div>

  )
}