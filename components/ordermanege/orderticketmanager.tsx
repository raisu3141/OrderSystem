import Head from 'next/head'
import OrderTicket from '@/components/ordermanege/orderticket'

interface OrderticketManagerProps {
  storeId: string;
}

export default function OrderticketManager({ storeId }: OrderticketManagerProps) {
  return (
    <div>
      <Head>
        <title>屋台１</title>
        <meta name="description" content="NANCA 注文管理システム" />
      </Head>
      <main>
        <OrderTicket storeId={storeId} />
      </main>
    </div>
  )
}