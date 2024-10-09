import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import styles from '../../styles/Stallabout.module.css';



const StallAboutMain = () => {
    const [showForm, setShowForm] = useState(false);
    const [selectedDay, setSelectedDay] = useState(1);
    const [isSelected, setIsSelected] = useState(false);

    const handleButtonClick = () => {
        setShowForm(!showForm);
    };

    const handleSelectClick = () => {
        setIsSelected(!isSelected);
    }
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
                <form className={styles.form}>
                    <label>屋台名: <input type="text" name="stallName" /></label>
                    <label>メニュー: <input type="text" name="menu" /></label>
                    <button type="submit">送信</button>
                </form>
                )}
            </main>
        </div>
    );
};

export default StallAboutMain;
