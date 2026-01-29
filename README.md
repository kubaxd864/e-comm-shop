## Autor Projektu: Jakub Sobczyk gr.3

<br/>

## Opis Projektu:

Ten Projekt to pełnoprawny sklep internetowy z funkcjonalnościami takimi jak: rejestracja użytkownika, logowanie, przeglądanie produktów, dodawanie produktów do koszyka, składanie zamówień oraz zarządzanie produktami (dodawanie, edytowanie, usuwanie) dla administratora. Projekt został stworzony przy użyciu technologii takich jak Node.js, Express.js, MySQL oraz Next.js.

<br/>

## Instalacja i Uruchomienie Aplikacji:

Po pobraniu projektu należy zainstalować wymagane pakiety oraz skonfigurować bazę danych MySQL z pliku e-comm_shop.sql

```
npm install
```

Następnie należy stworzyć plik .env w folderze backend i ustawić w nim zmienne środowiskowe i klucze zgodnie z plikiem .env.example
Potem przejdź do folderu frontend i wpisz:

```
npm run dev
```

Następnie przejdź do folderu backend i wpisz aby uruchomić serwer:

```
nodemon server.js
```

<br/>

## Uruchomienie Testów Aplikacji:

Aby uruchomić unit testy aplikacji, należy przejść do folderu backend i wpisać w terminalu:

```
npm run test:unit
```

Aby uruchomić testy api aplikacji, należy przejść do folderu backend i wpisać w terminalu:

```
npm run test:api
```

Aby sprawdzić code coverage, należy wpisać w terminalu:

```
npx cross-env NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules npx jest __tests__/ --coverage
```
