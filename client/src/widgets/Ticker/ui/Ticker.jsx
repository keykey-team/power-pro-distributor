"use client"

import React from 'react'
import ScrollVelocity from './common/ScrollVelocity'
import { useI18n } from '@shared/i18n/use-i18n';
import Image from 'next/image';

const Ticker = () => {
  const { t } = useI18n();
  return (
    <div className='ticker'>
      <div className="ticker__bg-power">
        <Image src={"/img/frame-power.png"} alt='' width={1578} height={422} />
      </div>
      <div className="ticker__bg">
        <ScrollVelocity
          texts={[`${t('ticker')}`]}
          velocity={100}
          className="custom-scroll-text"
        />
      </div>
    </div>
  )
}

export default Ticker
