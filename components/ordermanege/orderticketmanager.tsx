import Head from 'next/head'
import OrderTicket from '../../components/ordermanege/orderticket'

interface OrderticketManagerProps {
  storeName: string;
  name: string;
}

export default function OrderticketManager({ storeName, name }: OrderticketManagerProps) {
  return (
    <div>
      <Head>
        <title>{name}</title>
        <meta name="description" content="NANCA 注文管理システム" />
      </Head>
      <main>
        <OrderTicket storeName={storeName} />
      </main>
    </div>
  )
}