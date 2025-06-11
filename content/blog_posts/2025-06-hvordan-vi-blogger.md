---
title: Hvordan vi blogger
published: 2025-06-10
author: august
description: |
    Vi starter med en mundan bloggpost: hvordan er bloggen skrudd sammen?
---

## Innhold: Flate filer

Selve bloggpostene er `.md`-filer vi har sjekket inn i git-repoet. Stort mere headless CMS enn det skal du lete lenge etter.

Vi bruker [gray-matter](https://www.npmjs.com/package/gray-matter) til å få inn metadata i bloggpostene. Her er et eksempel:

```markdown
---
title: Fet bloggpost
published: 2025-10-09
author: august
description: |
    Denne teksten havner på forsiden!
    
    Det tolkes som helt vanlig markdown.
---

## Vi starter med en overskrift

Og skriver noe nyttig.
```

[YAML er et artig beist](https://noyaml.com/). Vi liker dølle enterprise-biblioteker som får jobben gjort uten for mye snarveier og antagelser, og i selve ERP-en bruker vi [js-joda](https://js-joda.github.io/js-joda/) for å ha full kontroll på tidssoner og annet snacks. Vi bruker det samme biblioteket her på bloggen til å lese inn `2025-10-09` fra metadataene. Men YAML synes det ser så mye ut som en dato at den like gjerne tar og gjør det om til et `Date`-objekt automatisk.

Det kan heldigvis omgås på denne måten:

```typescript
import matter from "gray-matter"
import yaml from "js-yaml"

const {content, data} = matter(fs.readFileSync(filePath, "utf8"), {
    engines: {
        yaml: s => yaml.load(s, {schema: yaml.JSON_SCHEMA}) as any
    }
})
```

Av en eller annen grunn er returtypen til `yaml.load` satt til `unknown`. Da ble det en `any`, gitt. Noen ganger har man bare lyst til å få ut fagbloggen sin, og ikke sloss med TypeScript.

## HTML og CSS: Next.js

Vi er vel på sett og vis en [Next.js](https://nextjs.org/)-sjappe. SaaS-en vår er (blant annet) web-basert, og er bygget med Next.js.

Det finnes en haug med bloggeplatformer, men så er det jo både hyggelig og praktisk å skru ting sammen selv. Vi er tross alt programmerere, så det tok ikke mange timene med knoting og få Next.js til å vise markdown-innholdet vårt og kjapt og effektivt servere opp statisk HTML. Skulle vi angre veldig på dette senere, er det uansett bloggens innhold i markdown-filene hvor mesteparten av arbeidet legges inn. Det viktigste er vel kanskje uansett å ikke bikeshedde alt for mye, og bare få noe opp og gå.

## Hosting: Vercel

Selv om vi er en Next.js-sjappe, bruker vi ikke Vercel til SaaS-en vår. Next.js kjører helt fint utenfor Vercel. Se ikke bort i fra at flere detaljer om dette kommer i en fremtidig bloggpost.

Denne bloggen er nokså rett frem, og vi forventer ikke mere trafikk enn at gratisversjonen til Vercel holder i massevis. Er det [bra nok for CEO-en i Vercel sine sideprosjekter](https://x.com/rauchg/status/1868310015247048862), er det nok bra nok for oss og. Dette faller definitivt under å ungå bikeshedding, og en Next.js-app får man opp og kjøre på Vercel på null komma svisj. 

## Open Source

Hvis du skulle være nysgjerrig på alt eller ingenting om fagbloggens oppsett, ligger all koden ute på GitHub: https://github.com/snowbeesoftware/snowbee-fagblogg.