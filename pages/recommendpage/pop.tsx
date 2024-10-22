import { useState, useEffect } from 'react'
import Header from '../../components/header'
import Styles from '../../styles/Home.module.css'
import Image from 'next/image'
import teststyle from '../../styles/recommend.module.css'

interface items {
  id : number;
  stall: string;
  name: string;
  price: number;
  image: string;
}

export function pop() {

  const testitems: items[] = [
    {id: 1, stall: '屋台1', name: '商品1', price: 300, image: '/images/yatai1.png'},
    {id: 2, stall: '屋台2', name: '商品2', price: 200, image: '/images/yatai1.png'},
    {id: 3, stall: '屋台3', name: '商品3', price: 100, image: '/images/yatai1.png'},
    {id: 4, stall: '屋台4', name: '商品4', price: 3100, image: '/images/yatai1.png'},
  ]

  return (
    <div>
      <div className={Styles.container}>
        {/* 屋台一覧を表示 */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
          {testitems.map((src: items) => {
            return(
              <div key={src.id} className='grid relative'>
              <div className={`${teststyle.card} ${
                src.id == 1 ? teststyle.id1: 
                src.id == 2 ? teststyle.id2:
                src.id == 3 ? teststyle.id3:
                src.id == 4 ? teststyle.id4: ''}`}>
                <Image src={src.image} height={280} width={280}alt="test_image" />
                <div>
                  <div className='font-semibold text-3xl'>{src.stall}</div>
                  <div className='font-semibold text-4xl'>{src.name}</div>
                  <div className='font-semibold text-5xl'>&yen;{src.price}</div>
                </div>
              </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default pop;

// ESLintの警告を無効にするためのコメント
// eslint-disable-next-line @typescript-eslint/no-unused-vars
useState;
useEffect;
Header;
