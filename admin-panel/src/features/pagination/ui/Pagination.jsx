import React from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

// Убедитесь, что путь до конфига правильный
// import { COUNT_PAGINATION } from "../config/CountPagination";

export default function CatalogPagination({ data }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const pathname = location.pathname;
  console.log(data, "data в CatalogPagination");
  if(!data || !data.page  || !data.total || !data.limit) {
    return null; // или можно отобразить заглушку/сообщение об ошибке
  }

  const currentPage = data.page;
  const totalPages = data.pages || data.totalPages;
  const totalItems = data.total; // если не используется, можно удалить
  const limit = data.limit;
  
  // Функция для обновления страницы в URL
  const goToPage = (pageNumber) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber);
    navigate(`${pathname}?${params.toString()}`);
  };

  // Показать ещё (увеличение лимита)
  const loadMore = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", limit + 24);
    navigate(`${pathname}?${params.toString()}`);
  };

  // Генерация массива страниц для отображения
  const getPagesArray = () => {
    const pages = [];

    if (totalPages <= 7) {
      // Если страниц мало, показываем все
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Всегда показываем первую страницу
      pages.push(1);

      if (currentPage > 3) {
        pages.push("dots");
      }

      // Диапазон вокруг текущей страницы
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("dots");
      }

      // Всегда показываем последнюю страницу
      pages.push(totalPages);
    }

    return pages;
  };

  const pagesArray = getPagesArray();

  return (
    <div className="catalog-pagination">
      
    

      {/* Навигация по страницам */}
      <div className="catalog-pagination__wrapper">
        {pagesArray.map((page, index) => {
          if (page === "dots") {
            return (
              <span key={`dots-${index}`} className="catalog-pagination__dots">
                …
              </span>
            );
          }

          return (
            <button
              key={page}
              type="button"
              className={`catalog-pagination__item ${
                currentPage === page ? "is-active" : ""
              }`}
              onClick={() => goToPage(page)}
              aria-current={currentPage === page ? "page" : undefined}
            >
              <p>{page}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}