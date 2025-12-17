export const Language = {
    English: "en",
    Vietnamese: "vi",
    Japanese: "ja",
    Korean: "kr",
    Chinese: "zh",
    Russian: "ru",
    German: "de",
    French: "fr"
} as const;

export type Language = typeof Language[keyof typeof Language];