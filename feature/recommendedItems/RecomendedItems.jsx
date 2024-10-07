import React from 'react';
import Image from 'next/image';
import styles from './SalesRanking.module.css';

function RecommendedItems() {
    return(
        <div>
            <div className= {styles.sidebyside}>
                <h1 className={styles.container}>おすすめ商品！
                </h1>
                    <Image className={styles.osusumesize}
                    src = "osusume.jpg"
                    />
            </div>
            <p className ={styles.sidebyside}>
                <div className = {styles.upmarginvertical}>
                    <Image
                        src = ""//商品の画像のURL
                        alt = "商品の画像"
                        width = "80%"
                        height = "60%"
                    />
                    <div className = {styles.itemsname}>{屋台名}</div>
                    <div className = {styles.itemsname}>{商品名}</div>
                </div>

                <div className = {styles.upmarginvertical}>
                    <Image
                        src = ""//商品の画像のURL
                        alt = "商品の画像"
                        width = "80%"
                        height = "60%"
                    />
                    <div className = {styles.itemsname}>{屋台名}</div>
                    <div className = {styles.itemsname}>{商品名}</div>
                </div>

                <div className = {styles.upmarginvertical}>
                    <Image
                        src = ""//商品の画像のURL
                        alt = "商品の画像"
                        width = "80%"
                        height = "60%"
                    />
                    <div className = {styles.itemsname}>{屋台名}</div>
                    <div className = {styles.itemsname}>{商品名}</div>
                </div>
            </p>
        </div>
    );v
}