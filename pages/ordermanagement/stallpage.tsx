import Header from "@/components/header";
import Head from "next/head";
import Styles from "@/styles/Home.module.css";

export default function StallPage1() {



    return (
      <div>
          <Head>
              <title>
                屋台１
              </title>
          </Head>
          <div className={Styles.container}>
            <div className="sticky top-0 bg-white border-b-2 border-gray-300 p-4 z-10 flex items-center justify-between mb-8">
              <h1 className="text-4xl font-bold">屋台１</h1>
            </div>
          </div>
      </div>
    )
}