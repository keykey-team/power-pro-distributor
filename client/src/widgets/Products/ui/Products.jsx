import { getMessages } from '@shared/i18n/getMessages';
import { createI18nServer } from '@shared/i18n/server';
import React from 'react'
import ProductsList from './common/ProductsList';
import Link from 'next/link';

export async function Products({ locale, data }) {
  const messages = await getMessages(locale);
  const { t } = createI18nServer(messages);
  return (
    <div className='products container' id='prods'>
      <h2><span>{t('products.title1')}</span> {t('products.title2')}</h2>

      <div className="preview__button-wrappper">
        {/* Добавляем query параметры к ссылкам */}
        <Link href={{ pathname: "/build-box", query: { limit: 5 } }} className='preview__button'>
          {t('products.btn-5')}
        </Link>

        <Link href={{ pathname: "/build-box", query: { limit: 10 } }} className='preview__button'>
          {t('products.btn-10')}
        </Link>
      </div>

      <ProductsList data={data} locale={locale} />
    </div>
  )
}