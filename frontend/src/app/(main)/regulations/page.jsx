export default function Regulations() {
  return (
    <main className="flex flex-1 flex-col w-full items-center p-10">
      <h1 className="text-3xl font-bold text-center mb-8">
        Regulamin korzystania z Serwisu
      </h1>
      <div className="flex flex-col w-8/12 bg-bg-secondary p-8 rounded-lg gap-3">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">§1. Informacje ogólne</h2>
          <p>
            Sklep internetowy dostępny pod adresem{" "}
            <strong>[adres strony] </strong>
            prowadzony jest przez <strong>[Nazwa firmy]</strong>, z siedzibą pod
            adresem <strong>[adres siedziby]</strong>.
          </p>
          <p className="mt-2">
            Regulamin określa zasady korzystania z Serwisu, składania zamówień
            oraz prawa i obowiązki Klientów i Sprzedawcy.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">§2. Definicje</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Serwis – sklep internetowy prowadzony przez Sprzedawcę.</li>
            <li>Klient – osoba składająca zamówienie w Serwisie.</li>
            <li>
              Konsument – Klient dokonujący zakupu niezwiązanego z działalnością
              gospodarczą.
            </li>
            <li>Produkt – towar dostępny w ofercie Sklepu.</li>
          </ul>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">§3. Składanie zamówień</h2>
          <p>
            Zamówienia można składać 24 godziny na dobę za pośrednictwem strony
            internetowej. Złożenie zamówienia oznacza akceptację niniejszego
            Regulaminu.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">§4. Ceny i płatności</h2>
          <p>
            Wszystkie ceny podane w Sklepie są cenami brutto. Dostępne formy
            płatności są prezentowane w trakcie składania zamówienia.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">§5. Dostawa</h2>
          <p>
            Dostawa realizowana jest na terytorium wskazanym w ofercie Sklepu.
            Szczegóły dotyczące kosztów i czasu dostawy prezentowane są podczas
            składania zamówienia.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            §6. Prawo odstąpienia od umowy
          </h2>
          <p>
            Konsument ma prawo odstąpić od umowy w terminie 14 dni bez podania
            przyczyny, zgodnie z obowiązującymi przepisami prawa.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">§7. Reklamacje</h2>
          <p>
            Reklamacje należy zgłaszać drogą elektroniczną lub pisemną.
            Sprzedawca rozpatruje reklamacje w terminie 14 dni.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">§8. Dane osobowe</h2>
          <p>
            Dane osobowe Klientów przetwarzane są zgodnie z obowiązującymi
            przepisami oraz Polityką Prywatności.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">
            §9. Postanowienia końcowe
          </h2>
          <p>
            Regulamin obowiązuje od dnia <strong>[data]</strong>. W sprawach
            nieuregulowanych zastosowanie mają przepisy prawa polskiego.
          </p>
        </section>
      </div>
    </main>
  );
}
