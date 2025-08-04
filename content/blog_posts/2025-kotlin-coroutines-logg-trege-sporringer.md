---
title: En kjekk Kotlin-funksjon som logger trege SQL-er
published: 2025-08-04
author: august
description: |
    Coroutines er kraftige saker! Vi har laget oss en kjekk liten funksjon vi kan pakke SQL-er (og hva som helst async, egentlig) inn i, som logger en feil om det tok mere enn 10 sekunder.
---

## Null hull og latency

Vi kjører "null hull". Det vil si at alle feil skal håndteres. Alle feil som skjer i prod havner i en Slack-kanal. 

Vi fant like greit ut at trege SQL-er kan falle under "null hull." Alle SQL-ene våre bør bli ferdig i god tid før det har gått en sånn ca. 2-3 sekunder. P99 latency er jo en greie, og vi kjører tross alt i clouden, så for å være på den sikre siden, satt vi en grense på 10 sekunder.

Alle spørringer som ikke er ferdige etter 10 sekunder, skal logge en feil.

## Funksjonen som bruker alle triks i boka

Her er funksjonen:

```kotlin
suspend fun <T> CoroutineScope.logSlowQueries(
    block: suspend () -> T
): T {
  val loggerTask = async {
    delay(Duration.ofSeconds(10))
    val otel = Span.current().spanContext

    if (otel.isValid) {
      log.error("Slow query! traceId=${otel.traceId} spanId=${otel.spanId}")
    } else {
      log.error("Slow query! NO OTEL CTX AVAILABLE")
    }
  }

  return try {
    block()
  } finally {
    loggerTask.cancel()
  }
}
```

Denne funksjonen bruker så godt som alle triksene i Kotlin-boka.

Funksjonen er en _extension function_ over `CoroutineScope`. Det betyr at funksjonen bare kan kalles i en kontekst hvor `this` enten implisitt eller eksplisitt er en coroutine. 

Funksjonen er også en _higher order function_. Det vil si at det er en funksjon som tar imot en annen funksjon - `block`. Den bruker generics til å si at vi bryr oss null og niks om hva `block` returnerer, men at returverdien av funksjonen vår er det samme som returverdien av `block`. Det er helt OK for dette bruksområdet - poenget er å logge en feil etter 10 sekunder, uavhengig av hva som skjer i omverdenen rundt.

I et coroutine scope finnes `async`. Dette er en liten helper som starter et nytt coroutine scope, og starter og kjøre den umiddelbart - men asynkront.

Det første `loggerTask` gjør, er å bruke `delay` til å vente i 10 sekunder. I motsetning til `Thread.sleep` som holder på en hel JVM-tråd, snakker `delay` med Kotlin sitt coroutine-maskineri og lar den håndtere trådene. I praksis blir jobben satt på pause, og etter det har gått sånn ca. 10 sekunder (basert på en scheduled thread pool executor), blir jobben fortsatt. Eller continued, om du vil. Dette er sånn "coroutines" har fått navnet sitt, siden de er basert på continuations under panseret.

`Duration` er en super liten greie på JVM-en som lar deg representere tidsverdier som hakket mindre magiske tall. `Duration.ofSeconds(10)` leser mye bedre enn 10000. Dessuten er den helt fri for en antagelse om hva basis-enheten for tid er, som jo kan være litt forvirrende noen ganger. (Er det sekunder? Millisekunder? Noe annet?)

Så må vi jo kalle `block` - det er der SQL-en faktisk kjører. Når den har kjørt ferdig, kaller vi `cancel` på `loggerTask`. Det betyr at om den ikke har rukket å vente ferdig på `delay`-pausen sin, avbrytes hele greia, og ingen feil logges. Dersom `block` faktisk tok mere enn 10 sekunder, så kjører fortsatt `loggerTask`, og den fortsetter etter `delay` og logger en feil som pinger Slack-kanalen vår, og alt er som forventet.

(Og med "alle triks i boka", mener jeg selvfølgelig [denne boka](https://www.amazon.com/Pro-Kotlin-Apps-Scratch-Production-ready/dp/1484290569) 😇)

## Funksjonen i bruk

Her er et eksempel på hvordan denne funksjonen kalles om du for eksempel bruker [Kotliquery](github.com/seratch/kotliquery) til å kjøre SQL-ene dine, som vi gjør.


```kotlin
import javax.sql.DataSource
import kotliquery.sessionOf
import kotliquery.queryOf

suspend fun myBusinessLogicThingie(
    dataSource: DataSource
): List<MyBusinessObject> {
    logSlowQueries {
        sessionOf(dataSource).use { session ->
            session.list(queryOf("SELECT ..."))
        }
    }
}
```

I praksis har vi puttet `logSlowQueries` i helper-funksjoner vi har for å instrumentere og sette opp Kotliquery-sessions med diverse defaults for timeouts, strict mode, osv.

## Open Telemetry redder dagen

Det eneste som ble litt knotete, var ønsket om å inkludere noe nyttig informasjon om hvilken SQL det faktisk er som tar lang tid på å bli ferdig!

I og med at konteksten er en coroutine, går  det ikke an å bare fiske ut `Thread.currentThread().stackTrace` eller noe i den duren, siden det vil være tråden inne i Kotlin-maskineriet som kjører `loggerTask`, ikke koden som faktisk kjører SQL-en i `block`.

Heldigvis har vi instrumentert koden vår med OpenTelemetry! Ved å inkluderer Open Telemetry sin traceId og spanId, får vi all konteksten vi trenger for å finne igjen feilen fra loggmeldinga.

```kotlin
log.error("Slow query! traceId=${otel.traceId} spanId=${otel.spanId}")
```

I loggen blir dette seendes omtrent sånn ut:

```
2025-08-04 16:27:54,291 [DefaultDispatcher-worker-8] 
ERROR snowbee.homeless.DbUtils 
Slow query! traceId=7ab39842f4af2662feec8d3a63d32aa4 spanId=f4eb591777d2818a
```

Dermed kan vi bare søke opp trace `7ab39842f4af2662feec8d3a63d32aa4` i Honeycomb hvor vi poster all telemetrien vår, og se nøyaktig hvilken kontekst den trege spørringen kjørte i.

![Skjermbilde av HoneyComb som viser en trestruktur med traces og spans hvor API-kallet som førte til den trege spørringen er tydelig navngitt med HTTP-metode og URL](/images/2025-kotlin-coroutines-logg-trege-sporringer/honeycomb_context.png)

Ikke overraskende, tok spørringen vår som henter ut full lagerstatus for alle produkter i en nettbutikk litt mere tid enn snittspørringen i systemet. (Og her hadde vi satt varseltiden til 2 sekunder, for å teste litt hvordan det oppførte seg i praksis).