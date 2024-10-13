import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/Stallabout.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const StallMenuContents = () => {
  const router = useRouter();
  const { stallId } = router.query;
  const [stallData, setStallData] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [menuName, setMenuName] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [stock, setStock] = useState<number | string>('');
  const [cookTime, setCookTime] = useState<number | string>('');
  

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
          console.log('Fetched stall data:', result);
          console.log('Product list:', result.productList); // productList の内容を確認
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
    setMenuName('');
    setPrice('');
    setStock('');
    setCookTime('');
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
    if (!stallId || typeof stallId !== 'string') {
        console.error('Invalid stallId');
        return;
    }
  
    const formData = new FormData();
    formData.append('storeName', stallData.storeName);  // storeName を追加
    formData.append('openDay', stallData.openDay.toString());  // openDay を追加
    formData.append('productName', menuName);
    formData.append('price', price.toString());
    formData.append('stock', stock.toString());
    formData.append('cookTime', cookTime.toString());
    formData.append('storeId', stallId.toString());
  
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput && fileInput.files && fileInput.files[0]) {
      const imageFile = fileInput.files[0];  // ファイルオブジェクトを取得
      formData.append('image', imageFile);
    } else {
      console.error("No file selected or input element not found");
    }
  
    try {
      const response = await fetch('/api/ProductData/setter/postPRODUCTS_DATA', {
        method: 'POST',
        body: formData,  // FormData を使用
      });
  
      if (!response.ok) {
        throw new Error('Failed to save store data');
      }
  
      const result = await response.json();
      setStallData((prev: any) => ({
        ...prev,
        productList: [...(prev?.productList || []), result],  // メニューをリストに追加
      }));
      handleCloseForm();  // フォームを閉じる
    } catch (error) {
      console.error('Error saving store data:', error);
    }
  };

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
          <div className={styles.leftContainer}>
            <div className={styles.backButton} onClick={() => router.back()}>
              &lt;
            </div>
            {stallData.storeName}のメニュー一覧
          </div>
          <div className={styles.buttonContainer}>
            <FontAwesomeIcon icon={faTrash} className={styles.trashIcon} />
            <button className={styles.addButton} onClick={handleButtonClick}>
              + メニュー追加
            </button>
          </div>
        </h1>

        {/* メニューのリストを表示 */}
        <div className={styles.stallList}>
            {stallData?.productList && stallData.productList.length > 0 ? (
                stallData.productList.map((product: any) => (
                    <div key={product._id} className={styles.stallCard}>
                        <img src={product.productImageUrl} alt={product.productName} className={styles.stallImage} />
                        <h2>{product.productName}</h2>
                        <p>値段: {product.price}円</p>
                        <p>在庫: {product.stock}個</p>
                        <p>調理時間: {product.cookTime}分</p>
                    </div>
                ))
            ) : (
                <p>メニューがありません。</p>
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
                    name="cookTime"
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
