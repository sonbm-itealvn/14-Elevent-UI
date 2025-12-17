import type { Header } from "@/core/models/header.model";
import { NIcon, type MenuOption } from "naive-ui";
import { translate } from "@/shared/utils";
import { h, type Component } from "vue";

const renderIcon = (icon: Component) => () => h(NIcon, null, { default: () => h(icon) });  

const buildMenuOptions = (headers: Header[], parentPath = "", mode: "vertical" | "horizontal"): MenuOption[] => {
    return headers.map((h) => {
      let fullPath: string;
  
      if (!parentPath) {
        fullPath = h.to || "";
      } else {
        const clean = h.to?.replace(/^\//, "") || "";
        fullPath = `${parentPath}/${clean}`;
      }
  
      return {
        key: fullPath || h.id,
        label: translate(h.title ?? ""),
        icon: mode === "vertical" && h.icon ? renderIcon(h.icon) : undefined,
        children: h.children ? buildMenuOptions(h.children, fullPath, mode) : undefined,
      };
    });
};

export { buildMenuOptions, renderIcon };