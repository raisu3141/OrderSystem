import { useState, useEffect } from 'react';
import styles from '../../styles/Stallabout.module.css';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Header from '../../components/header'

export interface PRODUCT {
    _id: string;
    storeId: string;
    productName: string;
    productImageUrl: string;
    price: number;
    cookTime: number;
    stock: number;
    soldCount: number;
}

export interface STORE {
    _id: string;
    storeName: string;
    storeImageUrl: string;
    productList: PRODUCT[];
    storeWaitTime: number;
    openDay: number;
    storeOrder: string;
}

const StallAboutMain = () => {
    const [showForm, setShowForm] = useState(false);
    const [selectedDay, setSelectedDay] = useState(1);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [stallName, setStallName] = useState('');  // 屋台名
    const [stalls, setStalls] = useState<STORE[]>([]);  // 作成された屋台リストを保持
    const router = useRouter();

    const fetchStalls = async () => {
        try {
            const response = await fetch('/api/StoreData/getter/getAllSTORES_DATA');
            if (!response.ok) {
                throw new Error('Failed to fetch stalls');
            }
            const result: STORE[] = await response.json();
            setStalls(result);
        } catch (error: unknown) {
            if (error instanceof Error) {
                alert(`屋台データ取得中にエラーが発生しました: ${error.message}`);
                console.error('Error fetching stalls:', error);
            }
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
    
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput && fileInput.files && fileInput.files[0]) {
            const imageFile = fileInput.files[0];  // ファイルオブジェクトを取得
            formData.append('image', imageFile);
        } else {
            alert("画像が選択されていません。");
            return;  // 画像がない場合、処理を中断してデータベースに追加しない
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
            
            // データベースに成功して保存された場合のみ、屋台リストに追加
            setStalls(prev => [
                ...prev,
                { _id: result._id, storeName: stallName, storeImageUrl: uploadedImage || '', productList: [], storeWaitTime: 0, openDay: selectedDay, storeOrder: result.storeOrder }
            ]);

            // 新規屋台の画像がすぐに表示されるようにするため、強制的に再読み込みを実行
            fetchStalls();
    
            handleCloseForm();  // フォームを閉じる
        } catch (error: unknown) {
            if (error instanceof Error) {
                alert(`保存中にエラーが発生しました: ${error.message}`);
                console.error('Error saving stall data:', error);
            }
        }
    };
    

    const handleStallClick = (stallId: string) => {
        router.push(`/stall-about/${stallId}`);
    };

    // selectedDayに基づいてフィルタリングする
    const filteredStalls = stalls.filter(stall => stall.openDay === selectedDay);

    return (
        <div>
            <Header />
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
                                {/* <img src={stall.storeImageUrl} alt={stall.storeName} className={styles.stallImage} />*/}
                                <div className={styles.imageContainer}>
                                    <Image
                                        src={stall.storeImageUrl || "/placeholder.jpg"}
                                        alt={stall.storeName}
                                        layout="fill"
                                        objectFit="cover"
                                        className={styles.stallImage}                                    
                                    />
                                </div>
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
                                    {/* 画像がアップロードされていない場合のみ、テキストを表示 */}
                                    {!uploadedImage && (
                                        <span className={styles.uploadText}>
                                            屋台画像をアップロード
                                        </span>
                                    )}
                                    <input
                                        type="file"
                                        name="stallImage"
                                        className={styles.uploadInput}
                                        onChange={handleImageUpload}
                                    />
                                    <div className={styles.imageContainer}>
                                        {uploadedImage ? (
                                            <Image
                                                src={uploadedImage}
                                                alt="Uploaded"
                                                layout="fill"
                                                objectFit="cover"
                                                className={styles.uploadedImage}
                                            />
                                        ) : (
                                            <div className={styles.placeholderBox}></div>
                                        )}
                                    </div>
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
