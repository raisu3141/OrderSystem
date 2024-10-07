import connectToDatabase from "../lib/mongoose";
import ItemModel from "../models/Item"; // モデルのインポート
import { Item } from "../types/item"; // 型のインポート

// getServerSidePropsの返り値の型を定義
export async function getServerSideProps() {
  await connectToDatabase(); // MongoDBへの接続

  // Item 型の配列として取得
  const itemsFromDb = await ItemModel.find({}).lean() as Item[]; 

  const items: Item[] = itemsFromDb.map((item) => ({
    _id: item._id.toString(), // MongoDBのIDを文字列に変換
    name: item.name,
    price: item.price,
  }));

  return {
    props: { items }, // 取得したアイテムをpropsとして返す
  };
}



// Homeコンポーネントのpropsに型を指定
interface HomeProps {
  items: Item[];
}

export default function Home({ items }: HomeProps) {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16">
      <main className="flex flex-col gap-8 items-center">
        <h1 className="text-2xl font-bold">Items</h1>
        <ol className="list-inside list-decimal text-sm text-center">
          {items.map((item) => (
            <li key={item._id}>
              {item.name}: ${item.price}
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}