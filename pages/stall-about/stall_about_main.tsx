import { useState, useEffect } from 'react';
import styles from '../../styles/Stallabout.module.css';
import { useRouter } from 'next/router';
import StallForm from '../../components/stalls/StallForm';
import StallList from '../../components/stalls/StallList';

const StallAboutMain = () => {
  const [showForm, setShowForm] = useState(false);
  const [stalls, setStalls] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState(1); // 選択された日を管理
  const router = useRouter();

  useEffect(() => {
    fetchStalls();  // 屋台データを取得する関数を呼び出し
  }, []);

  const fetchStalls = async () => {
    try {
      const response = await fetch('/api/StoreData/getter/getAllSTORES_DATA');
      const result = await response.json();
      setStalls(result);
    } catch (error) {
      console.error('Error fetching stalls:', error);
    }
  };

  const addStall = async (stallData: any) => {
    try {
      const response = await fetch('/api/StoreData/setter/createSTORE_DATA', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stallData),
      });

      if (response.ok) {
        const newStall = await response.json();
        setStalls([...stalls, newStall]);
        setShowForm(false); // フォームを閉じる
      }
    } catch (error) {
      console.error('Error saving stall data:', error);
    }
  };

  // 選択された日によって屋台をフィルタリング
  const filteredStalls = stalls.filter(stall => stall.openDay === selectedDay);

  return (
    <div>
      <header className={styles.header}>
        <div className={styles.logo}>NANCA</div>
      </header>
      <main>
        <h1 className={styles.heading}>
          屋台概要
          <button className={styles.addButton} onClick={() => setShowForm(true)}>
            + 追加
          </button>
        </h1>

        {/* 1日目と2日目の選択ボタン */}
        <div className={styles.dayButtons}>
          <button
            className={`${styles.dayButton} ${selectedDay === 1 ? styles.active : ''}`}
            onClick={() => setSelectedDay(1)}
          >
            1日目
          </button>
          <button
            className={`${styles.dayButton} ${selectedDay === 2 ? styles.active : ''}`}
            onClick={() => setSelectedDay(2)}
          >
            2日目
          </button>
        </div>

        {/* 選択された日に基づいて屋台リストを表示 */}
        <StallList stalls={filteredStalls} onStallClick={(stallId) => router.push(`/stall-about/${stallId}`)} />

        {/* 屋台追加フォームを表示 */}
        {showForm && <StallForm onSubmit={addStall} onClose={() => setShowForm(false)} />}
      </main>
    </div>
  );
};

export default StallAboutMain;
