import Link from "next/link";

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
    <div
      className={`grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]`}
    >
      <h1 className="text-4xl font-bold">
        Rootのページだよ！
      </h1>
      <ol className="list-inside list-decimal text-sm text-center">
          {items.map((item) => (
            <li key={item._id}>
              {item.name}: ${item.price}
            </li>
          ))}
        </ol>
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
      </div>
    </div>
  );
}