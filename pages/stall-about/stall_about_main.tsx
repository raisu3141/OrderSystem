import { useState } from 'react';
import styles from '../../styles/Stallabout.module.css';



const StallAboutMain = () => {
    const [showForm, setShowForm] = useState(false);
    const [selectedDay, setSelectedDay] = useState(1);
    const[uploadedImage, setUploadedImage] = useState<string | null>(null);

    const handleButtonClick = () => {
        setShowForm(!showForm);
    };
    const handleCloseForm = () => {
        setShowForm(false);
        setUploadedImage(null);
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                if (e.target && e.target.result) {
                    setUploadedImage(e.target.result.toString());
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div>
            <header className={styles.header}>
                <div className={styles.logo}>NANCA</div>
            </header>
            <main>
                <h1 className={styles.heading}>
                    屋台概要
                    <button className={styles.addButton} onClick={handleButtonClick}>
                        + 追加
                    </button>
                </h1>
                <div className={styles.dayButtons}>
                    <button
                        className={`${styles.dayButton} ${selectedDay ===1 ? styles.active : ''}`}
                        onClick={() => setSelectedDay(1)}
                    >
                        1日目
                    </button>
                    <button
                        className={`${styles.dayButton} ${selectedDay ===2 ? styles.active : ''}`}
                        onClick={() => setSelectedDay(2)}
                    >
                        2日目
                    </button>
                </div>
                {/* ボタンが押されたときにフォームが表示される */}
                {showForm && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <button className={styles.closeButton} onClick={handleCloseForm}>
                                &times;
                            </button>
                            <h2 className={styles.formTitle}>入力フォーム</h2>
                            <div className={styles.daySelection}>
                                <button
                                    className={`${styles.formDayButton} ${selectedDay === 1 ? styles.formDayButtonActive : ''}`}
                                    onClick={() => setSelectedDay(1)}
                                >
                                    1日目
                                </button>
                                <button
                                    className={`${styles.formDayButton} ${selectedDay === 2 ? styles.formDayButtonActive : ''}`}
                                    onClick={() => setSelectedDay(2)}
                                >
                                    2日目
                                </button>
                            </div>
                            <form className={styles.form}>
                                <label className={styles.uploadLabel}>
                                    屋台画像をアップロードしてください:
                                    <input type="file" name="stallImage" className={styles.uploadInput} onChange={handleImageUpload} />
                                    {uploadedImage ? (
                                        <img src={uploadedImage} alt="Uploaded" className={styles.uploadedImage} />
                                    ) : (
                                        <div className={styles.placeholderBox}>ファイルを選択</div>
                                    )}
                                </label>
                                <label className={styles.stallNameLabel}>
                                    屋台名:
                                    <input type="text" name="stallName" className={styles.stallNameInput} />
                                </label>
                                <button type="submit" className={styles.submitButton}>完了</button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default StallAboutMain;
