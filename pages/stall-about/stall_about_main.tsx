import { useState, useEffect } from 'react';
import styles from '../../styles/Stallabout.module.css';
import { useRouter } from 'next/router';


const StallAboutMain = () => {
    const [showForm, setShowForm] = useState(false);
    const [selectedDay, setSelectedDay] = useState(1);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [stallName, setStallName] = useState('');  // 屋台名
    const [stalls, setStalls] = useState<any[]>([]);  // 作成された屋台リストを保持
    const router = useRouter();

    const saveStallData = async (stallData: any) => {
        try {
            const response = await fetch('/api/StoreData/setter/createSTORE_DATA', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(stallData),
            });

            if (!response.ok) {
                throw new Error('Failed to save stall data');
            }

            const result = await response.json();
            return result._id;  // 保存された屋台のIDを返す
        } catch (error) {
            console.error('Error saving stall data:', error);
        }
    };

    const fetchStalls = async () => {
        try {
            const response = await fetch('/api/StoreData/getter/getAllSTORES_DATA');
            const result = await response.json();
            setStalls(result);
        } catch (error) {
            console.error('Error fetching stalls:', error);
        }
    };

    useEffect(() => {
        fetchStalls();
    }, []);

    const handleButtonClick = () => {
        setShowForm(!showForm);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setUploadedImage(null);
        setStallName('');
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

    const handleFormSubmit = async (event: React.FormEvent) => {
        event.preventDefault();  // デフォルトのフォーム送信動作を無効化
    
        const formData = new FormData();
        formData.append('storeName', stallName);  // 入力された屋台名
        formData.append('openDay', selectedDay.toString());  // 選択された日
    
        // input 要素が存在するか確認
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput && fileInput.files && fileInput.files[0]) {
            const imageFile = fileInput.files[0];  // ファイルオブジェクトを取得
            formData.append('image', imageFile);
        } else {
            console.error("No file selected or input element not found");
        }
    
        try {
            const response = await fetch('/api/StoreData/setter/createSTORE_DATA', {
                method: 'POST',
                body: formData,  // FormData を使用
            });
    
            if (!response.ok) {
                throw new Error('Failed to save stall data');
            }
    
            const result = await response.json();
            setStalls(prev => [
                ...prev,
                { _id: result._id, storeName: stallName, Image: uploadedImage, openDay: selectedDay }
            ]);
            handleCloseForm();  // フォームを閉じる
        } catch (error) {
            console.error('Error saving stall data:', error);
        }
    };
    
    
    

    const handleStallClick = (stallId: string) => {
        router.push(`/stall-about/${stallId}`);
    };

    // selectedDayに基づいてフィルタリングする
    const filteredStalls = stalls.filter(stall => stall.openDay === selectedDay);

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
                {/* 作成された屋台カードを表示 */}
                <div className={styles.stallList}>
                    {filteredStalls.length === 0 ? (
                        <p>現在、表示する屋台がありません。</p>
                    ) : (
                        filteredStalls.map(stall => (
                            <div key={stall._id} className={styles.stallCard} onClick={() => handleStallClick(stall._id)}>
                                <img src={stall.storeImageUrl} alt={stall.storeName} className={styles.stallImage} />
                                <h2>{stall.storeName}</h2>
                            </div>
                        ))
                    )}
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
                            <form className={styles.form} onSubmit={handleFormSubmit}>
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
                                    <input 
                                        type="text" 
                                        name="stallName" 
                                        className={styles.stallNameInput}
                                        value={stallName}
                                        onChange={(e) => setStallName(e.target.value)}
                                    />
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
