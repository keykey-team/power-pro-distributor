import { getMessages } from '@shared/i18n/getMessages';
import { createI18nServer } from '@shared/i18n/server';
import React from 'react'
import ProductsList from './common/ProductsList';

export async function Products({ locale }) {
  const messages = await getMessages(locale);
  const { t } = createI18nServer(messages);
  return (
    <div className='products container'>
      <h2><span>{t('products.title1')}</span> {t('products.title2')}</h2>
      <button className='preview__button'>{t('products.btn')}</button>
      <ProductsList/>
    </div>
  )
}