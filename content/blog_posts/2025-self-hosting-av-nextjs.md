---
title: Self-hosting av Next.js
published: 2025-09-16
author: august
description: |
    Vercel er en hosting-platform som også står bak web-rammeverket Next.js. De fleste som bruker Next.js går for Vercel, men ikke vi! Vi har valgt å self-hoste Next.js i AWS i stedet for.
    
    Hvorfor self-hoster vi? Og hva bør du tenke på om du skal gjøre det samme?
---

## Vercel er helt supert

Bloggen du leser nå er (i skrivende stund) hostet på Vercel. Nettsiden vår [snowbee.no](https://www.snowbee.no) er også hostet på Vercel. Inntil for noen måneder siden, var også selve SaaS-webappen vår hostet på Vercel. Personlig, har jeg en håndfull nettsider boende på Vercel, som min [gode gamle blogg](https://www.augustl.com), min litt nyere men også [gode gamle konsulent-nettside](https://www.crud.business), og en liten håndfull til.

Slagordet til Vercel er _Ship It_. Likandes, for en startup som gjør alt vi kan for å shippe ting med høyest mulig iterasjonshastighet (over tid).

En annen kul liten greie er at CEO i Vercel [hoster alle sine prosjekter på den gratis hobby-versjonen av Vercel](https://x.com/rauchg/status/1868310015247048862), for å garantere at gratisversjonen [doogfodes](https://en.wikipedia.org/wiki/Eating_your_own_dog_food) til å være kapabel og brukbar nok til ekte prosjekter.

Alt godt. Så hvorfor bruker vi ikke Vercel?

## Vercel har masse greier vi ikke trenger

Vercel har et knippe unique selling points som i seg selv er helt supre, men som vi rett og slett ikke har bruk for.

**Branch deployments.** Vercel har supert opplegg som automatisk gir deg kjørende kode for alle brancher. Faktisk får du kjørende kode for alle *commits* i hele historikken din. Hele Vercel er serverless, så det koster dem ikke noe å ha gamle versjoner av koden kjørende, fordi den kjører ikke før du gjør requests mot den. "Instans eksisterer" bruker tilnærmet 0 ressurser. Dette estimerer vi til å være ca. umulig å sette opp på AWS selv. Men [hos oss kjører vi med én branch](/2025-bare-en-branch), så dette har vi rett og slett bare aldri brukt.

**Bygging av kode.** Vercel bygger koden din, kjapt og effektivt. De integrerer med GitHub og GitLab og hva du måtte ønske. Vercel sine bygg fungerte i grunnen helt glimrende for oss. Men, vi har vår egen bygge-pipeline for resten av systemet (Kotlin-backend, med mere). Disse byggene kjører på en fysisk boks vi leier av Hetzner, som gjør at byggene er turbo-kjappe. Man skal ikke kimse av litt overprovisjonert hardware. Denne bygger også Next.js-appen en god del raskere enn Vercel. Så når vi allerede har en bygge-pipeline på plass, kan like gjerne bygge sammen med resten av opplegget vårt. Dette støtter også Vercel uten problemer.

**Resizing av bilder.** Vercel har innebygget CDN og dynamisk resizing av bilder. Når vi satt i gang med dette, fikk man 5000 bilder i måneden, så $5 per ekstra tusen bilder. SaaS-en vår sin produktdatabase vil typisk ha noen hundre tusen bilder *per kunde*, så det sier seg selv at den prismodellen ikke passer oss spesielt bra. Vercel har riktignok endret prismodellen sin nå til å være mye mere gunstig for vårt bruksområde. Men vi trenger uansett et sted å _lagre: bildene, siden Vercel "kun" optimaliserer og resizer og er CDN. Nå er vi fornøyde brukere av CloudFlare Images for både lagring og CDN, og trenger ikke å bruke Vercel for bilde-transformasjonene sin skyld.

## Vercel gjør noen ting litt mere knotete for vårt oppsett

Dessuten har vi noen rariteter i oppsettet vårt som ikke er så lett å få til på Vercel.

Vi har en tjeneste som vi ikke ønsker å eksponere på internett, men som frontenden (nermere bestemt BFF-en) trenger å få tak i. Vi kunne alltids proxyet den igjennom Kotlin-backenden vår. Så om vi bare self-hoster Next.js i ECS-clusteret hvor tjenesten står og tikker og går, så kan Next.js snakke med den direkte, uten å gå innom internett. Da får vi jo også fordelen av nærhet (aka lav latency) til Kotlin-backenden som også kjører i dette ECS-clusteret.

I kategorien "Vercel blir bedre og bedre over tid", er dette _også_ blitt enklere nå, med [Vercel sin nye Pro-plan](https://vercel.com/blog/new-pro-pricing-plan) som inkluderer PrivateLink, tidligere eksklusivt for Vercel sin Enterprise-plan. Men igjen så har vi et finfint fungerende oppsett i ECS nå, og det er sikkert litt hikkemikk og få PrivateLink opp og gå skikkelig.

## Vercel har en litt kjip prismodell per hode

Faste utgifter som bare øker og øker er også litt skumle for en liten startup som prøver å bruke minst mulig penger. På Vercel betaler man per hode. For at GitHub-integrasjonen til Vercel skal fungere smooth, må alle som kan pushe (og dermed deploye) via GitHub også ligge inne som team members i Vercel. Dette kan man omgå ved å ikke integrere direkte med GitHub men trigge deploys via noe webhooks og noe greier. Men så får man bare tilgang til logger, observability, detaljer om feil i bygging, osv, om man ligger inne i Vercel. Så i praksis øker kostnadene jevnt og trutt per kode-hode.

I kjent stil har dette også endret seg over tid, og Vercel har nå gratis "read only" seats. Men disse har ikke tilgang til grunnleggende ting som logger, så i praksis trenger man betalte seats for alle utviklerne.

## Pitfalls i self-hosting av Next.js

Heldigvis er det [helt standard innebygget støtte for å self-hoste Next.js](https://nextjs.org/docs/app/guides/self-hosting). Dokumentasjonen er god og detaljert, og vårt oppsett er så godt som identisk.

Likevel er det et par ting som er kritisk for å få alt til og fungere, som enten ikke er nevnt i dokumentasjonen, eller som ikke fremstår som spesielt viktig.

## Bruk en CDN til CSS, JS, og bilder

Ut av boksen, ligger alle assets (CSS, JS og "statiske" bilder) i Next.js-appen og hostes igjennom den. Det vil si at CSS-fila di typisk er tilgjengelig på noe som `/_static/css/123abc666.css`.

Det er en URL som bare funker på akkurat den versjonen av bygget, og som forsvinner når du deployer ny versjon. For å være hakket mere konkret, vil du få webside uten CSS-filer om følgende skjer:

1. Åpne `minapp.no`
2. Du traff den gamle versjonen av appen
3. Nettleseren gjør et nytt kall for å hente ut `/_static/css/123abc666.css`
4. Dette kallet traff den gamle versjon av appen
5. CSS-fila får 404 og nettsiden din blir seendes ut som om du har [designet et programmeringsspråk](http://www.wall.org/~larry/).

Derfor er det essensielt å bruke en ekstern CDN til assets. Dette er heldigvis helt trivielt å sette opp i Next.js. Vi bruker S3 + CloudFront i AWS, og kjører dette scriptet som en del av frontend-bygget:

```bash
aws s3 sync ./extracted/app/.next/static \
    s3://${{ secrets.WEBAPP_CDN_S3_BUCKET }}/_next/static

aws s3 sync ./extracted/app/public \
    s3://${{ secrets.WEBAPP_CDN_S3_BUCKET }}
```

Next.js trenger bare å få en `assetPrefix` i configen sin, så vil den hente `/_static/css/123abc666.css` derfra, i stedet for å prøve og hente den fra seg selv.

## Sett en encryption key for server actions

De fleste Next.js-apper ender opp med minst en liten håndfull server actions. For alt av I/O til backend og BFF bør du bruke API routes, men om du f.eks ønsker å ha en `<form>` på en Next.js-side som sender inn node data over POST og rendrer på nytt med oppdatert tilstand, er du nødt til å bruke en server action. Altså disse magiske filene med `"use server"` i toppen av fila, som kun kan eksportere asynkrone funksjoner.

Disse brekker på tvers av deployments om du lar være å sette den helt valgfrie env-variabelen `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`! Det ligner litt på CDN-problemet ovenfor. Hvis en bruker åpner en nettside, får de en referanse til en server action. Dersom du deployer en ny versjon av applikasjonen i mellomtiden, dør denne referansen, og brukerne får diverse ugreie feilmeldinger.

Alt du trenger å gjøre er å sette `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`. Det gjør at det randomiserte navnet på server actions blir stabilt på tvers av deployments. Hvorfor dette ikke er et påkrevd flagg som får Next.js til å kræsje om det ikke er satt når man self-hoster, får meg til å undre.

For å generere denne nøkkelen kan du f.eks bruke Node.js:

```javascript
import crypto from "crypto"
console.log(crypto.randomBytes(32).toString("base64"))
```

## Ting som ble dårligere i self-hosting av Next.js

Det var riktignok én ting som ble dårligere når vi self-hoster.

Selv om _bygget_ er raskt med vår egen byggeserver, er _deployments_ tregt. På Vercel tar det et par sekunder fra bygget er ferdig til ny versjon ligger ute. På ECS under Fargate med awsvpc som networking mode, er det snakk om en liten håndfull med dyrbare minutter for at AWS skal få alt opp og gå og deploye siste versjon.

Fargate kan _bare_ kjøre i "awsvpc"-modus, som i praksis betyr at AWS lager en egen VPC med sitt eget network interface og alt som hører med for hver eneste instans av Docker-imagene du kjører der. Dette har naturligvis en viss overhead som vi ikke betaler for i penger (Fargate tar betalt per minutt du kjører instansene dine), men kostnaden kommer altså i form av trege deplomyments.

## Lykke til!

Vercel er supert, og du gjør ikke noe galt om du deployer til Vercel. Men nå vet du ihvertfall hva som skal til om du ønsker å self-hoste Next.js-appen din!