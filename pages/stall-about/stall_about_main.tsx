import { useState } from 'react';
import styles from '../../styles/Stallabout.module.css';



const StallAboutMain = () => {
    const [showForm, setShowForm] = useState(false);

    const handleButtonClick = () => {
        setShowForm(!showForm);
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
                        追加
                    </button>
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
