import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import {dirname} from "path"
import {fileURLToPath} from "url"
import eslintConfigPrettier from "eslint-config-prettier"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const eslintConfig = [
    ...nextCoreWebVitals,
    ...nextTypescript,
    // Must be at end - disables all rules that conflict with prettier
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": "off"
        }
    },
    eslintConfigPrettier,
    {
        ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]
    }
]

export default eslintConfig
