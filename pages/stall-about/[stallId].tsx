import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/Stallabout.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

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

const StallMenuContents = () => {
  const router = useRouter();
  const { stallId } = router.query; // ルーターからstallIdを取得
  const [stallData, setStallData] = useState<STORE | null>(null);
  const [resolvedStallId, setResolvedStallId] = useState<string | null>(null); // stallIdの状態管理
  const [showForm, setShowForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false); // 更新フォームの表示管理
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [menuName, setMenuName] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [stock, setStock] = useState<number | string>(''); // 在庫
  const [cookTime, setCookTime] = useState<number | string>('');
  const [isSelecting, setIsSelecting] = useState(false); // 選択状態を管理
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]); // 複数選択された商品ID
  const [selectedProduct, setSelectedProduct] = useState<PRODUCT | null>(null); // 編集するための商品データ

  // stallIdが確実に取得できるまで待つ
  useEffect(() => {
    if (stallId && typeof stallId === 'string') {
      setResolvedStallId(stallId); // stallIdが取得できたら状態を更新
    }
  }, [stallId]);

  // stallIdが取得できたらデータをフェッチ
  useEffect(() => {
    if (resolvedStallId) {
      console.log('Fetching stall data...');
      fetchStallData(resolvedStallId);
      const eventSource = new EventSource(`/api/Utils/productDataChanges?storeId=${resolvedStallId}`);

      eventSource.onopen = () => {
        console.log('SSE connection established.');
      };

      eventSource.onmessage = (event) => {
        console.log('SSE message received:', event.data);
        try {
          const data = JSON.parse(event.data);
          console.log('Parsed data:', data);
          fetchStallData(resolvedStallId); // データを再取得
        } catch (error) {
          console.error('Error parsing data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        eventSource.close(); // エラーが発生した場合は接続を閉じる
      };

      return () => {
        eventSource.close();
      };
    }
  }, [resolvedStallId]);

  const fetchStallData = async (stallId: string) => {
    try {
      const response = await fetch('/api/StoreData/getter/getOneSTORE_DATA', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: stallId }),
      });
      if (!response.ok) {
        console.error('Error fetching stall data:', await response.text());
        return;
      }
      const result = await response.json();
      setStallData(result);
    } catch (error) {
      console.error('Error fetching stall data:', error);
    }
  };

  const handleButtonClick = () => {
    setShowForm(!showForm);
  };

  const handleSelectButtonClick = () => {
    setIsSelecting(!isSelecting);
    setSelectedProductIds([]);
  };

  const handleSelectProduct = (productId: string) => {
    if (isSelecting) {
      setSelectedProductIds((prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId) // すでに選択されていたら外す
          : [...prev, productId] // 選択されていなかったら追加
      );
    } else {
      // 選択状態でない時は更新フォームを表示
      const selected = stallData?.productList.find((product: PRODUCT) => product._id === productId);
      if (selected) {
        handleUpdateButtonClick(selected);
      }
    }
  };

  const handleDeleteSelectedProducts = async () => {
    if (selectedProductIds.length === 0) return;

    try {
      await Promise.all(
        selectedProductIds.map(async (productId) => {
          const response = await fetch(`/api/ProductData/setter/deletePRODUCTS_DATA`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ _id: productId }),
          });
          if (!response.ok) {
            throw new Error('Failed to delete product');
          }
        })
      );
      setStallData((prev) =>
        prev
          ? {
              ...prev,
              productList: prev.productList.filter((product) => !selectedProductIds.includes(product._id)),
            }
          : null
      );
      setSelectedProductIds([]);
    } catch (error) {
      console.error('Error deleting products:', error);
    }
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
    event.preventDefault();
    if (!resolvedStallId) {
      console.error('Invalid stallId');
      alert('無効な屋台IDです。');
      return;
    }

    const formData = new FormData();
    formData.append('storeName', stallData!.storeName);
    formData.append('productName', menuName);
    formData.append('price', price.toString());
    formData.append('stock', stock.toString());
    formData.append('cookTime', cookTime.toString());
    formData.append('storeId', resolvedStallId);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput && fileInput.files && fileInput.files[0]) {
      const imageFile = fileInput.files[0];
      formData.append('image', imageFile);
    } else {
      console.error('No file selected or input element not found');
      alert('商品画像が選択されていません。');
    }

    try {
      const response = await fetch('/api/ProductData/setter/postPRODUCTS_DATA', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to save store data');
      }

      const result = await response.json();
      setStallData((prev) =>
        prev ? { ...prev, productList: [...prev.productList, result] } : null
      );
      handleCloseForm();
    } catch (error) {
      console.error('Error saving store data:', error);
      if (error instanceof Error) {
        alert(`メニューの保存中にエラーが発生しました: ${error.message}`);
      } else {
        alert('メニューの保存中に予期しないエラーが発生しました。');
      }
    }
  };

  const handleUpdateButtonClick = (product: PRODUCT) => {
    setSelectedProduct(product);
    setMenuName(product.productName);
    setPrice(product.price);
    setStock(0); // デフォルト値
    setCookTime(product.cookTime);
    setShowUpdateForm(true);
  };

  const handleUpdateFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedProduct) {
      console.error('No product selected for update');
      alert('更新する商品が選択されていません。');
      return;
    }

    const updateStockAmount = parseInt(stock.toString(), 10);
    const updatedProductData = {
      _id: selectedProduct._id,
      productName: menuName,
      price: parseFloat(price.toString()),
      cookTime: parseInt(cookTime.toString(), 10),
    };

    try {
      const response = await fetch(`/api/ProductData/setter/updataPRODUCTS_DATA`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProductData),
      });

      if (!response.ok) {
        throw new Error('Failed to update product data');
      }

      const updatedProduct = await response.json();

      const stockResponse = await fetch(
        `/api/ProductData/setter/updataStock?_id=${selectedProduct._id}&updateStook=${updateStockAmount}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!stockResponse.ok) {
        throw new Error('Failed to update product stock');
      }

      const updatedStockProduct = await stockResponse.json();

      setStallData((prev) =>
        prev
          ? {
              ...prev,
              productList: prev.productList.map((product) =>
                product._id === updatedStockProduct._id ? updatedStockProduct : product
              ),
            }
          : null
      );

      setShowUpdateForm(false);
    } catch (error) {
      console.error('Error updating product data or stock:', error);
      if (error instanceof Error) {
        alert(`更新中にエラーが発生しました: ${error.message}`);
      } else {
        alert('更新中に予期しないエラーが発生しました。');
      }
    }
  };

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
            {stallData ? `${stallData.storeName}のメニュー` : <p>データを読み込み中です...</p>}
          </div>
          <div className={styles.buttonContainer}>
            <FontAwesomeIcon icon={faTrash} className={styles.trashIcon} onClick={handleDeleteSelectedProducts} />
            <button className={styles.selectButton} onClick={handleSelectButtonClick}>
              {isSelecting ? '選択キャンセル' : '選択'}
            </button>
            <button className={styles.addButton} onClick={handleButtonClick}>
              + メニュー追加
            </button>
          </div>
        </h1>

        <div className={styles.stallList}>
          {stallData?.productList && stallData.productList.length > 0 ? (
            stallData.productList.map((product) => (
              <div
                key={product._id}
                className={`${styles.stallCard} ${selectedProductIds.includes(product._id) ? styles.selectedCard : ''}`}
                onClick={() => handleSelectProduct(product._id)}
              >
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

        {showUpdateForm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <button className={styles.closeButton} onClick={() => setShowUpdateForm(false)}>
                &times;
              </button>
              <h2 className={styles.formTitle}>メニュー更新フォーム</h2>
              <form className={styles.form} onSubmit={handleUpdateFormSubmit}>
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
                  在庫調整(プラス何個):
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
                  更新完了
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
