import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface items {
  id: number;
  stall: string;
  name: string;
  price: number;
  image: string;
}

interface itemsapi {
  storeName: string;
  productName: string;
  productImageUrl: string;
  price: number;
}

const testitems: items[] = [
  {id: 1, stall: '屋台1', name: '商品1', price: 300, image: '/images/yatai1.png'},
  {id: 2, stall: '屋台2', name: '商品2', price: 200, image: '/images/yatai1.png'},
  {id: 3, stall: '屋台3', name: '商品3', price: 100, image: '/images/yatai1.png'},
  {id: 4, stall: '屋台4', name: '商品4', price: 3100, image: '/images/yatai1.png'},
]

async function fetchRecommend(): Promise<itemsapi[]> { 
  const response = await fetch(`/api/Utils/getter/getStoreRecommend`); 
  if (!response.ok) { 
    throw new Error('Failed to fetch orders'); 
  } 
  const data: itemsapi[] = await response.json();

  return data;
}


async function Slider(){
  const data = await fetchRecommend();
  return (
    <div>
      <h1 className='font-semibold text-5xl text-center mt-10'>recommendation</h1>
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
        {data.map((src: itemsapi, index: number) => {
          return (
            <SwiperSlide key={`${index}`} className="mt-10">
              <div className='grid justify-items-center'>
                <div className="
                  border 
                  rounded-lg
                  shadow-md
                  hover:shadow-lg
                  transition-shadow
                  duration-300 
                  relative
                  grid"
                  >
                  <Image src={src.productImageUrl} width={540} height={400} alt="test_image" />
                  <div>
                    <div className='
                      absolute
                      top-0
                      font-semibold 
                      text-5xl 
                      bg-gray-100 
                      bg-opacity-100'
                      >
                      {src.storeName}
                    </div>
                    <div className='
                      absolute
                      bottom-0
                      right-0
                      font-semibold 
                      text-5xl 
                      bg-gray-100 
                      bg-opacity-100'
                      >
                      {src.productName} &yen;{src.price}
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
