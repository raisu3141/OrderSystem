import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from '/styles/SalesRanking.module.css';
import GoldHolizonLine from './GoldHolizonLine.tsx';
import SilverHolizonLine from './SilverHolizonLine.tsx';
import BronzeHorizontalLine from './BronzeHorizontalLine.tsx';
import axios from 'axios';



const initialState = {
  rankings: [], // ランキングデータを保存する配列
  currentTime: '', // 現在時刻
};

function SalesRanking() {
  const [state, setState] = useState(initialState);

  // API呼び出し: 商品情報と時刻を取得
  const fetchSalesData = async () => {
    try {
      const response = await axios.get('/api/Utils/getTopSales'); // APIのURLを指定
      const now = new Date().toLocaleTimeString(); // 現在時刻
      setState({ rankings: response.data.rankings, currentTime: now }); // APIデータと時刻を更新
    } catch (error) {
      console.error('API取得に失敗しました:', error);
    }
  };

  // 10分ごとのAPI再取得のロジック
  const startAutoRefresh = () => {
    setTimeout(() => {
      fetchSalesData(); // 10分後にAPIを再取得
      startAutoRefresh(); // 再び10分後に実行
    }, 10 * 60 * 1000); // 10分間隔でAPIを再取得
  };

  useEffect(() => {
    fetchSalesData(); // 初回マウント時にAPIからデータ取得
    startAutoRefresh(); // 10分ごとにAPIを再取得するタイマーを開始
  }, []);

//画面表示
  return(
      <div className = {styles.pagessize}>
	<div className = {styles.flex}>
          <span className={styles.container}>\売り上げランキング/</span>
          <span className={styles.times}>更新時刻: {state.currentTime}</span> {/* 時刻表示 */}
	</div>
          <div className = {styles.imageranker}>
              <Image className = {styles.imagecontainer}
                  src="/images/crown1.png"//一位の画像のパス指定
                  alt="1位画像"
                  width={175}
                  height={175}
              />
              <div className = {styles.rankfontsize}>1位</div >
              <Image
                className={styles.itemscontainer}
                src={state.rankings[0].productImageUrl} // APIから取得した1位の商品の画像URL
                alt="1位の商品画像"
                  width={175}
                  height={175}
              />
              <div className={styles.itemmrgin}>{state.rankings[0].productName}</div> {/* 1位の商品名 */}
              <div className={styles.namesfontmargin}>{state.rankings[0].storeName}</div> {/* 1位の屋台名 */}
          </div>
          <GoldHolizonLine/>
          <div className = {styles.imageranker}>
              <Image className = {styles.imagecontainer}
                  src="/images/crown2.png"//二位の画像のパス指定
                  alt="２位画像"
                  width={175}
                  height={175}
              />
              <div className = {styles.rankfontsize}>2位</div>
              <Image className = {styles.itemscontainer}
                   src={state.rankings[1].productImageUrl} // APIから取得した2位の商品の画像URL
                  alt="商品の画像"
              />
              <div className={styles.itemmrgin}>{state.rankings[1].productName}</div> {/* 2位の商品名 */}
              <div className={styles.namesfontmargin}>{state.rankings[1].storeName}</div> {/* 2位の屋台名 */}

          </div>
          
          <SilverHolizonLine />
          <div className = {styles.imageranker}>
              <Image className = {styles.imagecontainer}
                  src="/images/crown3.png"//三位の画像のパス指定
                  alt="３位画像"
                  width={175}
                  height={175}
              />
              <div className = {styles.rankfontsize}>3位</div >
              <Image className = {styles.itemscontainer}
                  src={state.rankings[2].productImageUrl} // APIから取得した3位の商品の画像URL
                  alt="商品の画像"
                  width={175}
                  height={175}
              />
          <div className={styles.itemmrgin}>{state.rankings[2].productName}</div> {/* 3位の商品名 */}
          <div className={styles.namesfontmargin}>{state.rankings[2].storeName}</div> {/* 3位の屋台名 */}
          </div>
          <BronzeHorizontalLine />
      </div>
  );
}


export default SalesRanking;