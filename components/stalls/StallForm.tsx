import { useState } from 'react';
import styles from '../../styles/Stallabout.module.css';

interface StallFormProps {
  onSubmit: (stallData: any) => void;
  onClose: () => void;
}

const StallForm = ({ onSubmit, onClose }: StallFormProps) => {
  const [stallName, setStallName] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(1); // 1日目 or 2日目の選択

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target && e.target.result) {
          setUploadedImage(e.target.result.toString()); // アップロードされた画像のプレビュー
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const stallData = {
      storeName: stallName,
      storeImageUrl: uploadedImage,
      openDay: selectedDay,  // 選択された日
    };
    onSubmit(stallData);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        <h2 className={styles.formTitle}>屋台を追加</h2>
        <form onSubmit={handleSubmit}>
          {/* 1日目、2日目の選択ボタン */}
          <div className={styles.daySelection}>
            <button
              type="button"
              className={`${styles.formDayButton} ${selectedDay === 1 ? styles.formDayButtonActive : ''}`}
              onClick={() => setSelectedDay(1)}
            >
              1日目
            </button>
            <button
              type="button"
              className={`${styles.formDayButton} ${selectedDay === 2 ? styles.formDayButtonActive : ''}`}
              onClick={() => setSelectedDay(2)}
            >
              2日目
            </button>
          </div>

          <label className={styles.uploadLabel}>
            画像をアップロード:
            <input type="file" onChange={handleImageUpload} />
          </label>

          {uploadedImage && (
            <div className={styles.imagePreview}>
              <img src={uploadedImage} alt="プレビュー" className={styles.uploadedImage} />
            </div>
          )}

          <label className={styles.stallNameLabel}>
            屋台名:
            <input
              type="text"
              value={stallName}
              onChange={(e) => setStallName(e.target.value)}
              className={styles.stallNameInput}
            />
          </label>
          <button type="submit" className={styles.submitButton}>追加</button>
        </form>
      </div>
    </div>
  );
};

export default StallForm;
