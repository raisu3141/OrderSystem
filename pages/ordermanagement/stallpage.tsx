import { useSearchParams } from 'next/navigation'
import { Metadata } from 'next'
import Styles from "../../styles/Home.module.css";
import OrderticketManager from "../../components/ordermanege/orderticketmanager";


export const metadata: Metadata = {
  title: 'Stall Page',
}

export default function StallPage() {
  const searchParams = useSearchParams()
  const storeName = searchParams.get('storeName')
  const name = searchParams.get('name')

  if (!storeName || !name) {
    return (
      <div>
        Error: Missing parameters
      </div>
    )
  }

  return (
    <div>
      <div className={Styles.container}>
        <div className="sticky top-0 bg-white border-b-2 border-gray-300 p-4 z-10 flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">{name}</h1>
        </div>
        <OrderticketManager storeName={storeName} />
      </div>
    </div>
  )
}