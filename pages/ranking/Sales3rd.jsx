import React from 'react';
import styles from '/styles/SalesRanking.module.css';
import BronzeHorizonLine from './BronzeHorizonLine.tsx';
import Image from 'next/image';


const Sales3rd = ({ response }) => {
    if (!response ) {
        return <div>データがありません</div>; // データがない場合の表示
    }
    return(
        <div>
            <div className = {styles.imageranker}>
                <Image className = {styles.imagecontainer}
                    src="/images/crown3.png"//三位の画像のパス指定
                    alt="3位画像"
                    width={175}
                    height={175}
                />
                <div className = {styles.rankfontsize}>3位</div >
                <Image className = {styles.itemscontainer}
                    src={response.productImageUrl}
                    alt="商品の画像"
                    width={175}
                    height={175}
                />
            <div className={styles.itemmrgin}>{response.productName}</div> {/* 3位の商品名 */}
            <div className={styles.namesfontmargin}>{response.storeName}</div> {/* 3位の屋台名 */}
            </div>
            <BronzeHorizonLine/>
        </div>
    );
};
export default Sales3rd;