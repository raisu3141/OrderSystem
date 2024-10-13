import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/Stallabout.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const StallMenuContents = () => {
  const router = useRouter();
  const { stallId } = router.query; // URLからstallIdを取得
  const [stallData, setStallData] = useState<any>(null); // 屋台データを保持するステート
  const [showForm, setShowForm] = useState(false); // フォームの表示非表示
  const [uploadedImage, setUploadedImage] = useState<string | null>(null); // アップロードされた画像
  const [menuName, setMenuName] = useState(''); // メニュー名
  const [price, setPrice] = useState<number | string>(''); // 値段
  const [stock, setStock] = useState<number | string>(''); // 在庫
  const [cookTime, setCookTime] = useState<number | string>(''); // 調理時間

  // 該当のstallIdに基づいて屋台データを取得
  useEffect(() => {
    if (stallId) {
      const fetchStallData = async () => {
        try {
          const response = await fetch('/api/StoreData/getter/getOneSTORE_DATA', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ _id: stallId }),
          });
          const result = await response.json();
          setStallData(result);
        } catch (error) {
          console.error('Error fetching stall data:', error);
        }
      };
      fetchStallData();
    }
  }, [stallId]);

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

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const menuData = {
      menuName,
      price: Number(price),
      stock: Number(stock),
      cookTime: Number(cookTime),
      productImageUrl: uploadedImage, // 画像のアップロードURL
      stallId, // 屋台IDと紐づける
    };

    try {
      const response = await fetch('/api/MenuData/setter/createMenu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(menuData),
      });

      if (!response.ok) {
        throw new Error('Failed to save menu data');
      }

      const result = await response.json();
      setStallData((prev: any) => ({
        ...prev,
        productList: [...(prev?.productList || []), result], // メニューをリストに追加
      }));
      handleCloseForm(); // フォームを閉じる
    } catch (error) {
      console.error('Error saving menu data:', error);
    }
  };

  // データが存在しないときの対応
  if (!stallData) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <header className={styles.header}>
        <div className={styles.logo}>NANCA</div>
      </header>
      <main>
        <h1 className={styles.heading}>
            <div className={styles.backButton} onClick={() => router.back()}>
                &lt;
            </div>        
            {stallData.storeName}のメニュー一覧
            <div className={styles.buttonContainer}>
                <FontAwesomeIcon icon={faTrash} className={styles.trashIcon} />
                <button className={styles.addButton} onClick={handleButtonClick}>
                + メニュー追加
                </button>
            </div>
        </h1>

        {/* メニューのリストを表示 */}
        <div className={styles.menuList}>
          {stallData?.productList?.length === 0 ? (
            <p>メニューがありません。</p>
          ) : (
            stallData?.productList?.map((product: any) => (
              <div key={product._id} className={styles.menuItem}>
                <img src={product.productImageUrl} alt={product.productName} className={styles.productImage} />
                <h2>{product.productName}</h2>
                <p>値段: {product.price}円</p>
                <p>在庫: {product.stock}個</p>
                <p>調理時間: {product.cookTime}分</p>
              </div>
            ))
          )}
        </div>

        {/* メニュー追加フォーム */}
        {showForm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <button className={styles.closeButton} onClick={handleCloseForm}>
                &times;
              </button>
              <h2 className={styles.formTitle}>メニュー入力フォーム</h2>
              <form className={styles.form} onSubmit={handleFormSubmit}>
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
                  <input
                    type="text"
                    name="menuName"
                    className={styles.stallNameInput}
                    value={menuName}
                    onChange={(e) => setMenuName(e.target.value)}
                  />
                </label>
                <label className={styles.priceLabel}>
                  値段(円):
                  <input
                    type="number"
                    name="price"
                    className={styles.priceInput}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </label>
                <label className={styles.stockLabel}>
                  在庫数(個):
                  <input
                    type="number"
                    name="stock"
                    className={styles.stockInput}
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </label>
                <label className={styles.timeLabel}>
                  調理時間(分):
                  <input
                    type="number"
                    name="time"
                    className={styles.timeInput}
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                  />
                </label>
                <button type="submit" className={styles.submitButton}>
                  完了
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StallMenuContents;
