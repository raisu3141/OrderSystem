import { useState, useEffect } from 'react';
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import teststyle from '../../styles/recommend.module.css'
import { useRouter } from 'next/router';  // 追加: useRouterのインポート

interface items {
  storeName: string;
  productName: string;
  productImageUrl: string;
  price: number;
}

const testitems: items[] = [
  {storeName: '屋台1', productName: 'product1', price: 300, productImageUrl: '/images/yatai1.png'},
  {storeName: '屋台2', productName: 'p2', price: 200, productImageUrl: '/images/yatai1.png'},
  {storeName: '屋台3', productName: 'p3', price: 100, productImageUrl: '/images/yatai1.png'},
  {storeName: '屋台4', productName: 'p4', price: 3100, productImageUrl: '/images/yatai1.png'},
]

export function Slider(){
  
  const router = useRouter();  // ページ遷移用のルーター

  const [stallData, setStallData] = useState<items[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendData();

    const fetchIntervalId = setInterval(() => {
      fetchRecommendData();
    }, 10000); // 10秒ごとに変更
    
    

    return () => {
      clearInterval(fetchIntervalId);
    };  
  }, [stallData.length]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      router.push('/ranking/SalesRanking'); // 60秒後にページ遷移
    }, 60 * 1000); // 60秒 = 60000ms

    return () => clearTimeout(timeoutId); // コンポーネントがアンマウントされる際にタイマーをクリア
  }, [router]);

  const fetchRecommendData = async () => {
    try {
      const response = await fetch('/api/Utils/getStoreRecommend', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      setStallData(result);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stall data:', error);
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className='bg-blue-900 w-screen h-screen' style={{background: "url(/images/recommendbg.png)", backgroundSize: "cover"}}>
        <div className='flex justify-center'>
          <Image src='/images/recommendtitle.png' width={500} height={200} alt='recommend'/>
        </div>
        <div className={`${teststyle.neontext} text-center text-white text-4xl font-bold mt-1`}>loading...</div>
      </div>
    );  // データがロード中の表示
  }

  return (
    <div className='bg-blue-900 w-screen h-screen' style={{background: "url(/images/recommendbg.png)", backgroundSize: "cover"}}>
      <div className='flex justify-center'>
        <Image src='/images/recommendtitle.png' width={500} height={200} alt='recommend'/>
      </div>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        slidesPerView={2} //一度に表示するスライドの数
        pagination={{
          clickable: true,
        }} //何枚目のスライドかを示すアイコン、スライドの下の方にある
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
      >
        {stallData.map((src: items, index: number) => {
          return (
            <SwiperSlide key={`${index}`} className="my-5">
              <div className="flex justify-center items-center" >
                <div className="w-540 h-400 
                  flex justify-center items-center 
                  text-sky-200 
                  border-2 rounded-lg border-sky-200 
                  shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f]">
                  <div className={`flex  items-center justify-center  rounded-lg relative p-10`}>
                    <div className={`${teststyle.neonborder} relative bg-white rounded-lg`}>
                      <Image
                        src={src.productImageUrl}
                        width={300}
                        height={300}
                        alt={src.productName}
                        className="rounded-lg"
                      />
                    </div>
                    <div className={`${teststyle.neontext} mt-4 text-center text-white pl-14`}>  {/* テキストを中央に配置 */}
                      <div className={`text-3xl font-semibold pb-8`}>
                        {src.storeName}
                      </div>
                      <div className={`text-4xl font-bold mt-1 pb-8`}>
                        {src.productName}
                      </div>
                      <div className={`text-5xl font-extrabold mt-2`}>
                        &yen;  {src.price}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          )
        })}
      </Swiper>
    </div>
  )
}

export default Slider