import React from 'react';
import Image from 'next/image';
import styles from './SalesRanking.css';
//import {HorizontalLinegold,HorizontalLinesilber,HorizontalLinebronze} from 'HorizontalLine.tsx';

function SalesRanking() {
    return(
        <html>
            <body>
                <div>
                    <h1 className={styles.container}>\売り上げランキング/</h1>
                    <p className = {styles.imageranker}>
                        <Image className = {styles.imagecontainer}
                            src="1stcrown.png"//一位の画像のパス指定
                            alt="１位画像"
                            width = {200}
                            height = {200}
                        />
                        <div className = {styles.rinkfontsize}>１位</div>
                        <Image
                            src=""//一位の商品の画像のパス
                            alt="商品の画像"
                            width = {200}
                            height = {200}
                        />
                        <div className = {styles.itemmrgin}>{商品名}</div>
                        <div className = {styles.namesfontmargin}>{商品名}</div>
                        <div className = {styles.rankfontsize}>{商品名}</div>
                    </p>
                    <HorizontalLinegold />
                    <p className = {styles.imageranker}>
                        <Image className = {styles.imagecontainer}
                            src="2ndcrown.png"//二位の画像のパス指定
                            alt="２位画像"
                            width = {200}
                            height = {200}
                        />
                        <div className = {styles.rankfontsize}>2位</div>
                        <Image
                            src=""//二位の商品の画像のパス
                            alt="商品の画像"
                            width = {200}
                            height = {200}
                        />
                        <div className = {styles.itemmrgin}>{商品名}</div>
                        <div className = {styles.namesfontmargin}>{商品名}</div>
                        <div className = {styles.rankfontsize}>{商品名}</div>
                    </p>
                    
                    <HorizontalLinesilber />
                    <p className = {styles.imageranker}>
                        <Image className = {styles.imagecontainer}
                            src="3rdcrown.png"//三位の画像のパス指定
                            alt="３位画像"
                            width = {200}
                            height = {200}
                        />
                        <div className = {styles.rankfontsize}>3位</div >
                        <Image
                            src=""//三位の商品の画像のパス
                            alt="商品の画像"
                            width = {200}
                            height = {200}
                        />
                        <div className = {styles.itemmrgin}>{商品名}</div>
                        <div className = {styles.namesfontmargin}>{商品名}</div>
                        <div className = {styles.rankfontsize}>{商品名}</div>
                    </p>
                    <HorizontalLinebronze />
                </div>
            </body>
        </html>
    );
}

export default SalesRanking;