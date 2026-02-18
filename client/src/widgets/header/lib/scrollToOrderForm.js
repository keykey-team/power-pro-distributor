export const scrollToOrderForm = (options = { behavior: 'smooth', block: 'start' }) => {
  if (typeof window === 'undefined') return;

  const element = document.getElementById('order-form');
  if (element) {
    // Форма есть на текущей странице – просто скроллим
    element.scrollIntoView(options);
  } else {
    // Формы нет – переходим на главную с якорем
    window.location.href = '/#order-form';
  }
};