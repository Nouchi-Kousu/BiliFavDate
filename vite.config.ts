import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        monkey({
            entry: "src/main.ts",
            userscript: {
                icon: "http://bilibili.com/favicon.ico",
                namespace: "https://github.com/Nouchi-Kousu/BiliFavDate",
                match: ["*://space.bilibili.com/*"],
                grant: "none",
                author: "Nouchi",
                license: "MIT",
                name: "B站收藏夹收藏时间显示",
                description:
                    "将B站收藏夹中被隐藏为“收藏于2年前”的视频还原为具体日期。",
            },
        }),
    ],
});
