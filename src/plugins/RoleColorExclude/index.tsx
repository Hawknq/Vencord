/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Settings } from "@api/Settings";
import { Logger } from "@utils/Logger";
import definePlugin from "@utils/types";
import { Menu, Toasts } from "@webpack/common";

const logger = new Logger("RoleColorExclude");

// RoleColorEverywhere'in ayar anahtarı (bizim güncellediğimiz sürümde var)
const KEY = "excludedUserIds";

function getRceSettings(): Record<string, any> | undefined {
    return (Settings.plugins as Record<string, any>).RoleColorEverywhere;
}

function getList(): string[] {
    const raw: string = getRceSettings()?.[KEY] ?? "";
    return raw.split(/[\s,;]+/).filter(Boolean);
}

function setList(ids: string[]) {
    const rce = getRceSettings();
    if (!rce) return false;

    rce[KEY] = ids.join(", ");
    return true;
}

function toggleUser(userId: string) {
    try {
        const list = getList();
        const excluded = list.includes(userId);
        const next = excluded ? list.filter(id => id !== userId) : [...list, userId];

        if (!setList(next)) {
            Toasts.show({
                id: Toasts.genId(),
                type: Toasts.Type.FAILURE,
                message: "RoleColorEverywhere bulunamadı veya kapalı"
            });
            return;
        }

        Toasts.show({
            id: Toasts.genId(),
            type: Toasts.Type.SUCCESS,
            message: excluded ? "Rol rengi geri açıldı" : "Rol rengi kapatıldı"
        });
    } catch (e) {
        logger.error("Failed to toggle user", e);
    }
}

export default definePlugin({
    name: "RoleColorExclude",
    description: "Kullanıcıya sağ tıklayarak RoleColorEverywhere'de o kişinin rol rengini kapatıp açar",
    authors: [{ name: "Hawking", id: 0n }],
    dependencies: ["RoleColorEverywhere"],

    contextMenus: {
        "user-context"(children, props: { user?: { id: string; }; }) {
            const user = props?.user;
            if (!user?.id) return;

            const excluded = getList().includes(user.id);

            children.push(
                <Menu.MenuSeparator />,
                <Menu.MenuItem
                    id="vc-rce-exclude-toggle"
                    label={excluded ? "Rol rengini geri aç" : "Rol rengini kapat"}
                    action={() => toggleUser(user.id)}
                />
            );
        }
    }
});
