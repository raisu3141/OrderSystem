import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import styles from '../../styles/Stallabout.module.css';



const StallAboutMain = () => {
    const [showForm, setShowForm] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [isSelected, setIsSelected] = useState(false);

    const handleButtonClick = () => {
        setShowForm(!showForm);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setUploadedImage(null);
    }

    const handleSelectClick = () => {
        setIsSelected(!isSelected);
    }

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
                    屋台メニュー一覧
                    <div className={styles.buttonContainer}>
                        <FontAwesomeIcon icon={faTrash} className={styles.trashIcon} />
                        <button
                            className={`${styles.selectButton} ${isSelected ? styles.cancel : ''}`}
                            onClick={handleSelectClick}
                        >
                            {isSelected ? 'キャンセル' : '選択'}
                        </button>
                        <button className={styles.addButton} onClick={handleButtonClick}>
                            + 追加
                        </button>
                    </div>
                </h1>
                {/* ボタンが押されたときにフォームが表示される */}
                {showForm && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <button className={styles.closeButton} onClick={handleCloseForm}>
                                &times;
                            </button>
                            <h2 className={styles.formTitle}>入力フォーム</h2>
                            <form className={styles.form}>
                                <label className={styles.uploadLabel}>
                                    商品画像をアップロード:
                                    <input type="file" name="menuImage" className={styles.uploadInput} onChange={handleImageUpload} />
                                    {uploadedImage ? (
                                        <img src={uploadedImage} alt="Uploaded" className={styles.uploadedImage} />
                                    ) : (
                                        <div className={styles.placeholderBox}>ファイルを選択</div>
                                    )}
                                </label>
                                <label className={styles.stallNameLabel}>
                                    商品名:
                                    <input type="text" name="menuName" className={styles.stallNameInput} />
                                </label>
                                <label className={styles.priceLabel}>
                                    値段(円):
                                    <input type="number" name="price" className={styles.priceInput} />
                                </label>
                                <label className={styles.stockLabel}>
                                    在庫数(個):
                                    <input type="number" name="stock" className={styles.stockInput} />
                                </label>
                                <label className={styles.timeLabel}>
                                    調理時間(分):
                                    <input type="number" name="time" className={styles.timeInput} />
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
