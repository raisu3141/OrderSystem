import React from 'react';
import styles from '/styles/SalesRanking.module.css';
import SilverHolizonLine from './SilverHolizonLine.tsx';
import Image from 'next/image';


const Sales2nd = ({ response}) => {
    if (!response ) {
        return <div>データがありません</div>; // データがない場合の表示
    }
    return(
        <div>
            <div className = {styles.imageranker}>
                <Image className = {styles.imagecontainer}
                    src="/images/crown2.png"//二位の画像のパス指定
                    alt="2位画像"
                    width={175}
                    height={175}
                />
                <div className = {styles.rankfontsize}>2位</div >
                <Image className = {styles.itemscontainer}
                    src={response.productImageUrl}
                    alt="商品の画像"
                    width={175}
                    height={175}
                />
            <div className={styles.itemmrgin}>{response.productName}</div> {/* 2位の商品名 */}
            <div className={styles.namesfontmargin}>{response.storeName}</div> {/* 2位の屋台名 */}
            </div>
            <SilverHolizonLine/>
        </div>
    );
};
export default Sales2nd;