
import { getMessages } from "@shared/i18n/getMessages";
import { createI18nServer } from "@shared/i18n/server";
import { getAllProducts } from "@shared/services/productsServices";
import BoxConfirm from "@widgets/BuildBox/BuildBoxConfirm/ui/BoxConfirm";
import BuildBoxConfirm from "@widgets/BuildBox/BuildBoxConfirm/ui/BuildBoxConfirm";
import BuildBoxFunc from "@widgets/BuildBox/BuildBoxFunc/ui/BuildBoxFunc";
import BuildBoxList from "@widgets/BuildBox/BuildBoxList/ui/BuildBoxList";


export default async function BoxPage({ params }) {
    const { locale = "ua" } = await params;
    const messages = await getMessages(locale);
    const { t } = createI18nServer(messages);
    const data = await getAllProducts();

    return <>
        <BoxConfirm locale={locale}/>
        <BuildBoxFunc locale={locale} />
        <BuildBoxList locale={locale} data={data} />
        <BuildBoxConfirm locale={locale} />
    </>;
}
