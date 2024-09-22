import { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import StallsCard from '../../components/StallsCard'


interface Stall {
  id: number
  name: string
  image: string
}

export function ListStalls() {
  const [stallList, setStallList] = useState<Stall[]>([])

  useEffect(() => {
    // APIが出来次第、APIからデータを取得する
    // 以下はモックデータ
    const mockStallList: Stall[] = [
      { id: 1, name: '屋台１', image: '/images/yatai1.png' },
      { id: 2, name: '屋台２', image: '/images/yatai1.png' },
      { id: 3, name: '屋台３', image: '/images/yatai1.png' },
      { id: 4, name: '屋台４', image: '/images/yatai1.png' },
    ]
    setStallList(mockStallList)
  }, [])

  return (
    <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      <Head>
        <title>屋台一覧</title>
      </Head>
      <div className="sticky top-0 bg-black border-b-2 border-gray-300 p-4 z-10 flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">屋台一覧</h1>
        <Link 
          href="/" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Rootに戻る
        </Link>
      </div>
      {/* 屋台一覧を表示 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stallList.map((stall) => (
          <StallsCard key={stall.id} {...stall} />
        ))}
      </div>
    </div>
  )
}

export default ListStalls;