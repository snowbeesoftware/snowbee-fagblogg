---
title: SnowBee best practices
published: 2026-09-04
author: august
tags:
  - patterns
description: Å følge "best practices" er det samme som å ikke tenke. Hva gjør vi annerledes i SnowBee?
---

Hvis ingen er ved roret, vil LLM-ene følge "best practice". I SnowBee har vi et knippe AI-skills som for det meste handler om å peke LLM-en i retning av hvordan _vi_ vil at koden vår skal se ut.

Dette er noe så snedig som en menneske-skrevet bloggpost om AI-genererte skills. (Alle bloggpostene våre er menneske-skrevet. Det får da være grenser.)

## Avoid over-engineered wrappers

LLM-ene eeeeelsker å wrappe kode. Det er liksom ingen ende på hva den finner for godt til og pakke inn i helt ubrukelig indireksjon.

Vi unngår wrappere som legger til indireksjon uten å eie oppførsel: wrapper-funksjoner, decorators, fasader, service-lag, adaptere, managers, providers, factories og i det hele tatt.

Vi liker `posts.filter({ it.published }).map({ it.title })`.

Vi liker ikke `getPublishedPostTitles(posts)`.

Vi liker `EntityError(type = UNKNOWN, message = "A snafu occurred")`.

Vi liker ikke `getUnknownSnafuError()`.

## Complete renames

LLM-ene liker å jobbe lokalt. Dersom vi omdøper et konsept i språkfilene, vil vi også endre navnet på tingen i koden (og vice versa). Navngiving er vanskelig nok som det er, og kjært barn har _ikke_ mange navn når det kommer til domene-modellering.

Samtidig må vi holde oss i skinnet - API-er som andre enn oss konsumerer, endrer vi _aldri_ navnet til.

## Integration functional core

LLM-ene elsker å lage mocks og stubs. Vi foretrekker _imperative shell, functional core_. Det betyr at vi tegner en markant strek mellom businesslogikk som beskriver _hva_ som skal gjøres, og utføringen og I/O mot omverdenen som sier _hvordan_ det skal gjøres.

_Functional core_ er funksjoner som tar imot input-parametere og database-tilstand, og returnerer beslutninger og data som hører til. Denne skriver vi unit-tester for i alle bauger og kanter.

_Imperative shell_ kaller disse funksjonene, ser på beslutningene, og gjør HTTP-kall og annet snacks mot eksterne tredjeparts API-er. Utførelsen blir som regel nokså fri for logikk og intrikate regler, og trenger i praksis ikke og testes i det hele tatt. Den beste mocken er ingen mock.

## Backend Kotlin test review

LLM-en elsker å anta at verden vil forbli slik den tror den er akkurat nå. Kanskje testen kjører akkurat nå ved å gjøre en select og hente ut `result[1]`, men plutselig kjørte alle statementene tett nok inntil hverandre at sorteringen på tid ikke ble like spredt som den først antok, og testen brekker.

I tillegg har vi et oppsett hvor lokalt utviklingsmiljø bruker samme database til tester som til dev-miljøet. Da fylles dev-miljøet vårt opp med masse data over tid, som øker realismen. Det betyr at en test som gjør `getPaginatedItems(offset = 0, limit = 50)` kjører fint i dag, men ikke kjøret fint neste uke.

## Database migration review

LLM-en elsker å glemme at migrasjonene kjører i et levende prod-miljø.

Generelt vil vi at migrasjonene våre skal gjøre varianter av:

```
DO THING UNLESS THING IS DONE
```

Skal vi ha en ny indeks, kobler vi oss til databasen manuelt og kjører  

```sql
-- Kjøres manuelt
CREATE INDEX CONCURRENTLY IF NOT EXISTS 
  ...;
```

Selve migrasjonen blir dermed i praksis no-op:

```sql
-- Kjøres i migrasjonen
CREATE INDEX IF NOT EXISTS 
  ...;
```

Dersom vi må gjøre en backfill av data, gjør vi dette alltid utenfor migrasjoner. Dersom du legger til en kolonne og gjør en backfill i samme transaksjon, risikerer du å låse en hel tabell. Vi har beskyttet oss selv mot oss selv her, ved at migrasjons-kallene ikke får lov til å bruke mere enn 10 sekunder. Heller 10 sekunder lås og feilet utrulling, enn 5 minutter lås og tapt salg i butikk (naturligvis et helt tilfeldig valgt eksempel).

## Terminology review

LLM-en elsker å finne på sin egen terminologi.

Heldigvis har vi REKE (Reliable Enterprise Knowledge Engine). Denne OpenClaw-instansen analyserer koden vår jevnt og trutt, og bygger (blant annet) opp lister med standard terminologi i systemet, og sender oss en melding på Slack om den er usikker. Vi har en fil som heter `core-terminology.md` hvor vi kan skrive `MUST CORRECT`, slik at hverken oss menneskene eller LLM-ene klarer og snike seg unna feil bruk av terminologi.

Det _er_ faktisk ganske viktig om noe er netto eller brutto, og "total" og "amount" er ikke det samme.
