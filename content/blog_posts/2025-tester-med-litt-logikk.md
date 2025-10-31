---
title: Tester med litt logikk
published: 2025-10-31
author: august
tags:
  - testing
description: |
    Noen purister liker at test-caser er frie for logikk og tester mest mulig isolert. Hvis noen spør, kan du si du har fått lov av meg: litt logikk i testene dine er OK.
---
## En dårlig måte å teste to caser som henger sammen

Business case: lagerhyller kan enten ha bare én varetype i seg, eller en miks av varetyper. Dette styres med et flagg på lagerhylla.

Én måte å skrive en test for dette på, er å skrive to helt isolerte test-caser. En som tester hva som skjer når du mikser varetyper i en hylle hvor miksing ikke er tillatt, og en annen som tester hva som skjer når systemet tillater varemiksing.

```kotlin
@Test
fun `should not allow multiple SKUs in same bin `() {
    // Diverse oppsett...
    val purchaseOrder = ...
    val (skuA, skuB) = ...
    val binLocation = ...

    
    assertFalse(
        insertPurchaseOrderReceipt(
	        purchaseOrderId = purchaseOrder.id,
	        lines = listOf(
	            PurchaseOrderReceiptLine(sku = skuA, bin = binLocation),
	            PurchaseOrderReceiptLine(sku = skuA, bin = binLocation),
	        )
	        // ...
        )
    )

}

@Test
fun `should allow multiple SKUs in same bin when bin has sku policy mixed`() {
    // Diverse oppsett...
    val purchaseOrder = ...
    val (skuA, skuB) = ...
    val binLocation = ...
    
        
    patchBinLocation(binLocation, mapOf(
        BinLocation::skuPolicy to SkuPolicy.MIXED
    ))
    
    assertTrue(
        insertPurchaseOrderReceipt(
	        purchaseOrderId = purchaseOrder.id,
	        lines = listOf(
	            PurchaseOrderReceiptLine(sku = skuA, bin = binLocation),
	            PurchaseOrderReceiptLine(sku = skuA, bin = binLocation),
	        )
	        // ...
        )
    )
}
```


Puristen er fornøyd. 

* Testen har bare én assertion i seg. 
* Testen er tydelig oppdelt i tre faser: oppsett, utførelse og assertion.

Men det er noen ulemper med denne måten å teste på.
## Vedlikehold av tester over tid

Kode skal jo ikke bare skrives og forstås i isolasjon, men også leses og vedlikeholdes over tid.

Når man endrer på kode, er det ikke praktisk mulig å ha alle test-caser i hele systemet i hodet samtidig. Det er også sjelden man går igjennom test-caser i detalj etter de først er skrevet. Med mindre de feiler, da. Utfallet av dette, er at om 6 måneder er det kanskje noe annet enn hva du først trodde som får `insertPurchaseOrderReceipt` til å feile.

Hvem tester testene?

(NB: I akkurat dette tilfellet kunne man kanskje argumentert for å sjekke noe annet enn true/false, nettopp for å unngå uspesifikke asserts som ikke tåler tidens tann. Men det demonstrerer vel så mye at det er litt vanskelig å koke opp eksempler som  demonstrerer en stor mengde endringer i en stor kodebase over lang tid, når man skriver en bloggpost som man skumleser på 50 sekunder.)

## Løsning: lag en gjenbrukbar funksjon, og test før/etter i samme test

Dette kan vi løse ved å tillate bare bittelitt mere logikk i testene.

```kotlin
@Test
fun `should allow multiple SKUs in same bin when bin has sku policy mixed`() {
    // Diverse oppsett...
    val purchaseOrder = ...
    val (skuA, skuB) = ...
    val binLocation = ...
    
    val createPurchaseOrderReceipt = suspend {
        insertPurchaseOrderReceipt(
	        purchaseOrderId = purchaseOrder.id,
	        lines = listOf(
	            PurchaseOrderReceiptLine(sku = skuA, bin = binLocation),
	            PurchaseOrderReceiptLine(sku = skuA, bin = binLocation),
	        )
	        // ...
        )
    }
    
    assertFalse(createPurchaseOrderReceipt())
    
    patchBinLocation(binLocation, mapOf(
        BinLocation::skuPolicy to SkuPolicy.MIXED
    ))
    
	assertTrue(createPurchaseOrderReceipt())
}
```

Denne testen er ikke lengere en ren og fin oppsett, utførelse og assertion.

Men så leser det jo ganske mye bedre hva intensjonen med testen faktisk er: et varemottak skal i utgangspunktet feile om du plasserer ulike varer i samme hyllelokasjon. Men dersom du endrer hyllen til å ha en annen SKU Policy, får du lov.

Og denne testen tester til en viss grad seg selv også. Dersom en eller annen endring i fremtiden gjør at `insertPurchaseOrderReceipt` feiler av andre grunner enn du forutså når du skrev denne testen, vil den feile også før du endrer lagerhylla til å tillatte blanding av ulike varer i samme hylle.

God testing!