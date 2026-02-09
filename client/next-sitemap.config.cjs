const {
  getAllProducts,
} = require("./src/shared/services/productService.cjs");
const {
  getAllCategory,
} = require("./src/shared/services/categoryService.cjs");

const config = {
  siteUrl: "http:// 192.168.0.106:5002",
  generateRobotsTxt: true,
  changefreq: "daily",
  sitemapSize: 5000,
  exclude: [
    "/admin/*",
    "/api/*",
    "/panel5587436/*",
    "/dashboard/*",
    "/placement/*",
    "/cart/*",
  ],
  additionalPaths: async () => {
    const rawProducts = await getAllProducts();
    const rawCategories = await getAllCategory();

    const products = Array.isArray(rawProducts)
      ? rawProducts
      : rawProducts?.products || [];

    const categories = Array.isArray(
      rawCategories
    )
      ? rawCategories
      : rawCategories?.categories || [];

    // 📦 Пути к товарам
    const productPaths = products
      .filter(
        (p) => p.categoryLink && p.titleLink
      )
      .map((p) => ({
        loc: `/product/${p.categoryLink}/${
          p.subcategoryLink || ""
        }/${p.titleLink}`.replace(/\/+/g, "/"),
      }));

    // 📁 Пути к категориям и подкатегориям
    const categoryPaths = categories.flatMap(
      (cat) => {
        const paths = [];

        if (cat.linkName) {
          // Категория
          paths.push({
            loc: `/catalog/${cat.linkName}`,
          });

          // Подкатегории
          if (Array.isArray(cat.subcategories)) {
            cat.subcategories.forEach((sub) => {
              if (sub.linkName) {
                paths.push({
                  loc: `/catalog/${cat.linkName}/${sub.linkName}`,
                });
              }
            });
          }
        }

        return paths;
      }
    );

    // 📄 Статические страницы
    const staticPages = [
      { loc: "/" },
      { loc: "/info/aboutUs" },
      { loc: "/info/delivery" },
      { loc: "/info/exchange" },
    ];

    return [
      ...staticPages,
      ...categoryPaths,
      ...productPaths,
    ];
  },
};

module.exports = config;
