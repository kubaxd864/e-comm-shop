export default function Privacy() {
  return (
    <main className="flex flex-1 flex-col w-full items-center p-10 ">
      <h1 className="text-3xl font-bold text-center mb-8">
        Polityka Prywatności
      </h1>
      <div className="flex flex-col w-8/12 bg-bg-secondary p-8 rounded-lg gap-3">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">1. Informacje ogólne</h2>
          <p>
            Dbamy o ochronę danych osobowych użytkowników Serwisu i przetwarzamy
            je zgodnie z obowiązującymi przepisami prawa, w szczególności:
            <ul className="list-disc pl-6 space-y-1 p-2">
              <li>
                Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679
                (RODO),
              </li>
              <li>ustawą o ochronie danych osobowych.</li>
            </ul>
            Administratorem danych osobowych jest: [Nazwa firmy] [Forma prawna]
            [Adres siedziby] E-mail: [adres e-mail]
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            2. Zakres przetwarzanych danych
          </h2>
          <p>
            W zależności od sposobu korzystania z Serwisu, możemy przetwarzać
            następujące dane osobowe:
            <ul className="list-disc pl-6 space-y-1 p-2">
              <li>
                dane kontaktowe: imię i nazwisko, adres e-mail, numer telefonu,
              </li>
              <li>dane adresowe: adres zamieszkania lub adres dostawy,</li>
              <li>
                dane niezbędne do realizacji zamówień (np. dane do faktury),
              </li>
              <li>
                inne dane przekazane dobrowolnie przez użytkownika w
                formularzach.
              </li>
            </ul>
            Podanie danych jest dobrowolne, jednak niezbędne do zawarcia umowy i
            realizacji zamówienia.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            3. Cele przetwarzania danych
          </h2>
          <p>
            Dane osobowe przetwarzane są w następujących celach:
            <ul className="list-disc pl-6 space-y-1 p-2">
              <li>realizacji zamówień i umów sprzedaży,</li>
              <li>obsługi konta użytkownika,</li>
              <li>kontaktu z klientem w sprawach związanych z zamówieniem,</li>
              <li>
                realizacji obowiązków prawnych ciążących na Administratorze,
              </li>
              <li>rozpatrywania reklamacji i zwrotów.</li>
            </ul>
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            4. Podstawa prawna przetwarzania
          </h2>
          <p>
            Dane osobowe przetwarzane są na podstawie:
            <ul className="list-disc pl-6 space-y-1 p-2">
              <li>art. 6 ust. 1 lit. b RODO – wykonanie umowy,</li>
              <li>art. 6 ust. 1 lit. c RODO – obowiązek prawny,</li>
              <li>
                art. 6 ust. 1 lit. f RODO – prawnie uzasadniony interes
                Administratora.
              </li>
            </ul>
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">5. Odbiorcy danych</h2>
          <p>
            Dane osobowe nie są przekazywane osobom trzecim, z wyjątkiem
            podmiotów współpracujących z Administratorem w zakresie realizacji
            zamówień, w szczególności:
            <ul className="list-disc pl-6 space-y-1 p-2">
              <li>firm kurierskich i pocztowych,</li>
              <li>operatorów płatności,</li>
              <li>dostawców usług IT i hostingowych.</li>
            </ul>
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            6. Okres przechowywania danych
          </h2>
          <p>
            Dane osobowe przechowywane są przez okres:
            <ul className="list-disc pl-6 space-y-1 p-2">
              <li>niezbędny do realizacji umowy,</li>
              <li>wymagany przepisami prawa (np. podatkowymi),</li>
              <li>do momentu przedawnienia ewentualnych roszczeń.</li>
            </ul>
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">7. Prawa użytkownika</h2>
          <p>
            Każdemu użytkownikowi przysługuje prawo do:
            <ul className="list-disc pl-6 space-y-1 p-2">
              <li>dostępu do swoich danych,</li>
              <li>ich sprostowania,</li>
              <li>usunięcia danych („prawo do bycia zapomnianym”),</li>
              <li>ograniczenia przetwarzania,</li>
              <li>przenoszenia danych,</li>
              <li>wniesienia sprzeciwu wobec przetwarzania,</li>
              <li>
                wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych.
              </li>
            </ul>
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            8. Bezpieczeństwo danych
          </h2>
          <p>
            Administrator stosuje odpowiednie środki techniczne i organizacyjne
            w celu zapewnienia ochrony przetwarzanych danych osobowych przed ich
            utratą, nieuprawnionym dostępem lub naruszeniem.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            9. Zmiany Polityki Prywatności
          </h2>
          <p>
            Administrator zastrzega sobie prawo do wprowadzania zmian w Polityce
            Prywatności. Aktualna wersja dokumentu jest zawsze dostępna w
            Serwisie.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">10. Kontakt</h2>
          <p>
            W sprawach związanych z ochroną danych osobowych można kontaktować
            się z Administratorem pod adresem e-mail: [adres e-mail]
          </p>
        </section>
      </div>
    </main>
  );
}
