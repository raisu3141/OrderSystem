import React from 'react';
import styles from '/styles/SalesRanking.module.css';
import GoldHolizonLine from './GoldHolizonLine.tsx';
import Image from 'next/image';


const Sales1st = ({ response }) => {
    if (!response ) {
        return <div>データがありません</div>; // データがない場合の表示
    }
    return(
        <div>
            <div className = {styles.imageranker}>
                <Image className = {styles.imagecontainer}
                    src="/images/crown1.png"//一位の画像のパス指定
                    alt="1位画像"
                    width={175}
                    height={175}
                />
                <div className = {styles.rankfontsize}>1位</div >
                <Image className = {styles.itemscontainer}
                    src={response.productImageUrl}
                    alt="商品の画像"
                    width={175}
                    height={175}
                />
            <div className={styles.itemmrgin}>{response.productName}</div> {/* 1位の商品名 */}
            <div className={styles.namesfontmargin}>{response.storeName}</div> {/* 1位の屋台名 */}
            </div>
            <GoldHolizonLine/>
        </div>
    );
};
export default Sales1st;