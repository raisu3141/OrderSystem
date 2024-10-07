import { useState, useEffect } from 'react'
import Head from 'next/head'
import StallsCard from '../../components/StallsCard'
import Header from '../../components/header'
import Styles from '../../styles/Home.module.css'

interface Stall {
  storeName: string
  name: string
  image: string
}

export function ListStalls() {
  const [stallList, setStallList] = useState<Stall[]>([])

  useEffect(() => {
    // APIが出来次第、APIからデータを取得する
    // 以下はモックデータ
    const mockStallList: Stall[] = [
      { storeName: 'demoshop', name: 'デモの屋台', image: '/images/yatai1.png' },
      { storeName: '2', name: '屋台２', image: '/images/yatai1.png' },
      { storeName: '3', name: '屋台３', image: '/images/yatai1.png' },
      { storeName: '4', name: '屋台４', image: '/images/yatai1.png' },
    ]
    setStallList(mockStallList)
  }, [])

  return (
    <div>
      <Head>
        <title>屋台一覧</title>
      </Head>
      {/* コンポーネントで作成したヘッダーを使用 */}
      <Header /> 
      <div className={Styles.container}>
        <div className="sticky top-0 bg-white border-b-2 border-gray-300 p-4 z-10 flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">屋台一覧</h1>
        </div>
        {/* 屋台一覧を表示 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stallList.map((stall) => (
            <StallsCard key={stall.storeName} {...stall} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ListStalls;