<template>
    <n-breadcrumb separator=">">
        <div class="flex items-center">
            <n-breadcrumb-item v-for="value in breadcrumbItems" :key="value.to" class="flex items-center">
                <n-button secondary round @click="handleClick(value.to)" :render-icon="renderIcon(value.icon as Component)" :type="value.isActive ? 'primary' : 'default'">
                    {{ value.name }}
                </n-button>
            </n-breadcrumb-item>
        </div>
    </n-breadcrumb>
</template>

<script setup lang="ts">
import { computed, h, type Component } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Home } from "@vicons/ionicons5";
import { buildMenuOptions } from "@/shared/utils/menu.utils";
import type { MenuOption } from "naive-ui";
import { NBreadcrumb, NBreadcrumbItem, NButton } from "naive-ui";
import type { Header } from "@/core/models/header.model";

const props = defineProps<{
    items: Header[];
}>();

const router = useRouter();
const route = useRoute();
const menuOptions = buildMenuOptions(props.items, "", "vertical");

const renderIcon = (icon: Component) => () => h(icon);


interface Crumb {
    name: string;
    icon?: Component;
    to: string;
    isActive: boolean;
}

function findPath(
    options: MenuOption[],
    targetPath: string,
    parents: Crumb[] = []
): Crumb[] | null {
    for (const item of options) {
        const crumb: Crumb = {
            name: (item.label as string) ?? "",
            icon: (item.icon as Component) ,
            to: (item.key as string) ?? "",
            isActive: item.key === targetPath,
        };
        
        if (item.key === targetPath) {
            return [...parents, crumb];
        }
        if (item.children) {
            const result = findPath(item.children as MenuOption[], targetPath, [
                ...parents,
                crumb,
            ]);
            if (result) return result;
        }
    }
    return null;
}

const breadcrumbItems = computed(() => {
    const path = route.path;
    const found = findPath(menuOptions, path) ?? [];
    
    if (found.length == 1 && (found[0]?.to === "/" || path === "/admin")) {
        return [
            {
                name: found[0]?.name ?? "Admin",
                icon: found[0]?.icon ?? Home,
                to: found[0]?.to ?? path,
                isActive: true,
            },
        ];
    } else if (found.length > 0) {
        // Remove duplicates by using a Set to track seen paths
        const seen = new Set<string>();
        const result: Crumb[] = [];
        
        // Add first item (parent)
        const firstItem = {
            name: found[0]?.name ?? "Admin",
            icon: found[0]?.icon ?? Home,
            to: found[0]?.to ?? path,
            isActive: false,
        };
        if (!seen.has(firstItem.to)) {
            seen.add(firstItem.to);
            result.push(firstItem);
        }
        
        // Add remaining items, skipping duplicates
        for (const item of found) {
            if (!seen.has(item.to)) {
                seen.add(item.to);
                result.push({
                    ...item,
                    isActive: item.to === path,
                });
            }
        }
        
        return result;
    } else {
        return [
            {
                name: "Admin",
                icon: Home,
                to: path,
                isActive: true,
            },
        ];
    }
});

const handleClick = (to: string) => {
    router.push(to);
};
</script>