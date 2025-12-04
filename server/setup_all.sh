#!/bin/bash

# مسیر پروژه

PROJECT_DIR="/var/www/NEWshop/server"
cd $PROJECT_DIR || exit

echo "مرحله 0: بررسی Node و NPM"
node -v
npm -v

echo "مرحله 1: نصب وابستگی‌ها"
npm install

echo "مرحله 2: ایجاد فولدر dist"
mkdir -p dist/server
mkdir -p dist/client

echo "مرحله 3: ایجاد tsconfig ها"

# tsconfig.base.json

cat > tsconfig.base.json <<EOL
{
"compilerOptions": {
"target": "ES2020",
"lib": ["ES2020", "DOM", "DOM.Iterable"],
"strict": true,
"esModuleInterop": true,
"skipLibCheck": true,
"allowSyntheticDefaultImports": true,
"forceConsistentCasingInFileNames": true,
"baseUrl": ".",
"paths": {
"@/*": ["client/*"],
"@server/*": ["server/*"],
"@shared/*": ["shared/*"]
}
}
}
EOL

# tsconfig.server.json

cat > tsconfig.server.json <<EOL
{
"extends": "./tsconfig.base.json",
"compilerOptions": {
"module": "CommonJS",
"moduleResolution": "node",
"outDir": "dist/server"
},
"include": ["server/**/*", "shared/**/*"],
"exclude": ["node_modules", "dist"]
}
EOL

# tsconfig.client.json

cat > tsconfig.client.json <<EOL
{
"extends": "./tsconfig.base.json",
"compilerOptions": {
"module": "ESNext",
"moduleResolution": "bundler",
"jsx": "react-jsx",
"outDir": "dist/client"
},
"include": ["client/**/*", "shared/**/*", "vite.config.ts", "vite.config.server.ts"],
"exclude": ["node_modules", "dist"]
}
EOL

echo "مرحله 4: ساخت فایل .env اگر وجود ندارد"
if [ ! -f ".env" ]; then
cat > .env <<EOL
PORT=5000
EOL
fi

echo "مرحله 5: کامپایل سرور و کلاینت"
npx tsc --project tsconfig.server.json
npx tsc --project tsconfig.client.json
npx vite build

echo "مرحله 6: اجرای سرور با PM2"
pm2 delete newshop 2>/dev/null
pm2 start dist/server/index.js --name newshop

echo "مرحله 7: نمایش وضعیت PM2"
pm2 ls

echo "تمام شد! سرور روی پورت مشخص شده در .env اجرا شده است."

