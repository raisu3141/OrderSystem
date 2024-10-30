import { useState, useEffect } from 'react'
import Head from 'next/head'
import StallsCard from '../../components/StallsCard'
import Header from '../../components/header'
import Styles from '../../styles/Home.module.css'
import { Loader2 } from 'lucide-react'

interface Stall {
  storeName: string
  storeImageUrl: string
}

export function ListStalls() {
  const [stallList, setStallList] = useState<Stall[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStalls = async () => {
      try {
        const response = await fetch('/api/StoreData/getter/getAllStore')
        if (!response.ok) {
          throw new Error('Failed to fetch stalls')
        }
        const data = await response.json()
        setStallList(data)
      } catch (err) {
        setError('データが取れなかったよ! ><')
        console.error('エラーです!:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStalls()
  }, [])

  if (isLoading) {
    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Loader2 className="animate-spin text-white w-16 h-16" />
    </div>
    )
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div>
      <Head>
        <title>屋台一覧</title>
      </Head>
      <Header />
      <div className={Styles.container}>
        <div className="sticky top-0 bg-white border-b-2 border-gray-300 p-4 z-10 flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">屋台一覧</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 取得した屋台の数だけカードを表示 */}
          {stallList.map((stall) => (
            <StallsCard key={stall.storeName} storeName={stall.storeName} image={stall.storeImageUrl} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ListStalls