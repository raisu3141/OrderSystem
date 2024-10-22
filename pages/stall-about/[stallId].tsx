import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/Stallabout.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { debug } from 'console';
import { debugPort } from 'process';

const StallMenuContents = () => {
  const router = useRouter();
  const { stallId } = router.query;
  const [stallData, setStallData] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false); // 更新フォームの表示管理
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [menuName, setMenuName] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [stock, setStock] = useState<number | string>(''); // 在庫
  const [cookTime, setCookTime] = useState<number | string>('');
  const [isSelecting, setIsSelecting] = useState(false); // 選択状態を管理
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]); // 複数選択された商品ID
  const [selectedProduct, setSelectedProduct] = useState<any>(null); // 編集するための商品データ

  useEffect(() => {
    if (stallId) {
      // 初回データ取得
      console.log('Fetching stall data...');
      fetchStallData();
        // サーバーサイドイベント (SSE) のセットアップ
      const eventSource = new EventSource(`/api/Utils/productDataChanges?storeId=${stallId}`);

      // SSEの通信が確立したかの確認
      eventSource.onopen = () => {
        console.log('SSE connection established.');
      };

      // サーバーからメッセージを受信したときの処理
      eventSource.onmessage = (event) => {
        console.log('SSE message received:', event.data);
          try {
            const data = JSON.parse(event.data);
            console.log('Parsed data:', data);
              // 必要に応じてUIを更新
              fetchStallData();  // データを再取得
          } catch (error) {
              console.error('Error parsing data:', error);
          }
      };

      // エラーハンドリング
      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        eventSource.close();  // エラーが発生した場合は接続を閉じる
      };

      // コンポーネントがアンマウントされた時にSSE接続を閉じる
      return () => {
        eventSource.close();
      };
    }
  }, [stallId]);


  const fetchStallData = async () => {
    if (stallId) {
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
    }
  };

  const handleButtonClick = () => {
    setShowForm(!showForm);
  };

  const handleSelectButtonClick = () => {
    setIsSelecting(!isSelecting); // 選択状態を切り替える
    setSelectedProductIds([]); // 状態をリセットする
  };

  const handleSelectProduct = (productId: string) => {
    if (isSelecting) {
      setSelectedProductIds((prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId) // すでに選択されていたら外す
          : [...prev, productId] // 選択されていなかったら追加
      );
    } else{
      // 選択状態でない時は更新フォームを表示
      const selected = stallData?.productList.find((product: any) => product._id === productId);
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
      setStallData((prev: any) => ({
        ...prev,
        productList: prev.productList.filter((product: any) => !selectedProductIds.includes(product._id)),
      }));
      setSelectedProductIds([]); // 選択リセット
    } catch (error) {
      console.error('Error deleting products:', error);
    }
  };

  // ここにhandleStockUpdate関数を追加
  const handleStockUpdate = async (productId: string, newStock: number) => {
    try {
      const response = await fetch(`/api/ProductData/setter/updataPRODUCTS_DATA`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: productId, stock: newStock }),
      });
      

      if (!response.ok) {
        throw new Error('Failed to update stock');
      }

      const updatedProduct = await response.json();

      // 商品データをリアルタイムで更新
      setStallData((prev: any) => ({
        ...prev,
        productList: prev.productList.map((product: any) =>
          product._id === updatedProduct._id ? updatedProduct : product
        ),
      }));
    } catch (error) {
      console.error('Error updating stock:', error);
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
    event.preventDefault(); // デフォルトのフォーム送信動作を無効化
    if (!stallId || typeof stallId !== 'string') {
      console.error('Invalid stallId');
      alert('無効な屋台IDです。');
      return;
    }

    const formData = new FormData();
    formData.append('storeName', stallData.storeName); // storeName を追加
    formData.append('productName', menuName);
    formData.append('price', price.toString());
    formData.append('stock', stock.toString());
    formData.append('cookTime', cookTime.toString());
    formData.append('storeId', stallId.toString());

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput && fileInput.files && fileInput.files[0]) {
      const imageFile = fileInput.files[0]; // ファイルオブジェクトを取得
      formData.append('image', imageFile);
    } else {
      console.error('No file selected or input element not found');
      alert('商品画像が選択されていません。');
    }

    try {
      const response = await fetch('/api/ProductData/setter/postPRODUCTS_DATA', {
        method: 'POST',
        body: formData, // FormData を使用
      });

      if (!response.ok) {
        throw new Error('Failed to save store data');
      }

      const result = await response.json();
      setStallData((prev: any) => ({
        ...prev,
        productList: [...(prev?.productList || []), result], // メニューをリストに追加
      }));
      handleCloseForm(); // フォームを閉じる
    } catch (error) {
      console.error('Error saving store data:', error);
      if (error instanceof Error) {
        alert(`メニューの保存中にエラーが発生しました: ${error.message}`);
      } else {
        alert('メニューの保存中に予期しないエラーが発生しました。');
      }
    }
  };

  // 更新ボタンが押されたときに、選択された商品のデータを編集フォームにセットする関数
  const handleUpdateButtonClick = (product: any) => {
    setSelectedProduct(product); // 編集する商品のデータをセット
    setMenuName(product.productName);
    setPrice(product.price);
    setStock(product.stock);
    setCookTime(product.cookTime);
    setStock(0);
    setShowUpdateForm(true); // 更新フォームを表示
  };

  // 更新フォームの送信を処理する関数
  const handleUpdateFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // デフォルトのフォーム送信動作を無効化

    if (!selectedProduct) {
      console.error('No product selected for update');
      alert('更新する商品が選択されていません。');
      return;
    }

    // ここで在庫の増減の値を取得
    const updateStockAmount = parseInt(stock.toString(), 10); // 何個増やす/減らすか
    const isIncrease = true; // ここで増減を選ぶ（増やす例）
    const updatedProductData = {
      _id: selectedProduct._id,
      productName: menuName,   // 商品名
      price: parseFloat(price.toString()),  // 値段
      cookTime: parseInt(cookTime.toString(), 10),  // 調理時間
    };

    // 在庫を増やすならそのまま、減らすならマイナスに変換
    const updateStook = isIncrease ? updateStockAmount : -updateStockAmount;

    try {
      // 商品名、値段、調理時間の更新APIエンドポイントへリクエストを送信
      const response = await fetch(`/api/ProductData/setter/updataPRODUCTS_DATA`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProductData),  // 更新データを送信
      });

      if (!response.ok) {
        throw new Error('Failed to update product data');
      }

      const updatedProduct = await response.json();

      // 在庫更新のAPIエンドポイントへリクエストを送信
      const stockResponse = await fetch(`/api/ProductData/setter/updataStock?_id=${selectedProduct._id}&updateStook=${updateStook}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!stockResponse.ok) {
        throw new Error('Failed to update product stock');
      }

      const updatedStockProduct = await stockResponse.json();

      // 商品リストをリアルタイムで更新
      setStallData((prev: any) => ({
        ...prev,
        productList: prev.productList.map((product: any) =>
          product._id === updatedStockProduct._id ? updatedStockProduct : product
        ),
      }));

      setShowUpdateForm(false); // 更新フォームを閉じる
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
            {stallData ? (
                `${stallData.storeName}のメニュー`
            ) : (
                <p>データを読み込み中です...</p>
            )}
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

        {/* メニューのリストを表示 */}
        <div className={styles.stallList}>
          {stallData?.productList && stallData.productList.length > 0 ? (
            stallData.productList.map((product: any) => (
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

        {/* 更新フォーム */}
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
