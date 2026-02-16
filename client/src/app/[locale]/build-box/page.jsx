
import { getMessages } from "@shared/i18n/getMessages";
import { createI18nServer } from "@shared/i18n/server";
import BuildBoxFunc from "@widgets/BuildBox/BuildBoxFunc/ui/BuildBoxFunc";
import BuildBoxList from "@widgets/BuildBox/BuildBoxList/ui/BuildBoxList";


export default async function BoxPage({ params }) {
    const { locale = "ua" } = await params;
    const messages = await getMessages(locale);
    const { t } = createI18nServer(messages);

    return <>
        <BuildBoxFunc locale={locale} />
        <BuildBoxList locale={locale} />
        <BuildBoxConfirm locale={locale}/>
    </>;
}
