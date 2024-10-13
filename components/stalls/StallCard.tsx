import React from 'react';
import styles from '../../styles/Stallabout.module.css';

interface StallCardProps {
  stalls: Array<{
    _id: string;
    storeName: string;
    storeImageUrl: string;
    openDay: number;
  }>;
  onStallClick: (stallId: string) => void;
}

const StallCards = ({ stalls, onStallClick }: StallCardProps) => {
  return (
    <div className={styles.stallList}>
      {stalls.length === 0 ? (
        <p>現在、表示する屋台がありません。</p>
      ) : (
        stalls.map((stall) => (
          <div
            key={stall._id}
            className={styles.stallCard}
            onClick={() => onStallClick(stall._id)}
          >
            <img
              src={stall.storeImageUrl}
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

export default StallCards;
