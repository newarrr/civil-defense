# مديرية الدفاع المدني — محافظة دهوك

الموقع الرسمي للتوعية والمعلومات، بأربع لغات: بادینی · سۆرانی · العربية · English.

- **الموقع:** https://newarrr.github.io/civil-defense/
- **لوحة الإدارة:** https://newarrr.github.io/civil-defense/admin/ — دليلها في [admin/GUIDE.md](admin/GUIDE.md)

موقع ثابت يُنشر عبر GitHub Pages من الفرع `main`. لا خادم ولا قاعدة بيانات. الصفحات العامة لا تحمّل
أي مكتبة أو خط من موقع آخر؛ الاستثناء الوحيد فيديو YouTube أو Vimeo داخل خبر، ويُطلب عند فتح الخبر فقط.
لوحة الإدارة تحمّل برنامج Sveltia CMS من unpkg.com بإصدار ثابت وبصمة تحقق.

## الحالة

- المحتوى التوعوي ملخصات تعليمية بمراجعها؛ بانتظار اعتماد مختص سلامة من المديرية.
- النص الكردي (بادینی) مكتوب وفق مصطلحات المديرية نفسها — انظر [docs/BADINI.md](docs/BADINI.md) — وبانتظار توقيع مراجع لغوي من دهوك.
- الطلبات الإلكترونية والحسابات غير مفعّلة. عناوين المراكز والإحصائيات تظهر بعد إدخالها واعتمادها من لوحة الإدارة.

## للمطوّر

| | |
|---|---|
| هيكل الملفات وقواعد التطوير | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| معجم ودليل الكتابة البادینية | [docs/BADINI.md](docs/BADINI.md) |
| ربط الدومين الرسمي | [docs/DOMAIN.md](docs/DOMAIN.md) |
| الخطوط ورخصها | [fonts/SOURCES.md](fonts/SOURCES.md) |

التشغيل محليًا: أي خادم ملفات ثابتة على مجلد المستودع (الصفحات تستعمل وحدات ES ولا تعمل من `file://`).

```bash
npx http-server . -p 5050 -c-1
```

قبل كل رفع:

```bash
node tools/build.mjs
```

```bash
node tools/check.mjs
```

## English summary

Static multilingual website of the Directorate of Civil Defense, Duhok Governorate (Badini, Sorani,
Arabic, English), published with GitHub Pages. No server, no database. Public pages load no third-party
library or font; the only exception is a YouTube/Vimeo video inside a news item, requested when it is opened.
The /admin panel loads Sveltia CMS from unpkg.com (pinned version with an integrity hash).
Structure and rules: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Run `node tools/build.mjs` and
`node tools/check.mjs` before every push; the same two commands run on GitHub after every change.
