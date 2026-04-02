"use client"

export function scrollToElement(locale,id = 'order-form', options = { behavior: 'smooth', block: 'start' }) {

  if (typeof window === 'undefined') return;

  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView(options);
  } else {
    // Элемента нет на текущей странице — переходим на главную с якорем
    window.location.href = `/${locale}/#${id}`;
  }
}