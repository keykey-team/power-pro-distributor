// scripts/patch-products-descriptions-sk.js
// запуск: node scripts/patch-products-descriptions-sk.js

import "dotenv/config";
import mongoose from "mongoose";
import { Product } from "../models/Product.model.js"; // ✅ проверь путь

const LS = (sk = "", ua = "", ru = "", en = "") => ({ ua, ru, en, sk });

async function patchOne(slug, { descriptionSk, ingredientsSk }) {
  const $set = {};
  if (descriptionSk) $set["description"] = LS(descriptionSk);
  if (ingredientsSk) $set["ingredients"] = LS(ingredientsSk);

  const r = await Product.updateOne({ slug }, { $set });
  console.log("patched:", slug, "matched:", r.matchedCount, "modified:", r.modifiedCount);
}

async function run() {
  const uri = 'mongodb+srv://powerprodistributor_db_user:h1PbSaQwsLYwFFsZ@cluster0.31z2fg2.mongodb.net/?appName=Cluster0'
  if (!uri) throw new Error("MONGO_URI is missing in .env");
  await mongoose.connect(uri);

  // =========================
  // FitWin (60 g)
  // =========================
  await patchOne("fitwin-pistachio-cream-60g", {
    descriptionSk: "FitWin tyčinka s náplňou PISTÁCIA A KRÉM. Obsahuje sladidlo. 60 g.",
    ingredientsSk:
      "Zloženie: Mliečna bielkovinová zmes 38% (srvátkový bielkovinový koncentrát (mlieko), srvátkový bielkovinový izolát (mlieko), vo vode rozpustná kukuričná vláknina), poleva 17% (kakaové maslo, vo vode rozpustená kukuričná vláknina, sušené plnotučné mlieko, sušené odstredené mlieko, sladidlá: maltitol, glykozidy steviolu; emulgátor: sójový lecitín; prirodná aróma), kokosový tuk, zvlhčovadlo: glycerol, maltitol, kešu oriešky, pistácie 2%, arašidy, prírodná aróma, antioxidant: vitamín E (tokoferol), emulgátor: mono- a diglyceridy mastných kyselín, regulátor kyslosti: kyselina citrónová, prírodné sladidlo: glykozidy steviolu. Môže obsahovať vajcia.",
  });

  await patchOne("fitwin-cookies-cream-60g", {
    descriptionSk: "FitWin tyčinka s náplňou SUŠIENKY A KRÉM. Obsahuje sladidlo. 60 g.",
    ingredientsSk:
      "Zloženie: Mliečna bielkovinová zmes 38% (srvátkový bielkovinový koncentrát (mlieko), srvátkový bielkovinový izolát (mlieko), vo vode rozpustná kukuričná vláknina), poleva 17% (kakaové maslo, vo vode rozpustená kukuričná vláknina, sušené plnotučné mlieko, sušené odstredené mlieko, sladidlá: maltitol, glykozidy steviolu; emulgátor: sójový lecitín; prirodná aróma), kokosový tuk, zvlhčovadlo: glycerol, maltitol, kešu oriešky, kakaový prášok 2%, arašidy, prírodná aróma, antioxidant: vitamín E (tokoferol), emulgátor: mono- a diglyceridy mastných kyselín, regulátor kyslosti: kyselina citrónová, prírodné sladidlo: glykozidy steviolu. Môže obsahovať vajcia.",
  });

  await patchOne("fitwin-caramel-peanuts-60g", {
    descriptionSk: "FitWin tyčinka s náplňou KARAMEL A ARAŠIDY. Obsahuje sladidlo. 60 g.",
    ingredientsSk:
      "Zloženie: Mliečna bielkovinová zmes 38% (srvátkový bielkovinový koncentrát (mlieko), srvátkový bielkovinový izolát (mlieko), vo vode rozpustná kukuričná vláknina), poleva 17% (kakaové maslo, vo vode rozpustná kukuričná vláknina, kakaový prášok so zníženým obsahom tuku, sušené odstredené mlieko, sladidlá: maltitol, glykozidy steviolu; emulgátor: sójový lecitín; prirodná aróma), kokosový tuk, arašidy 6,7%, zvlhčovadlo: glycerol, maltitol, kešu oriešky, prírodná aróma, antioxidant: vitamín E (tokoferol), emulgátor: mono- a diglyceridy mastných kyselín, regulátor kyslosti: kyselina citrónová, prírodné sladidlo: glykozidy steviolu. Môže obsahovať vajcia.",
  });

  // =========================
  // Crunch Bar (50 g)
  // =========================
  await patchOne("crunch-bar-choco-milk-caramel-50g", {
    descriptionSk:
      "Proteínová tyčinka s čokoládovou polevou a príchuťou mliečneho karamelu. Obsahuje sladidlá. 50 g.",
    ingredientsSk:
      "Zloženie: mliečna bielkovinová zmes 25% (srvátkový bielkovinový koncentrát, mliečny bielkovinový koncentrát), cukrárska poleva so sladidlami 24% (kokosový tuk, polydextróza, sušená srvátka (mlieko), sladidlá: maltitol, glykozidy steviolu, sušené odstredené mlieko, kakaový prášok so zníženým obsahom tuku 10–12%, emulgátor: sójový lecitín, vanilková aróma, soľ), vláknina (izomaltooligosacharidy), sladidlo: maltitol, zvlhčovadlá: glycerín, sorbitol, kokosový tuk, náplň (vláknina izomalt-oligosacharidy, sladidlo: maltitol, zvlhčovadlá: glycerín, sorbitol, arómy mliečny karamel, soľ), alkalický kakaový prášok, chrumkavé guľôčky (ryžová múka, soľ), čokoládová aróma, emulgátor: sójový lecitín, vanilková aróma, antioxidant: acetát tokoferolu, soľ, regulátor kyslosti: kyselina citrónová. Môže obsahovať orechy a vajcia. Izomaltooligosacharid je zdroj glukózy.",
  });

  await patchOne("crunch-bar-lychee-strawberry-50g", {
    descriptionSk:
      "Proteínová tyčinka s príchuťou líči a jahody. Obsahuje sladidlá. 50 g.",
    ingredientsSk:
      "Zloženie: mliečna bielkovinová zmes 25% (srvátkový bielkovinový koncentrát (mlieko), mliečny bielkovinový koncentrát), biela cukrárska poleva so sladidlami 24% (kokosový tuk, polydextróza, sušená srvátka (mlieko), sladidlá: maltitol, glykozidy steviolu, sušené odstredené mlieko, emulgátor: sójový lecitín, vanilková aróma, soľ), vláknina (izomaltooligosacharidy), sladidlo: maltitol, zvlhčovadlá: glycerín, sorbitol, kokosový tuk, náplň (pasterizované jablkové pyré, vláknina (izomalt-oligosacharidy), sladidlo: maltitol, arómy líči a jahoda, prírodné farbivo: karmín), chrumkavé guľôčky (ryžová múka, kakaový prášok, soľ), emulgátor: sójový lecitín, vanilková aróma, antioxidant: acetát tokoferolu, soľ, regulátor kyslosti: kyselina citrónová. Môže obsahovať orechy a vajcia. Izomaltooligosacharid je zdroj glukózy.",
  });

  await patchOne("crunch-bar-salted-caramel-icecream-50g", {
    descriptionSk:
      "Proteínová tyčinka s príchuťou slanej karamelovej zmrzliny. Obsahuje sladidlá. 50 g.",
    ingredientsSk:
      "Zloženie: mliečna bielkovinová zmes 25% (srvátkový bielkovinový koncentrát (mlieko), mliečny bielkovinový koncentrát), biela cukrárska poleva so sladidlami 24% (kokosový tuk, polydextróza, sušená srvátka (mlieko), sladidlá: maltitol, glykozidy steviolu, sušené odstredené mlieko, emulgátor: sójový lecitín, vanilková aróma, soľ), vláknina (izomaltooligosacharidy), sladidlo: maltitol, zvlhčovadlá: glycerín, sorbitol, kokosový tuk, náplň (vláknina izomalt-oligosacharidy, sladidlo: maltitol, zvlhčovadlá: glycerín, sorbitol, aróma slaný karamel, farbivo: karamel, soľ), chrumkavé guľôčky (ryžová múka, kakaový prášok, soľ), emulgátor: sójový lecitín, vanilková aróma, antioxidant: acetát tokoferolu, soľ, regulátor kyslosti: kyselina citrónová. Môže obsahovať orechy a vajcia. Izomaltooligosacharid je zdroj glukózy.",
  });

  // =========================
  // 32% bars / Vegan / Paste bars (те, что уже сидили)
  // =========================
  await patchOne("protein-bar-orech-60g", {
    descriptionSk:
      "Proteínová tyčinka pre športovú výživu s orechmi a s polevou. Obsahuje sladidlo. 60 g.",
    ingredientsSk:
      "Zloženie: Bielkovinová zmes 32% (srvátkový proteínový koncentrát (mlieko), hydrolyzovaný kolagén, mliečna bielkovina (kazeinát)), izomaltooligosacharidy, cukrárska poleva 22% (kokosový tuk, izomaltooligosacharidy, kakaový prášok, emulgátor: sójový lecitín, sladidlo: sukralóza), sekané lieskové oriešky 12%, drvené arašidy, pitná voda, ryžové cereálne guľôčky (ryžové cereálie, pitná voda), kakaové ryžové guľôčky (ryžové cereálie, kakaový prášok, pitná voda), hrozienka, regulátor kyslosti: kyselina citrónová, orechová aróma.",
  });

  await patchOne("protein-bar-makadamia-60g", {
    descriptionSk:
      "Proteínová tyčinka pre športovú výživu, glazovaná. Príchuť: makadamia (so sladidlom). 60 g.",
    ingredientsSk:
      "Zloženie: Bielkovinová zmes 32% (srvátkový proteínový koncentrát (mlieko), hydrolyzovaný kolagén, mliečna bielkovina (kazeinát)), izomaltooligosacharidy, cukrárska poleva 22% (kokosový tuk, izomaltooligosacharidy, kakaový prášok, emulgátor: sójový lecitín, sladidlo: sukralóza), macadamia 4%, arašidy, pitná voda, ryžové cereálne guľôčky (ryžové cereálie, pitná voda), kakaové ryžové guľôčky (ryžové cereálie, kakaový prášok, pitná voda), sušené brusnice, regulátor kyslosti: kyselina citrónová, orechová aróma.",
  });

  await patchOne("protein-bar-vegan-32-60g", {
    descriptionSk:
      'Proteínová tyčinka pre športovú výživu "Vegan" s orechmi, sušeným ovocím, cereáliami a polevou. Obsahuje sladidlo. 60 g (32% proteín).',
    ingredientsSk:
      "Zloženie: zmes bielkovín 32% (sójový proteínový izolát, ryžový proteín, hrachový proteín, konopný proteín), izomaltooligosacharidy, cukrárska poleva 22% (kokosový tuk, izomaltooligosacharidy, kakaový prášok, sójový lecitín, sladidlo: sukralóza), sekané lieskové orechy 12%, sušené ovocie 5% (hrozienka), pitná voda, pšeničné obilniny 1%, kukuričné guľôčky (kukurica, pitná voda), kukuričné guľôčky s kakaom (kukurica, kakaový prášok, pitná voda), sekané arašidy, regulátor kyslosti: kyselina citrónová, vanilková aróma, vitamínový komplex (0,05%): (vitamín C, vitamín PP, vitamín E, vitamín B5, vitamín B6, vitamín B2, vitamín B1, vitamín B9, biotín (B7), vitamín B12). Izomaltooligosacharid je zdroj glukózy.",
  });

  await patchOne("paste-bar-mandlova-pasta-45g", {
    descriptionSk: "Proteínová tyčinka s mandľovou pastou. So sladidlom. 45 g.",
    ingredientsSk:
      "Zloženie: Mandľová pasta 32%, bielkoviny (hydrolyzát kolagénu, koncentrát srvátkovej bielkoviny, kazeín (mlieko)) 32%, izomaltooligosacharidy, mliečna poleva 17% (úplne hydrogenovaný palmový tuk, sušené plnotučné mlieko, kakaový prášok, sójový lecitín, aróma „vanilka“), karamel (dehydratované kokosové mlieko, izomaltooligosacharidy, pitná voda, emulgátor, arómy „Vanilín-smotana“, krém-karamel), sezamové semienka, dehydratované kokosové mlieko, zvlhčovač: glycerín, arómy: vanilka, karamel, sladidlo: sukralóza. Upozornenie: individuálna citlivosť na zložky. Môže obsahovať stopy arašidov a iných orechov. Izomaltooligosacharid je zdrojom glukózy. Nevhodné pre deti do 10 rokov. Odporúčané množstvo: dospelým max. 1–2 tyčinky denne.",
  });

  await patchOne("paste-bar-sezamova-pasta-45g", {
    descriptionSk: "Tyčinka so sezamovou pastou (tahini) a bielkovinami, glazovaná. So sladidlom. 45 g.",
    ingredientsSk:
      "Zloženie: pasta zo sezamových semien (tahini) 32%, bielkoviny (hydrolyzát kolagénu, koncentrát srvátkovej bielkoviny (mlieko), kazeín) 32%, izomaltooligosacharidy, mliečna poleva 17% (maltitol, úplne hydrogenovaný palmový tuk, sušené plnotučné mlieko, kakaový prášok, sójový lecitín, aróma „vanilka“), karamel (dehydratované kokosové mlieko, izomaltooligosacharidy, pitná voda, emulgátor, arómy „Vanilín-smotana“, krém-karamel), sezamové semienka, kokosové mlieko, zvlhčovač: glycerín, arómy: vanilka, karamel, sladidlo: sukralóza. Upozornenie: individuálna citlivosť na zložky. Môže obsahovať stopy arašidov a iných orechov. Izomaltooligosacharid je zdrojom glukózy. Nevhodné pre deti do 10 rokov. Odporúčané množstvo: dospelým max. 1–2 tyčinky denne.",
  });

  await patchOne("paste-bar-vlasske-orechy-45g", {
    descriptionSk: "Tyčinka s pastou z vlašských orechov a bielkovinami, glazovaná. So sladidlom. 45 g.",
    ingredientsSk:
      "Zloženie: pasta z vlašských orechov 32%, bielkoviny (hydrolyzát kolagénu, koncentrát srvátkovej bielkoviny, kazeín (mlieko)) 32%, izomaltooligosacharidy, mliečna poleva 17% (maltitol, úplne hydrogenovaný palmový tuk, sušené plnotučné mlieko, prírodný kakaový prášok, sójový lecitín, aróma „vanilka“), karamel (dehydratované kokosové mlieko, izomaltooligosacharidy, pitná voda, emulgátor, arómy „Vanilín-smotana“, krém-karamel), jadrá vlašských orechov, dehydratované kokosové mlieko, zvlhčovač: glycerín, arómy: vanilka, karamel, sladidlo: sukralóza. Upozornenie: individuálna citlivosť na zložky. Môže obsahovať stopy arašidov a iných orechov. Izomaltooligosacharid je zdrojom glukózy. Nevhodné pre deti do 10 rokov. Odporúčané množstvo: dospelým max. 1–2 tyčinky denne.",
  });

  // =========================
  // Coconut / Brisee
  // =========================
  await patchOne("coconut-bar-50g", {
    descriptionSk: "Tyčinka s fruktooligosacharidmi a kokosovými vločkami s cukrárskou polevou. Obsahuje sladidlo. 50 g.",
    ingredientsSk:
      "Zloženie: kokosová dužina 37%, cukrárska poleva 26% (kokosový tuk, fruktooligosacharidy, kakaový prášok, emulgátor: sójový lecitín, sladidlo: sukralóza), fruktooligosacharidy 23%, kokosové mlieko, sušený kokosový krém, pitná voda, regulátor kyslosti: kyselina citrónová, aróma: kokos.",
  });

  await patchOne("coconut-bar-vegan-chia-50g", {
    descriptionSk: "Vegan kokosová tyčinka s chia semienkami a polevou. Obsahuje sladidlo. 50 g.",
    ingredientsSk:
      "Zloženie: kokosová dužina 37%, cukrárska poleva 26% (kokosový tuk, izomaltooligosacharidy, kakaový prášok, emulgátor: sójový lecitín, sladidlo: sukralóza), chia semienka (Salvia hispanica L) 12%, kokosové mlieko, sušený kokosový krém, pitná voda, regulátor kyslosti: kyselina citrónová, aróma: kokos.",
  });

  await patchOne("brisee-arasidy-v-karameli-55g", {
    descriptionSk: 'Proteinová tyčinka „Brisee" s arašidmi v karameli, glazovaná. Obsahuje sladidlo. 55 g. Obsah arašidov v karameli 20%.',
    ingredientsSk:
      "Zloženie: Bielkoviny 25% (srvátkový proteínový izolát (mlieko), srvátkový proteínový koncentrát (mlieko), kazeín (mlieko)), izomaltooligosacharidy, kokosový tuk, sušený kokosový krém, sladidlo: sukralóza, sójový lecitín, čokoládová cukrárenská poleva 23% (kokosový tuk, izomaltooligosacharidy, kakaový prášok, sladidlo: sukralóza), pražené arašidy, karamel (sušený kokosový krém, izomaltooligosacharidy, voda), chrumkavá zmes 8% (izomaltooligosacharidy, sekané arašidy, kokosový olej), kukuričné guľôčky s kakaom 2% (kukuričná krupica, kakaový prášok so zníženým obsahom tuku, pitná voda, sladidlo: sukralóza), sójový proteínový izolát, ryžový proteín, sušená vaječná hmota, prírodná aróma vanilín. Izomaltooligosacharid je zdroj glukózy.",
  });

  await patchOne("brisee-kokos-55g", {
    descriptionSk: 'Proteinová tyčinka „Brisee" s kokosom a s polevou. Obsahuje sladidlo. 55 g.',
    ingredientsSk:
      "Zloženie: Bielkoviny 25% (srvátkový proteínový izolát (mlieko), srvátkový proteínový koncentrát (mlieko), kazeín (mlieko)), kokosový tuk, kokosový krém, sladidlo: sukralóza, čokoládová poleva 23% (kokosový tuk, izomaltooligosacharidy, kakaový prášok, sójový lecitín, sladidlo: sukralóza), kokosová pulpa, crunch (sekané arašidy, kokosový olej), kukuričné guľôčky s kakaom 2% (kukurica, kakaový prášok so zníženým obsahom tuku, pitná voda, sladidlo: sukralóza), sójový proteínový izolát, ryžový proteín, sušená vaječná hmota, prírodná aróma vanilín. Izomaltooligosacharid je zdroj glukózy.",
  });

  await patchOne("brisee-jahodove-konfit-55g", {
    descriptionSk: "Proteinová tyčinka Brisee s jahodovým konfitom, glazovaná. Obsahuje sladidlo. 55 g.",
    ingredientsSk:
      "Zloženie: Bielkoviny 25% (srvátkový proteínový izolát (mlieko), srvátkový proteínový koncentrát (mlieko), kazeín (mlieko)), kokosový tuk, sušený kokosový krém, izomaltooligosacharidy, sladidlo: sukralóza, biela poleva 23% (kokosový tuk, sušený kokosový krém, izomaltooligosacharidy, sušená srvátka (mlieko), sušené odstredené mlieko, vanilín, sójový lecitín), jahodový konfit 20% (koncentrovaná jahodová šťava, izomaltooligosacharidy, pitná voda, sušený kokosový krém, agar-agar, regulátor kyslosti: kyselina citrónová), extrudované chrumky 8% (izomaltooligosacharidy, drvené arašidy, kokosový olej, kukuričné guľôčky 2% (kukuričná krupica, pitná voda, sladidlo: sukralóza)), sójový proteínový izolát, ryžový proteín, sušená vaječná hmota, vanilín, prírodná višňová aróma. Izomaltooligosacharid je zdroj glukózy.",
  });

  await patchOne("brisee-visnove-konfit-55g", {
    descriptionSk: "Proteinová tyčinka Brisee s višňovým konfitom a s polevou. Obsahuje sladidlo. 55 g.",
    ingredientsSk:
      "Zloženie: zmes bielkovín 25% (srvátkový proteínový izolát (mlieko), srvátkový proteínový koncentrát (mlieko), kazeín (mlieko)), kokosový tuk, sušený kokosový krém, izomaltooligosacharidy, sladidlo: sukralóza, biela poleva 23% (kokosový tuk, sušený kokosový krém, izomaltooligosacharidy, sušená srvátka (mlieko), sušené odstredené mlieko, vanilín, sójový lecitín), višňový konfit 20% (koncentrovaná višňová šťava, izomaltooligosacharidy, pitná voda, sušený kokosový krém, zahusťovadlo: agar-agar, regulátor kyslosti: kyselina citrónová), extrudované chrumky 8% (izomaltooligosacharidy, drvené arašidy, kokosový olej, kukuričné guľôčky 2% (kukuričná krupica, pitná voda, sladidlo: sukralóza)), sójový proteínový izolát, ryžový proteín, sušená vaječná hmota, vanilín, prírodná višňová aróma. Izomaltooligosacharid je zdroj glukózy.",
  });

  // =========================
  // Whey / Gainer / BCAA
  // =========================
  await patchOne("whey-protein-1kg", {
    descriptionSk:
      "Výživový doplnok pre športovcov — zmes srvátkových bielkovín so sladidlom určená na podporu svalovej hmoty, regeneráciu po záťaži a každodenné dopĺňanie bielkovín. Príchute: čokoládový plombyr, jahoda, lesná ягода, čokoláda, vanilka, banán.",
    ingredientsSk:
      "Zloženie na 40 g: koncentrát srvátkových bielkovín 24,8 g, izolát 6,4 g, hydrolyzát 4 g, sušené ovocie v prášku alebo odtučnený kakaový prášok 4,4 g (podľa príchute), lecitín 0,08 g, aróma 0,2 g, sladidlo: sukralóza (E955) 0,064 g, prášok z ľanových semienok 0,002 g, selén 0,006 mg, zinok 0,0016 mg, farbivá 0,052 g (E110, E124, E132) + aminokyselinový komplex (20 aminokyselín).",
  });

  await patchOne("gainer-1kg", {
    descriptionSk:
      "Komplexný gainer s obsahom 30% srvátkových bielkovín a rýchlo pôsobiacimi sacharidmi (maltodextrín, fruktóza) na podporu nárastu svalovej hmoty a regenerácie. Obohatený o kreatín, aminokyseliny, rastlinné extrakty, kofeín a vitamíny.",
    ingredientsSk:
      "Zloženie na 40 g: sušené ovocie/bobuľový prášok alebo odtučnený kakaový prášok 10 g (podľa príchute), extrakt z tribulusu 0,12 g, arginín 0,1 g, lecitín 0,08 g, taurín 0,08 g, karnitín 0,08 g, extrakt z guarany 0,08 g, glutamín 0,04 g, kofeín 0,02 g, glycín 0,02 g, extrakt zo ženšenu 0,012 g, vitamínový premix 0,012 g, kyselina alfa-lipoová 0,004 g, ornitín HCl 0,0012 g, aróma 0,288 g, farbivo 0,0032 g.",
  });

  await patchOne("bcaa-05kg", {
    descriptionSk:
      "BCAA podporuje energetickú rovnováhu a prispieva k rýchlejšej regenerácii po tréningu. Kombinácia leucínu, izoleucínu a valínu podporuje rast svalov a pomáha znižovať únavu.",
    ingredientsSk:
      "Zloženie na odporúčanú dennú dávku 5 až 15 g: leucín 7,5 g, izoleucín 3,75 g, valín 3,67 g, príchute (Fruit Punch/pomaranč/brusnica/grapefruit) 0,06 g, sladidlo: sukralóza (E955) 0,0095 g, vitamíny: C 2,7 mg, PP (B3) 0,81 mg, E 0,45 mg, B5 0,27 mg, B6 0,09 mg, B2 0,072 mg, B1 0,063 mg, B9 9 µg, B7 6,75 µg, B12 0,045 µg, farbivo (E120, E124, E110) 0,0009 g.",
  });

  await mongoose.disconnect();
  console.log("✅ done");
}

run().catch((e) => {
  console.error("❌ patch error:", e);
  process.exit(1);
});
