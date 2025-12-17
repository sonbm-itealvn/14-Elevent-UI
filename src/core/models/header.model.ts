import type { Component } from "vue";

export type Header = {
    id: string;
    icon?: Component;
    badge?: string;
    title?: string;
    to?: string;
    children?: Header[];
}