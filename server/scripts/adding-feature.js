// models/Product.model.js
import mongoose from "mongoose";
import { Product } from "../models/Product.model.js";  // или другой путь для твоей модели

// Подключение к базе данных
const uri = 'mongodb+srv://powerprodistributor_db_user:h1PbSaQwsLYwFFsZ@cluster0.31z2fg2.mongodb.net/?appName=Cluster0';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
    updateFeatures(); // Запуск обновления после успешного подключения
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const updateFeatures = async () => {
  const features = {
    "fitwin-pistachio-cream-60g": [
      "38% mliečnej bielkovej zmesi",
      "Obsahuje sladidlo (maltitol, glykozidy steviolu)",
      "Obsahuje 2% pistácií",
      "Bez pridaného cukru, s nízkym obsahom tuku"
    ],
    "fitwin-cookies-cream-60g": [
      "38% mliečnej bielkovej zmesi",
      "Obsahuje sladidlo (maltitol, glykozidy steviolu)",
      "Chuť čokoládových sušienok s krémom",
      "Obsahuje kakaový prášok a 2% kakaa"
    ],
    "fitwin-caramel-peanuts-60g": [
      "38% mliečnej bielkovej zmesi",
      "Obsahuje 6,7% arašidov",
      "Sladidlo (maltitol, glykozidy steviolu) bez cukru",
      "Chuť karamelu s arašidmi"
    ],
    "crunch-bar-šokolád-molocná-karamel-50g": [
      "25% bielkovej zmesi",
      "Kakaový prášok so zníženým obsahom tuku",
      "24% sladidiel",
      "Chuť mliečnej čokolády s karamelom"
    ],
    "crunch-bar-liči-polovica-50g": [
      "25% bielkovej zmesi",
      "Chuť liči a jahody",
      "Obsahuje izomalt-oligosacharidy ako zdroj vlákniny",
      "Biela poleva s prírodnými arómami"
    ],
    "crunch-bar-morozivo-solená-karamel-50g": [
      "25% bielkovej zmesi",
      "Chuť slaného karamelového zmrzliny",
      "Obsahuje izomalt-oligosacharidy",
      "Obsahuje prírodné arómy a emulgátory"
    ],
    "proteínový-batonček-32%bielka-orech-60g": [
      "32% bielkovej zmesi",
      "Obsahuje 12% lieskových orechov",
      "Bez cukru, s maltitolom",
      "Chuť orecha s čokoládovou polevou"
    ],
    "proteínový-batonček-32%bielka-makadamia-60g-bez-cukru": [
      "32% bielkovej zmesi",
      "Chuť makadamie",
      "Bez pridaného cukru",
      "Obsahuje 4% makadamie"
    ],
    "proteínový-batonček-vegan-32%bielka-s-orechami-suchofruktami-60g-bez-cukru": [
      "32% bielkovej zmesi z rastlinných zdrojov",
      "Obsahuje 12% lieskových orechov",
      "Obsahuje sušené ovocie (hrozienka)",
      "Bez cukru, s glykozidmi steviolu"
    ],
    "proteínový-batonček-paste-bar-s-mandlovou-pastou-45g": [
      "Obsahuje 32% mandľovej pasty",
      "32% bielkovín (zloženie: kolagén, srvátkový a kazeínový bielok)",
      "Chuť vanilky s karamelom",
      "Môže obsahovať stopy orechov a arašidov"
    ],
    "proteínový-batonček-paste-bar-s-kunžutovou-pastou-45g": [
      "Obsahuje 32% pasty zo sezamových semien",
      "Bielková zmes s izomalt-oligosacharidmi",
      "Chuť vanilky a karamelu",
      "Môže obsahovať stopy arašidov a iných orechov"
    ],
    "proteínový-batonček-paste-bar-s-pastou-vlašských-orechov-45g": [
      "Obsahuje 32% pasty z vlašských orechov",
      "32% bielkovín (zloženie: kolagén, srvátkový a kazeínový bielok)",
      "Chuť vanilky s karamelom",
      "Obsahuje orechy a môžu obsahovať stopy iných orechov"
    ],
    "vuglevodný-batonček-coconut-bar-50g": [
      "Obsahuje 37% kokosu",
      "Bez cukru, s použitím izomalt-oligosacharidov",
      "Obsahuje 23% fruktooligosacharidov",
      "Chuť kokosu s karamelom"
    ],
    "vuglevodný-batonček-coconut-bar-vegan-chia-50g": [
      "Obsahuje 37% kokosu",
      "Obsahuje 12% semien chia",
      "Bez cukru",
      "Chuť kokosu"
    ],
    "batonček-proteínový-brisee-s-arahísom-v-karameli-55g": [
      "25% bielkovín",
      "Obsahuje 20% arašidov v karamele",
      "Izomalt-oligosacharidy ako sladidlo",
      "Chuť arašidov v karamele"
    ],
    "batonček-proteínový-brisee-s-kokosom-55g": [
      "25% bielkovín",
      "Kokosový tuk a kokosový krém",
      "Bez pridaného cukru",
      "Kokosová chuť s karamelom"
    ],
    "batonček-proteínový-brisee-s-polovici-55g": [
      "25% bielkovín",
      "Chuť jahodového konfitového náplne",
      "Izomalt-oligosacharidy ako sladidlo",
      "Extrudované chrumky"
    ],
    "batonček-proteínový-brisee-s-visňovým-konfitom-55g": [
      "25% bielkovín",
      "Chuť višňového konfitového náplne",
      "Izomalt-oligosacharidy ako sladidlo",
      "Extrudované chrumky"
    ],
    "proteínový-batonček-whey-1kg-šokoládny-plombír-podla-ovocia": [
      "Výživový doplnok pre športovcov na podporu svalovej hmoty",
      "Súčasťou komplexu sú Omega-3, aminokyseliny a vitamíny",
      "Pomáha pri regenerácii po fyzickej záťaži",
      "Pohodlné miešanie s vodou alebo mliekom"
    ],
    "gainer-1kg-lesná-jagoda-šokoládový-banan": [
      "Komplexný gainer s 30% srvátkových bielkovín",
      "Obsahuje rýchlo pôsobiace sacharidy (maltodextrín, fruktóza)",
      "Obohatený o kreatín, aminokyseliny, rastlinné extrakty",
      "Podporuje nárast svalovej hmoty a regeneráciu po tréningu"
    ],
    "bcaa-0,5kg-fruit-punch-jahodová-grapefruit": [
      "Podporuje energetickú rovnováhu a rýchlejšiu regeneráciu",
      "Pomáha pri raste a udržaní svalovej hmoty",
      "Podporuje normálnu funkciu imunitného systému",
      "Zmes vitamínov C, E, B5, B6, B2 a B1"
    ]
  };

  for (const [slug, featureList] of Object.entries(features)) {
    await Product.updateOne(
      { slug },
      { $set: { "features.sk": featureList } }  // обновление для словацкого языка
    );
  }
};

// Запуск скрипта обновления
updateFeatures()
  .then(() => console.log("Features updated successfully"))
  .catch((error) => console.error("Error updating features:", error));