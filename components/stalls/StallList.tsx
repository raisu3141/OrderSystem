import styles from '../../styles/Stallabout.module.css';

import Image from 'next/image'; // Imageコンポーネントをインポート

interface StallListProps {
  stalls: any[];
  onStallClick: (stallId: string) => void;
}

const StallList = ({ stalls, onStallClick }: StallListProps) => {
  return (
    <div className={styles.stallList}>
      {stalls.length === 0 ? (
        <p>表示する屋台がありません。</p>
      ) : (
        stalls.map(stall => (
          <div
            key={stall._id}
            className={styles.stallCard}
            onClick={() => onStallClick(stall._id)}
          >
            {/* <img src={stall.storeImageUrl} alt={stall.storeName} className={styles.stallImage} /> */}
            <Image 
              src={stall.storeImageUrl} // URLまたはベース64データ
              alt={stall.storeName}
              className={styles.stallImage}
            />
            <h2>{stall.storeName}</h2>
          </div>
        ))
      )}
    </div>
  );
};

export default StallList;
