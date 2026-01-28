-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sty 28, 2026 at 08:04 PM
-- Wersja serwera: 10.4.32-MariaDB
-- Wersja PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `e-comm_shop`
--

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `carts`
--

CREATE TABLE `carts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`id`, `user_id`, `created_at`) VALUES
(7, 8, '2025-12-27 20:16:01'),
(9, 9, '2025-12-29 13:45:33'),
(12, 1, '2026-01-20 22:31:41');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(11) NOT NULL,
  `cart_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

--
-- Dumping data for table `cart_items`
--

INSERT INTO `cart_items` (`id`, `cart_id`, `product_id`, `quantity`) VALUES
(26, 7, 3, 1);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `is_active`) VALUES
(1, 'Elektronika', 'elektronika', NULL, 1),
(2, 'Telefony', 'telefony', 1, 1),
(3, 'Smartfony', 'smartfony', 2, 1),
(4, 'Laptopy', 'laptopy', 1, 1),
(5, 'Moda', 'moda', NULL, 1),
(6, 'Obuwie', 'obuwie', 5, 1),
(7, 'Dom i Ogród', 'dom', NULL, 1),
(8, 'Dziecko', 'dziecko', NULL, 1),
(9, 'Kolekcje i Sztuka', 'sztuka', NULL, 1),
(10, 'Kultura i Rozrywka', 'kultura', NULL, 1),
(11, 'Nieruchomości', 'nieruchomości', NULL, 1),
(12, 'Sport i Rekreacja', 'sport', NULL, 1),
(14, 'Uroda', 'uroda', NULL, 1),
(15, 'Zdrowie', 'zdrowie', NULL, 1),
(16, 'Promocja', 'promocja', NULL, 1),
(17, 'Motoryzacja', 'motoryzacja', NULL, 1),
(18, 'Konsole', 'konsole', 1, 1);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL,
  `chat_room_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `sender_role` enum('client','admin') NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

--
-- Dumping data for table `chat_messages`
--

INSERT INTO `chat_messages` (`id`, `chat_room_id`, `sender_id`, `sender_role`, `content`, `created_at`) VALUES
(1, 1, 1, '', 'Witaj', '2026-01-19 22:38:21'),
(2, 1, 2, '', 'Jak się masz', '2026-01-19 22:39:13'),
(3, 1, 1, '', 'Dobrze', '2026-01-20 00:03:50'),
(4, 1, 1, '', 'Ok', '2026-01-20 00:04:11'),
(5, 1, 1, '', 'awdawdawd', '2026-01-20 00:43:40'),
(6, 1, 1, '', 'awdawd', '2026-01-20 00:43:41'),
(7, 1, 1, '', 'wdadawd', '2026-01-20 00:43:42'),
(8, 1, 1, '', 'awdawdawd', '2026-01-20 00:43:44'),
(9, 1, 1, '', 'awdawd', '2026-01-20 00:43:45'),
(10, 1, 1, '', 'awda', '2026-01-20 00:43:48'),
(11, 1, 1, '', 'awawdawd', '2026-01-20 00:43:51'),
(12, 7, 1, '', 'Dzień dobry', '2026-01-20 18:28:39'),
(13, 7, 1, '', 'awdadw', '2026-01-20 18:28:45'),
(14, 7, 1, '', 'Witaj', '2026-01-20 21:28:35'),
(15, 1, 1, '', 'Jest ok', '2026-01-20 21:28:47'),
(16, 1, 1, '', 'Test', '2026-01-20 21:45:43');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `chat_rooms`
--

CREATE TABLE `chat_rooms` (
  `id` int(11) NOT NULL,
  `context_type` enum('order','product') NOT NULL,
  `context_id` int(11) NOT NULL,
  `shop_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `last_message_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

--
-- Dumping data for table `chat_rooms`
--

INSERT INTO `chat_rooms` (`id`, `context_type`, `context_id`, `shop_id`, `client_id`, `created_at`, `last_message_at`) VALUES
(1, 'product', 3, 1, 1, '2026-01-19 21:21:12', '2026-01-20 21:45:43'),
(3, 'product', 1, 1, 1, '2026-01-19 23:05:28', '2026-01-19 23:05:28'),
(5, 'order', 13, 1, 1, '2026-01-20 18:22:35', '2026-01-20 18:22:35'),
(7, 'order', 10, 1, 1, '2026-01-20 18:27:22', '2026-01-20 21:28:35');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `favorites`
--

CREATE TABLE `favorites` (
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

--
-- Dumping data for table `favorites`
--

INSERT INTO `favorites` (`user_id`, `product_id`, `created_at`) VALUES
(1, 2, '2025-12-22 23:35:24'),
(1, 15, '2025-12-29 22:07:47'),
(1, 31, '2025-12-22 23:35:27'),
(8, 4, '2025-12-27 19:50:29'),
(8, 5, '2025-12-27 19:50:35');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('opłacone','potwierdzone','wysłane','anulowane') DEFAULT 'opłacone',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total_amount`, `status`, `created_at`) VALUES
(5, 1, 153.98, 'wysłane', '2025-12-14 17:33:04'),
(6, 1, 148.98, 'anulowane', '2025-12-14 17:38:27'),
(8, 1, 225.99, 'wysłane', '2025-12-14 18:29:16'),
(9, 1, 218.99, 'wysłane', '2025-12-16 18:38:58'),
(10, 1, 51.99, 'opłacone', '2025-12-23 20:32:00'),
(11, 9, 2093.04, 'opłacone', '2025-12-29 13:45:25'),
(12, 1, 171.00, 'opłacone', '2025-12-29 18:43:19'),
(13, 1, 5226.99, 'opłacone', '2025-12-30 11:15:19'),
(14, 1, 42.99, 'opłacone', '2026-01-20 22:31:31');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`) VALUES
(3, 5, 2, 1, 39.99),
(4, 5, 17, 1, 79.99),
(5, 6, 2, 1, 39.99),
(6, 6, 17, 1, 79.99),
(8, 8, 11, 1, 199.00),
(9, 9, 6, 1, 199.99),
(10, 10, 2, 1, 39.99),
(11, 11, 1, 1, 1899.00),
(12, 11, 9, 1, 159.00),
(13, 12, 18, 1, 159.00),
(14, 13, 11, 2, 199.00),
(15, 13, 31, 1, 4800.00),
(16, 14, 14, 1, 29.99);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `category_id` int(50) NOT NULL,
  `description` text DEFAULT NULL,
  `quantity` int(4) NOT NULL,
  `size` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`size`)),
  `parameters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`parameters`)),
  `store_id` int(11) DEFAULT NULL,
  `item_condition` enum('Używane','Nowe') NOT NULL DEFAULT 'Nowe',
  `price` decimal(10,2) NOT NULL,
  `promotion_price` decimal(10,2) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `category_id`, `description`, `quantity`, `size`, `parameters`, `store_id`, `item_condition`, `price`, `promotion_price`, `created_by`, `is_active`, `created_at`) VALUES
(1, 'Samsung Galaxy A55 5G', 3, 'Nowoczesny smartfon z aparatem 64MP i ekranem AMOLED.', 1, '{\"weight\":0.5,\"width\":20,\"height\":6,\"length\":13}', '{\"brand\": \"Samsung\",\"model\": \"Galaxy A55 5G\",\"imei\": \"35678915623678\",\"ram\": \"6 GB\",\"pamiec_wewnetrzna\": \"64 GB\",\"ekran\": \"6.7\\\" AMOLED\",\"bateria\": \"4500 mAh\"}', 1, 'Nowe', 1899.00, NULL, 1, 1, '2025-11-30 13:47:57'),
(2, 'Etui Silikonowe do Telefonu', 2, 'Elastyczne etui ochronne pasujące do wielu modeli.', 1, '{\"weight\":0.20,\"width\":18,\"height\":5,\"length\":12}', '{     \"material\": \"Silikon\",     \"kompatybilnosc\": \"Uniwersalne\",     \"kolor\": \"Czarny\",     \"ochrona\": \"Antyudarowa\",     \"grubosc\": \"1.5 mm\",     \"waga\": \"0.05 kg\"   }', 2, 'Używane', 39.99, NULL, 1, 1, '2025-11-30 13:47:57'),
(3, 'Laptop Business Pro 15', 4, 'Laptop klasy biznesowej z procesorem i5 i 512GB SSD.', 1, '{\"weight\":2.70,\"width\":45,\"height\":12,\"length\":32}', '{\"brand\": \"Business Pro\",\"model\": \"Business Pro 15\",\"procesor\": \"Intel Core i7-12700H\",\"ram\": \"16 GB\",\"dysk\": \"512 GB SSD\",\"ekran\": \"15.6\\\" Full HD\",\"system\": \"Windows 11 Pro\"}', 2, 'Nowe', 3599.00, NULL, 1, 1, '2025-11-30 13:47:57'),
(4, 'Bluza Damska SoftTouch', 5, 'Miękka i ciepła bluza damska z kapturem.', 1, '{\"weight\":0.80,\"width\":35,\"height\":12,\"length\":30}', '{     \"producent\": \"SoftWear\",     \"material\": \"80% bawełna, 20% poliester\",     \"rozmiar\": \"M\",     \"kolor\": \"Beżowy\",     \"kroj\": \"Regular\",     \"gramatura\": \"280 g/m²\"   }', 2, 'Używane', 129.90, NULL, 1, 1, '2025-11-30 13:47:57'),
(5, 'Buty Sportowe RunnerX', 6, 'Lekkie obuwie sportowe idealne do biegania.', 2, '{\"weight\":1.40,\"width\":28,\"height\":20,\"length\":38}', '{     \"producent\": \"RunnerX\",     \"model\": \"RX-Speed\",     \"rozmiar\": \"42\",     \"material_cholewki\": \"Siatka syntetyczna\",     \"typ\": \"Biegowe\",     \"waga\": \"0.45 kg\"   }', 1, 'Używane', 249.00, NULL, 1, 1, '2025-11-30 13:47:57'),
(6, 'Zestaw Noży KitchenPro 5w1', 7, 'Profesjonalny zestaw noży kuchennych ze stali nierdzewnej.', 3, '{\"weight\":1.70,\"width\":20,\"height\":12,\"length\":45}', '{     \"producent\": \"KitchenPro\",     \"model\": \"ChefSet 5w1\",     \"liczba_elementow\": 5,     \"material_ostrza\": \"Stal nierdzewna\",     \"material_rekojesci\": \"ABS\",     \"waga\": \"1.7 kg\"   }', 3, 'Używane', 199.99, NULL, 1, 1, '2025-11-30 13:47:57'),
(7, 'Wózek Dziecięcy ComfortRide', 8, 'Wielofunkcyjny wózek spacerowy dla dzieci.', 1, '{\"weight\":11.0,\"width\":75,\"height\":55,\"length\":105}', '{     \"producent\": \"ComfortRide\",     \"typ\": \"Wózek spacerowy\",     \"zakres_wiekowy\": \"0–36 miesięcy\",     \"maksymalne_obciazenie\": \"22 kg\",     \"regulacja_oparcia\": true,     \"waga\": \"11 kg\"   }', 3, 'Używane', 899.00, NULL, 1, 0, '2025-11-30 13:47:57'),
(8, 'Obraz Olejny „Zachód Słońca”', 9, 'Ręcznie malowany obraz na płótnie.', 1, '{\"weight\":2.0,\"width\":70,\"height\":10,\"length\":90}', '{     \"autor\": \"Jan Kowalski\",     \"technika\": \"Olej na płótnie\",     \"wymiary\": \"70x50 cm\",     \"rok_powstania\": 2023,     \"unikat\": true,     \"rama\": \"Drewniana\"   }', 3, 'Używane', 349.00, NULL, 1, 1, '2025-11-30 13:47:57'),
(9, 'Zestaw Gier Planszowych PartyPack', 10, 'Zestaw 3 gier idealnych na imprezy.', 1, '{\"weight\":2.3,\"width\":35,\"height\":20,\"length\":45}', ' {     \"producent\": \"GiftBox\",     \"liczba_elementow\": 10,     \"przeznaczenie\": \"Impreza\",     \"okazja\": \"Urodziny\",     \"opakowanie\": \"Karton prezentowy\",     \"waga\": \"2.3 kg\"   }', 1, 'Używane', 159.00, NULL, 1, 1, '2025-11-30 13:47:57'),
(10, 'Mieszkanie 45m2 – Oferta Testowa', 11, 'Przykładowa oferta nieruchomości, tylko test.', 1, '{\"weight\":15,\"width\":120,\"height\":120,\"length\":120}', '{     \"typ\": \"Mieszkanie\",     \"powierzchnia\": \"45 m²\",     \"liczba_pokoi\": 2,     \"pietro\": 3,     \"rynek\": \"Wtórny\",     \"stan\": \"Do zamieszkania\"   }', 1, 'Używane', 299000.00, NULL, 1, 0, '2025-11-30 13:47:57'),
(11, 'Piłka Nożna ProMatch', 12, 'Profesjonalna piłka nożna FIFA Quality Pro.', 2, '{\"weight\":0.80,\"width\":26,\"height\":26,\"length\":26}', '{     \"producent\": \"Puma\",     \"typ\": \"Piłka nożna\",     \"rozmiar\": 5,     \"material\": \"Poliuretan\",     \"przeznaczenie\": \"Trawa\",     \"certyfikat\": \"FIFA Quality\"   }', 1, 'Używane', 199.00, NULL, 1, 1, '2025-11-30 13:47:57'),
(13, 'Krem Nawilżający SkinCare 24h', 14, 'Krem nawilżający do skóry wrażliwej.', 1, '{\"weight\":0.45,\"width\":12,\"height\":10,\"length\":16}', '{     \"producent\": \"SkinCare\",     \"pojemnosc\": \"50 ml\",     \"typ_skory\": \"Sucha\",     \"dzialanie\": \"Nawilżające\",     \"skladnik_aktywny\": \"Kwas hialuronowy\",     \"data_waznosci\": \"2026-12-31\"   }', 2, 'Używane', 49.99, NULL, 1, 1, '2025-11-30 13:47:57'),
(14, 'Witamina D3 4000IU', 15, 'Suplement diety wspierający odporność.', 1, '{\"weight\":0.30,\"width\":10,\"height\":10,\"length\":14}', ' {     \"producent\": \"HealthPlus\",     \"skladnik\": \"Witamina D3\",     \"dawka\": \"4000 IU\",     \"ilosc_kapsulek\": 120,     \"forma\": \"Tabletki\",     \"data_waznosci\": \"2027-06-01\"   }', 2, 'Używane', 29.99, NULL, 1, 1, '2025-11-30 13:47:57'),
(15, 'Zestaw Promocyjny SmartHome Pack', 16, 'Promocyjny zestaw inteligentnych urządzeń do domu.', 1, '{\"weight\":3.90,\"width\":32,\"height\":20,\"length\":40}', '{     \"producent\": \"HomeTech\",     \"liczba_urzadzen\": 5,     \"kompatybilnosc\": [\"Google Home\", \"Amazon Alexa\"],     \"lacznosc\": \"Wi-Fi\",     \"przeznaczenie\": \"Automatyka domowa\",     \"gwarancja\": \"24 miesiące\"   }', 2, 'Nowe', 599.00, 499.00, 1, 1, '2025-11-30 13:47:57'),
(16, 'Zestaw Kluczy Mechanicznych 32 el.', 17, 'Profesjonalny zestaw kluczy do auta.', 2, '{\"weight\":3.0,\"width\":35,\"height\":15,\"length\":45}', '{     \"producent\": \"ToolMaster\",     \"liczba_elementow\": 32,     \"material\": \"Stal chromowo-wanadowa\",     \"typ\": \"Nasadowe\",     \"rozmiary\": \"8–32 mm\",     \"etui\": \"Walizka plastikowa\"   }', 2, 'Nowe', 189.00, NULL, 1, 1, '2025-11-30 13:47:57'),
(17, 'Powerbank 10 000 mAh SlimCharge', 1, 'Kompaktowy powerbank z szybkim ładowaniem.', 1, '{\"weight\":0.45,\"width\":12,\"height\":6,\"length\":18}', '{     \"producent\": \"SlimCharge\",     \"pojemnosc\": \"10 000 mAh\",     \"zlacza\": [\"USB-A\", \"USB-C\"],     \"szybkie_ladowanie\": \"tak\",     \"grubosc\": \"14 mm\",     \"waga\": \"0.25 kg\"   }', 3, 'Używane', 79.99, NULL, 1, 1, '2025-11-30 13:47:57'),
(18, 'Zegarek SmartFit Mini dla dzieci', 8, 'Kolorowy zegarek z GPS dla najmłodszych.', 1, '{\"weight\":0.35,\"width\":12,\"height\":8,\"length\":12}', '{     \"producent\": \"SmartFit\",     \"przeznaczenie\": \"Dla dzieci\",     \"ekran\": \"1.4\\\" TFT\",     \"funkcje\": [\"GPS\", \"SOS\", \"Krokomierz\"],     \"wodoodpornosc\": \"IP67\",     \"czas_pracy\": \"2 dni\"   }', 1, 'Nowe', 159.00, NULL, 1, 1, '2025-11-30 13:47:57'),
(19, 'Grill Ogrodowy SteelGrill 50', 7, 'Masywny grill węglowy do ogrodu.', 1, '{\"weight\":25.0,\"width\":55,\"height\":45,\"length\":60}', '{     \"producent\": \"SteelGrill\",     \"typ\": \"Węglowy\",     \"srednica_rusztu\": \"50 cm\",     \"material_konstrukcji\": \"Stal lakierowana\",     \"pokrywa\": \"tak\",     \"waga\": \"25 kg\"   }', 1, 'Używane', 399.00, NULL, 1, 1, '2025-11-30 13:47:57'),
(20, 'Perfumy Fresh Breeze 50ml', 14, 'Lekki, świeży zapach idealny na co dzień.', 2, '{\"weight\":0.40,\"width\":10,\"height\":12,\"length\":10}', '{\"producent\": \"AromaLab\",     \"pojemnosc\": \"50 ml\",     \"rodzaj_zapachu\": \"Świeży\",     \"nuty_zapachowe\": [\"Cytrusy\", \"Jaśmin\", \"Piżmo\"],     \"koncentracja\": \"EDP\",     \"dla_kogo\": \"Unisex\"   }', 2, 'Używane', 89.90, NULL, 1, 1, '2025-11-30 13:47:57'),
(21, 'Samsung Galaxy S23 Ultra', 3, 'Samsung Galaxy S23 Ultra to flagowy smartfon stworzony z myślą o najbardziej wymagających użytkownikach. Wyposażony w potężny aparat 200 MP oferuje niezwykle szczegółowe zdjęcia oraz świetną jakość nagrań wideo nawet w trudnych warunkach oświetleniowych. Duży ekran Dynamic AMOLED 2X 6.8 cala zapewnia doskonałą płynność oraz głębię kolorów, dzięki czemu idealnie sprawdza się do gier i oglądania filmów. Całość uzupełnia bardzo wydajna bateria oraz niezawodny procesor Snapdragon 8 Gen 2.', 1, '{\"weight\":0.55,\"width\":20,\"height\":6,\"length\":12}', '{\"brand\": \"Samsung\",\"model\": \"Galaxy S23 Ultra\",\"imei\": \"356789104523678\",\"ram\": \"12 GB\",\"pamiec_wewnetrzna\": \"256 GB\",\"ekran\": \"6.8\\\" AMOLED\",\"bateria\": \"5000 mAh\"}', 1, 'Nowe', 5699.00, NULL, 1, 1, '2025-12-04 16:17:22'),
(22, 'Xiaomi 13 Pro', 3, 'Xiaomi 13 Pro wyróżnia się aparatem stworzonym we współpracy z renomowaną firmą Leica, co przekłada się na wyjątkową naturalność kolorów i jakość fotografii. Smartfon wyposażono w zakrzywiony ekran AMOLED 120 Hz, dzięki czemu zapewnia niezwykle płynne działanie i świetne odwzorowanie barw. Szybkie ładowanie 120W pozwala uzupełnić baterię do pełna w kilkanaście minut, co jest ogromną zaletą w codziennym użytkowaniu. To propozycja dla osób poszukujących nowoczesnego i wydajnego flagowca.', 1, '{\"weight\":0.55,\"width\":20,\"height\":6,\"length\":12}', '{\"brand\": \"Xiaomi\",\"model\": \"13 Pro\",\"imei\": \"356789104523680\",\"ram\": \"12 GB\",\"pamiec_wewnetrzna\": \"256 GB\",\"aparat\": \"50 MP Leica\",\"bateria\": \"4820 mAh\"}', 2, 'Używane', 3499.00, NULL, 1, 1, '2025-12-04 16:17:22'),
(23, 'Apple iPhone 14 Pro', 3, 'iPhone 14 Pro to konstrukcja wyznaczająca nowe standardy, dzięki funkcjom takim jak Dynamic Island i aparat 48 MP oferujący znacznie lepsze zdjęcia w słabym świetle. Procesor A16 Bionic zapewnia błyskawiczną pracę systemu oraz aplikacji, a ekran Super Retina XDR gwarantuje perfekcyjne odwzorowanie kolorów. Smartfon świetnie sprawdza się w rękach osób zajmujących się fotografią mobilną oraz nagrywaniem filmów w wysokiej rozdzielczości. To jedno z najbardziej dopracowanych urządzeń w historii Apple.', 2, '{\"weight\":0.50,\"width\":20,\"height\":6,\"length\":12}', '{\"brand\": \"Apple\",\"model\": \"iPhone 14 Pro\",\"imei\": \"356789104523679\",\"ram\": \"6 GB\",\"pamiec_wewnetrzna\": \"128 GB\",\"ekran\": \"6.1\\\" OLED\",\"system\": \"iOS 17\"}', 1, 'Nowe', 5799.00, NULL, 1, 1, '2025-12-04 16:17:22'),
(24, 'Huawei P50 Pro', 3, 'Huawei P50 Pro to smartfon stworzony z myślą o fotografach mobilnych, wyposażony w zaawansowany system aparatów umożliwiający uzyskiwanie ostrych i pełnych detali zdjęć. Jego ekran OLED 120 Hz oferuje świetną płynność oraz głębokie kontrasty, które podnoszą komfort codziennego użytkowania. Solidna konstrukcja obudowy jest odporna na wodę i kurz, co sprawia, że smartfon świetnie sprawdza się nawet w trudnych warunkach. Mimo braku usług Google, urządzenie pozostaje jednym z najlepiej wykonanych telefonów w swojej klasie.', 1, '{\"weight\":0.55,\"width\":20,\"height\":6,\"length\":12}', '{\"brand\": \"Huawei\",\"model\": \"P50 Pro\",\"imei\": \"356789104523682\",\"ram\": \"8 GB\",\"pamiec_wewnetrzna\": \"256 GB\",\"aparat\": \"50 MP Ultra Vision\",\"system\": \"HarmonyOS\"}', 3, 'Używane', 2899.00, NULL, 1, 1, '2025-12-04 16:17:22'),
(25, 'OnePlus 11 5G', 3, 'OnePlus 11 5G to smartfon, który łączy wysoką wydajność z eleganckim i nowoczesnym designem. Dzięki procesorowi Snapdragon 8 Gen 2 oraz ekranowi AMOLED 120 Hz urządzenie zapewnia błyskawiczne działanie oraz niezwykle płynne animacje. Współpraca z firmą Hasselblad przy tworzeniu aparatów przekłada się na realistyczne odwzorowanie kolorów oraz świetne zdjęcia w różnych warunkach. To idealna propozycja dla osób szukających urządzenia premium w rozsądnej cenie.', 1, '{\"weight\":0.55,\"width\":20,\"height\":6,\"length\":12}', '{\"brand\": \"OnePlus\",\"model\": \"11 5G\",\"imei\": \"356789104523681\",\"ram\": \"16 GB\",\"pamiec_wewnetrzna\": \"256 GB\",\"ekran\": \"6.7\\\" Fluid AMOLED\",\"ladowanie\": \"100 W SuperVOOC\"}', 1, 'Nowe', 3999.00, NULL, 1, 1, '2025-12-04 16:17:22'),
(31, 'Laptop Razer Blade 15 2022', 4, 'Przedstawiamy nowy Razer Blade 15, teraz dostępny z najnowszym procesorem Intel® Core™ 12. generacji (14-rdzeniowym) i procesorami graficznymi NVIDIA® GeForce RTX™ z serii 30 dla laptopów. najpotężniejsza grafika do laptopów do gier w historii. Mając do wyboru wyświetlacz Full HD 360 Hz, QHD 240 Hz (G-SYNC) lub nowy UHD 144 Hz, ciesz się niezrównaną wydajnością w najcieńszej 15-calowej obudowie laptopa RTX do gier w historii.', 1, '{\"weight\":3.5,\"width\":30,\"height\":15,\"length\":50}', '{\"brand\": \"Razer\",\"model\": \"Blade 16\",\"procesor\": \"Intel Core i9-13950HX\",\"ram\": \"32 GB\",\"dysk\": \"1 TB SSD\",\"karta_graficzna\": \"NVIDIA RTX 4080\",\"ekran\": \"16\\\" QHD+ 240 Hz\"}', 2, 'Nowe', 4800.00, NULL, 1, 1, '2025-12-22 21:37:48'),
(32, 'Konsola PSP 3000 Niebieska', 18, 'Sony PSP 3000 – przenośna rozrywka w wyjątkowej formie!\r\nKonsola oferuje wyraźny, 4,3-calowy ekran z bogatymi kolorami i redukcją odblasków, zapewniając komfort grania nawet w jasnym świetle. Dzięki wbudowanym głośnikom stereo i mikrofonowi możesz cieszyć się nie tylko ulubionymi grami, ale także komunikacją podczas rozgrywki online. Lekka, ergonomiczna konstrukcja oraz szeroka biblioteka tytułów – od ekskluzywnych hitów po emulację klasyków – sprawiają, że PSP 3000 to idealny towarzysz w podróży i codziennej rozrywki.', 1, '{\"weight\":1,\"width\":17,\"height\":7.5,\"length\":3}', '{     \"brand\": \"Sony\",     \"model\": \"PSP 3000\",     \"kolor\": \"Niebieski\",     \"ekran\": \"4.3\\\" LCD\",     \"pamiec\": \"Memory Stick Pro Duo\",     \"waga\": \"0.28 kg\"   }', 3, 'Używane', 749.00, NULL, 1, 1, '2025-12-22 21:51:41'),
(33, 'Playstation 5 Slim', 18, 'Graj jak nigdy wcześniej®\r\n\r\nPlayStation®5 Digital Edition – 825 GB \r\n\r\nKonsola PS5® Digital Edition stwarza niewyobrażalne do tej pory możliwości rozgrywki.\r\n\r\nUltraszybki dysk SSD zapewnia błyskawiczne czasy wczytywania. Efekty dotykowe, adaptacyjne efekty „Trigger” i technologia dźwięku 3D wciągną Cię w realistycznie odwzorowany świat niesamowitych gier nowej generacji na PlayStation®. \r\n\r\nKonsola PS5 Digital Edition to w pełni cyfrowa wersja konsoli PS5 bez czytnika płyt. Zaloguj się na swoje konto dostępu do PlayStation Network i przejdź do PlayStation®Store, by kupować i pobierać gry.', 1, '{\"weight\":2.5,\"width\":25,\"height\":15,\"length\":45}', '{     \"producent\": \"Sony\",     \"model\": \"PlayStation 5 Slim\",     \"wersja\": \"Digital\",     \"pamiec\": \"1 TB SSD\",     \"rozdzielczosc\": \"4K\",     \"naped\": \"Brak\"   }', 3, 'Używane', 1950.00, NULL, 1, 1, '2025-12-25 18:45:18'),
(34, 'Telewizor SAMSUNG UE55U8092F 55\" LED 4K Tizen', 1, 'Procesor Samsung wspierany przez sztuczną inteligencję oferuje Ci doświadczenie ulepszonej jakości. Technologia Skalowania AI 4K, obsługiwana przez 20 sieci neuronowych, dzięki sztucznej inteligencji ulepsza treści do rozdzielczości zbliżonej do 4K. Procesor NQ4 AI Gen2 optymalizuje zarówno obraz, jak i dźwięk, aby zapewnić Ci wrażenia najwyższej jakości niezależnie od tego, czy oglądasz treści VOD, sport na żywo czy grasz w ulubione gry.\r\n\r\n', 1, '{\"weight\":15,\"width\":5,\"height\":50,\"length\":80}', '{     \"producent\": \"Samsung\",     \"przekatna\": \"55\\\"\",     \"rozdzielczosc\": \"4K UHD\",     \"technologia\": \"LED\",     \"system_smart\": \"Tizen\",     \"hdr\": \"HDR10+\"   }', 3, 'Nowe', 1200.00, NULL, 1, 1, '2025-12-27 00:12:49'),
(36, 'Robot kuchenny Thermomix TM7 Thermomix Vorwerk 7 2000W czarny', 1, 'Termomix 7 , nie potrzebuje rekomendacji. Po prostu , zamiast wielu urzadzen w kuchni , ten jeden jest tylko potrzebny. Można powiedzieć, garnek z internetem. Jednak ten garnek robi swiatową kuchnie. Chyba, ze ktos woli kurczaka w niedzielę albo mielonego z buraczkami. To jest po prostu rewelacyjne urzadzenie bez ktorego żadna kuchnia nie może sie obejść . Jedynie cena może troche niektorych zniechecac ale zamiast kupowac wiele różnych urzadzen, odżałować i kupic sobie Termomixa 7 na lata.', 1, '{\"weight\":10,\"width\":20,\"height\":50,\"length\":5}', '{     \"producent\": \"Vorwerk\",     \"model\": \"Thermomix TM7\",     \"moc\": \"2000 W\",     \"pojemnosc_misy\": \"2.2 l\",     \"funkcje\": [\"Gotowanie\", \"Blendowanie\", \"Ważenie\"],     \"wyswietlacz\": \"Dotykowy\"   }', 2, 'Nowe', 5399.00, NULL, 1, 1, '2025-12-27 00:22:51'),
(39, 'Samsung Galaxy Z Flip7', 16, 'Przedstawiamy nasz najsmuklejszy, najmocniejszy i najbardziej zaawansowany Galaxy Z Flip w historii — niezrównane połączenie piękna i wydajności, które doskonale dopasowuje się do Twojego stylu życia i mieści się w kieszeni. Rozszerzony ekran zewnętrzny robi wrażenie od krawędzi do krawędzi, a całość zamknięta jest w wytrzymałej obudowie, cieńszej zarówno po złożeniu, jak i po rozłożeniu.', 1, '{\"weight\":1,\"width\":17,\"height\":7.5,\"length\":3}', '{\"brand\": \"Samsung\",\"model\": \"Galaxy Flip 7\",\"imei\": \"32378915623678\",\"ram\": \"12 GB\",\"pamiec_wewnetrzna\": \"256 GB\",\"ekran\": \"6.2\\\" AMOLED\",\"bateria\": \"3800 mAh\"}', 2, 'Nowe', 2999.00, 2399.00, 1, 1, '2025-12-29 23:37:36'),
(40, 'KONSOLA MICROSOFT XBOX ONE', 18, 'Do zaoferowania posiadamy KONSOLA MICROSOFT XBOX ONE !!!\r\n\r\n100% sprawna, stan wizualny widoczny na zdjęciach.\r\n\r\n-Konsola\r\n\r\n-Okablowanie\r\n\r\nPoznaj konsolę Xbox One 500GB wydajny i wszechstronny system do grania,\r\n\r\noglądania filmów i korzystania z aplikacji multimedialnych.\r\n\r\nTo idealny wybór dla graczy, którzy szukają niezawodnego sprzętu w przystępnej cenie.\r\n\r\nPolecam!', 1, '{\"weight\":3.5,\"width\":30,\"height\":15,\"length\":50}', '{\"marka\":\"Microsoft\",\"model\":\"Xbox One\",\"dysk\":\"500GB\",\"kontroler\":\"tak\"}', 1, 'Używane', 389.00, NULL, 1, 1, '2025-12-31 17:27:17'),
(41, 'Słuchawki STEELSERIES Arctis Nova 1', 1, 'Słuchawki Steelseries Arctis Nova 1 Sprawiające że otaczający dzwięk staje się rzeczywistością', 1, '{\"weight\":1.5,\"width\":25,\"height\":20,\"length\":45}', '{\"marka\":\"Steelseries\",\"model\":\"Arctis\",\"typ\":\"Nauszne\",\"regulacja_głośności\":\"Tak\"}', 2, 'Nowe', 159.00, NULL, 1, 1, '2026-01-20 22:27:18');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `product_images`
--

CREATE TABLE `product_images` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `is_main` tinyint(1) NOT NULL DEFAULT 0,
  `alt_text` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `file_path`, `is_main`, `alt_text`) VALUES
(1, 1, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510809/img-1_zpsjx9.jpg', 1, 'Zdjęcie 1'),
(2, 1, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510808/img-2_qsnpej.webp', 0, 'Zdjęcie 2'),
(3, 1, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510809/img-3_v20vu3.webp', 0, 'Zdjęcie 3'),
(4, 1, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510808/img-4_bidyma.webp', 0, 'Zdjęcie 4'),
(6, 2, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510827/img-1_eza3xw.webp', 1, 'Zdjęcie 1'),
(7, 2, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510828/img-2_gwl77i.webp', 0, 'Zdjęcie 2'),
(8, 2, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510828/img-3_qkzk0a.webp', 0, 'Zdjęcie 3'),
(9, 2, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510829/img-4_riy6m8.webp', 0, 'Zdjęcie 4'),
(10, 3, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510830/img-1_ywtv4y.webp', 1, 'Zdjęcie 1'),
(11, 3, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510830/img-2_u2yrj9.webp', 0, 'Zdjęcie 2'),
(12, 3, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510831/img-3_pui9ci.webp', 0, 'Zdjęcie 3'),
(13, 3, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510831/img-4_iu0lni.webp', 0, 'Zdjęcie 4'),
(14, 4, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510832/img-1_zkzi5e.jpg', 1, 'Zdjęcie 1'),
(15, 4, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510832/img-2_gphaxu.jpg', 0, 'Zdjęcie 2'),
(16, 4, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510833/img-3_rskqos.jpg', 0, 'Zdjęcie 3'),
(17, 5, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510833/img-1_rgbc3l.webp', 1, 'Zdjęcie 1'),
(18, 5, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510835/img-2_w5qc4w.webp', 0, 'Zdjęcie 2'),
(19, 5, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510834/img-3_dljjru.webp', 0, 'Zdjęcie 3'),
(20, 6, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510834/img-1_hmv8av.jpg', 1, 'Zdjęcie 1'),
(21, 6, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510835/img-2_le0l9w.jpg', 0, 'Zdjęcie 2'),
(22, 6, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510836/img-3_n3enhi.jpg', 0, 'Zdjęcie 3'),
(23, 6, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510837/img-4_o8kiu6.jpg', 0, 'Zdjęcie 4'),
(24, 7, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510837/img-1_blqzq6.webp', 1, 'Zdjęcie 1'),
(25, 7, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510838/img-2_o3boc4.webp', 0, 'Zdjęcie 2'),
(26, 7, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510838/img-3_glpiwk.webp', 0, 'Zdjęcie 3'),
(27, 8, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510839/img-1_xxtla6.webp', 1, 'Zdjęcie 1'),
(28, 8, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510839/img-2_gmppu9.webp', 0, 'Zdjęcie 2'),
(29, 8, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510840/img-3_kpwpkn.webp', 0, 'Zdjęcie 3'),
(30, 9, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510841/img-1_ahrngc.webp', 1, 'Zdjęcie 1'),
(31, 9, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510841/img-2_s4d4ks.webp', 0, 'Zdjęcie 2'),
(32, 9, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510843/img-3_kikzah.webp', 0, 'Zdjęcie 3'),
(33, 11, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510844/img-1_g6fhoh.webp', 1, 'Zdjęcie 1'),
(34, 11, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510842/img-2_lgal3u.webp', 0, 'Zdjęcie 2'),
(35, 11, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510842/img-3_n5a6d0.webp', 0, 'Zdjęcie 3'),
(37, 13, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510845/img-1_hckti1.webp', 1, 'Zdjęcie 1'),
(38, 13, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510845/img-2_txdltn.webp', 0, 'Zdjęcie 2'),
(39, 14, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510847/img-1_ko6kmm.webp', 1, 'Zdjęcie 1'),
(40, 14, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510848/img-2_uke49n.webp', 0, 'Zdjęcie 2'),
(41, 15, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510846/img-1_xeug1w.jpg', 1, 'Zdjęcie 1'),
(42, 15, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510847/img-2_wugywh.jpg', 0, 'Zdjęcie 2'),
(43, 15, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510849/img-3_ixohnt.jpg', 0, 'Zdjęcie 3'),
(44, 15, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510851/img-4_xbq7gj.jpg', 0, 'Zdjęcie 4'),
(45, 16, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510849/img-1_irvm3h.webp', 1, 'Zdjęcie 1'),
(46, 16, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510850/img-2_gdzwsq.webp', 0, 'Zdjęcie 2'),
(47, 17, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510852/img-1_p7s4v3.jpg', 1, 'Zdjęcie 1'),
(48, 17, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510851/img-2_zzanie.jpg', 0, 'Zdjęcie 2'),
(49, 17, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510852/img-3_tov5ti.jpg', 0, 'Zdjęcie 3'),
(50, 18, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510853/img-1_nznaub.webp', 1, 'Zdjęcie 1'),
(51, 18, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510853/img-2_em7616.webp', 0, 'Zdjęcie 2'),
(52, 18, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510855/img-3_wohw2r.webp', 0, 'Zdjęcie 3'),
(53, 19, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510856/img-1_reyni3.webp', 1, 'Zdjęcie 1'),
(54, 19, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510854/img-2_fscdjk.webp', 0, 'Zdjęcie 2'),
(55, 19, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510857/img-3_c45usg.webp', 0, 'Zdjęcie 3'),
(56, 19, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510856/img-4_khzzgb.webp', 0, 'Zdjęcie 4'),
(57, 20, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510858/img-1_px4kge.webp', 1, 'Zdjęcie 1'),
(58, 20, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764510858/img-2_mpmkgm.webp', 0, 'Zdjęcie 2'),
(59, 21, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764862183/img-1_qoxnuc.webp', 1, 'Zdjęcie 1'),
(60, 21, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764862183/img-2_samaee.webp', 0, 'Zdjęcie 2'),
(61, 21, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764862184/img-3_reuzvg.webp', 0, 'Zdjęcie 3'),
(62, 21, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764862183/img-4_upfwkt.webp', 0, 'Zdjęcie 4'),
(63, 21, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764862183/img-5_y8el7k.webp', 0, 'Zdjęcie 5'),
(64, 21, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764862184/img-6_lc50xc.webp', 0, 'Zdjęcie 6'),
(65, 22, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764862184/img-1_yx9yck.jpg', 1, 'Zdjęcie 1'),
(66, 22, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764862185/img-2_hwgjw2.jpg', 0, 'Zdjęcie 2'),
(67, 22, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764862186/img-3_yeuteb.jpg', 0, 'Zdjęcie 3'),
(68, 22, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764862185/img-4_iaj485.jpg', 0, 'Zdjęcie 4'),
(69, 23, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764862514/img-1_e1xb4p.jpg', 1, 'Zdjęcie 1'),
(70, 23, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764862186/img-2_xhpgam.jpg', 0, 'Zdjęcie 2'),
(71, 23, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764862186/img-3_bnx81c.jpg', 0, 'Zdjęcie 3'),
(72, 23, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764862187/img-4_xtpszn.jpg', 0, 'Zdjęcie 4'),
(73, 24, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764862186/img-1_yciim2.webp', 1, 'Zdjęcie 1'),
(74, 24, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764862184/img-2_pzrntq.webp', 0, 'Zdjęcie 2'),
(75, 24, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764862183/img-3_apjtav.webp', 0, 'Zdjęcie 3'),
(76, 24, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764862184/img-4_xwz5x2.webp', 0, 'Zdjęcie 4'),
(77, 25, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764862184/img-1_qhf9g8.webp', 1, 'Zdjęcie 1'),
(78, 25, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764862184/img-2_kswhny.webp', 0, 'Zdjęcie 2'),
(79, 25, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764862185/img-3_e97uwl.webp', 0, 'Zdjęcie 3'),
(80, 25, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1764862185/img-4_e4vrma.webp', 0, 'Zdjęcie 4'),
(81, 31, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1766435869/products/31/ygck2yrsxjb3kd0vl70f.jpg', 1, 'Zdjęcie 1'),
(82, 31, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1766435869/products/31/fywdnmlr33tcf752glul.jpg', 0, 'Zdjęcie 2'),
(83, 31, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1766435869/products/31/xbol2vso8odvispdfzeh.jpg', 0, 'Zdjęcie 3'),
(84, 31, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1766435869/products/31/d8yea1x0qng3w0dfnheb.jpg', 0, 'Zdjęcie 4'),
(85, 32, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1766436701/products/32/iiehrns6dfuz4kxkh3kc.webp', 1, 'Zdjęcie 1'),
(86, 32, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1766436701/products/32/kvcbjixravtci06ap2oe.webp', 0, 'Zdjęcie 2'),
(87, 32, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1766436701/products/32/hmms4ej1ax6dwnvkt3q7.webp', 0, 'Zdjęcie 3'),
(88, 32, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1766436702/products/32/lvmqorr4nanpc1lwhsr7.webp', 0, 'Zdjęcie 4'),
(89, 33, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1766684722/products/33/ujaa8vtrt7juyukct45f.jpg', 1, 'Zdjęcie 1'),
(90, 33, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1766684721/products/33/m2ubawmjmrjjw8bgamyf.jpg', 0, 'Zdjęcie 2'),
(91, 33, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1766684721/products/33/lhg2exodbcxzhdcvajyr.jpg', 0, 'Zdjęcie 3'),
(92, 33, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1766684721/products/33/w9aqbjvnpvourqak4uuc.jpg', 0, 'Zdjęcie 4'),
(93, 1, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1766785191/products/1/n6okwjvuv61raz2pwky9.jpg', 0, 'Zdjęcie 5'),
(94, 34, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1766790774/products/34/lurb3sq2mnnzhjc4slpd.jpg', 1, 'Zdjęcie 1'),
(95, 34, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1766790773/products/34/irchrcv4cadfqh5ujdnz.jpg', 0, 'Zdjęcie 2'),
(96, 34, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1766790774/products/34/brnrkmnecv27e2og9a5d.jpg', 0, 'Zdjęcie 3'),
(97, 34, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1766790771/products/34/wqz1yz00fxpa7fda5ljn.jpg', 0, 'Zdjęcie 4'),
(98, 36, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1766791373/products/36/pvkanmfmnsgdfej0esrb.webp', 1, 'Zdjęcie Produktu'),
(99, 36, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1766791373/products/36/khxumear317747hx8txn.webp', 0, 'Zdjęcie Produktu'),
(100, 36, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1766791372/products/36/hwxoe1ceiksiuwlmvydy.webp', 0, 'Zdjęcie Produktu'),
(101, 36, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1766791593/products/36/ptcyozyzb7xllnzwt4tj.webp', 0, 'Zdjęcie Produktu'),
(102, 39, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1767048809/products/39/jrxpx5zb2vibz0i5ryyo.webp', 1, 'Zdjęcie Produktu'),
(103, 39, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1767048809/products/39/o4lurofbfttj2s0xv5gg.webp', 0, 'Zdjęcie Produktu'),
(104, 39, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1767048809/products/39/sgctwl0m3n0fpcnessqd.webp', 0, 'Zdjęcie Produktu'),
(105, 40, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1767198440/products/40/w0lvzsmeizqa6obsbg8w.webp', 1, 'Zdjęcie Produktu'),
(106, 40, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1767198440/products/40/yn3cthbnsiv0d8oke6cc.webp', 0, 'Zdjęcie Produktu'),
(107, 40, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1767198440/products/40/poamwugovmghcqhttpyh.webp', 0, 'Zdjęcie Produktu'),
(108, 41, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1768944441/products/41/jcciaohidsyxs37btvnp.jpg', 1, 'Zdjęcie Produktu'),
(109, 41, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1768944441/products/41/so3ajra5rfkpihhefazx.jpg', 0, 'Zdjęcie Produktu'),
(110, 41, 'https://res.cloudinary.com/dfdfndfix/image/upload/v1768944472/products/41/l7vgkugt4mqjcfgw6krb.jpg', 0, 'Zdjęcie Produktu');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('RoHDTFKajvGJBthTraMWFz8t2j7Fhyeg', 1769075995, '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2026-01-21T21:31:31.947Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"userId\":1,\"email\":\"jakubsobczyk2004@wp.pl\",\"role\":\"owner\",\"shop\":1,\"deliverySelections\":{}}');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `stores`
--

CREATE TABLE `stores` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` int(12) NOT NULL,
  `address` varchar(100) NOT NULL,
  `city` varchar(50) NOT NULL,
  `photo` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

--
-- Dumping data for table `stores`
--

INSERT INTO `stores` (`id`, `name`, `email`, `phone`, `address`, `city`, `photo`) VALUES
(1, 'Sklep Alfa', 'kontakt@alfa-sklep.pl', 214748364, 'ul. Marszałkowska 12', 'Warszawa', 'https://res.cloudinary.com/dfdfndfix/image/upload/v1766069273/Sklep_1_h2dp3r.jpg'),
(2, 'Sklep Omega', 'kontakt@omega-sklep.pl', 214748647, 'ul. Piotrkowska 88', 'Łódź', 'https://res.cloudinary.com/dfdfndfix/image/upload/v1766069273/Sklep_2_gmb3li.jpg'),
(3, 'Sklep Beta', 'kontakt@beta-sklep.pl', 147483647, 'ul. Długa 5', 'Kraków', 'https://res.cloudinary.com/dfdfndfix/image/upload/v1766069273/Sklep_3jpg_v83llz.jpg');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `users`
--

CREATE TABLE `users` (
  `id` int(30) NOT NULL,
  `name` varchar(50) NOT NULL,
  `surname` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password_hash` varchar(80) NOT NULL,
  `role` enum('user','admin','owner') NOT NULL DEFAULT 'user',
  `assigned_shop` int(5) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `phone` int(12) NOT NULL,
  `county` varchar(100) NOT NULL,
  `postcode` varchar(6) NOT NULL,
  `city` varchar(50) NOT NULL,
  `adress` varchar(100) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `surname`, `email`, `password_hash`, `role`, `assigned_shop`, `is_active`, `phone`, `county`, `postcode`, `city`, `adress`, `created_at`) VALUES
(1, 'Jakub Julian', 'Sobczyk', 'jakubsobczyk2004@wp.pl', '$2b$12$QjKmMt.ti5eCOWDBqnS5UeFU9lwtS7IhZSRh1dFYd4w4PLlawvAyW', 'owner', 1, 1, 672134094, 'warmińsko-mazurskie', '10-310', 'Olsztyn', 'Marii Zientary-Malewskiej 55b/13', '2025-12-17 20:10:24'),
(2, 'Norbert', 'Gierczak', 'wdadawda@gmail.com', '$2b$12$XTEQm5fBk.I7C2wzzBlVD.L64MppDWGg0wxCvIKo3gyG/Dmmkdu0i', 'user', NULL, 0, 345435353, 'wielkopolskie', '80-210', 'Lelkowo', 'Malinowa 69', '2025-12-18 20:10:24'),
(3, 'Jan', 'Kowalski', 'jakub@gmail.com', '$2b$12$cm7DiKv86/dIslMbyt00ouRx8tewTzWnV.70zPSW5603KqPzyXw0i', 'user', NULL, 1, 123543211, 'świętokrzyskie', '13333', 'Jonkowo', 'Szara 110', '2025-12-19 20:10:24'),
(8, 'Mateusz', 'Kowal', 'j.sobczyk.419@studms.ug.edu.pl', '$2b$12$TM6p3T3fmemXmf3mqGRR4ecS.dpr3olouVkVU7Q1IJlwWyoWYpYwu', 'admin', 2, 1, 345435353, 'podlaskie', '10-900', 'Olsztyn', 'Marii Zientary-Malewskiej 55b/13', '2025-12-19 20:10:24'),
(9, 'DELETE', '*', 'wdadawdawda@gmail.com', '$2b$12$T5cSdnu2v5PCuF1u27NTWeiaJolp5QBKnP4WCZR8LoqIAaPWry8f6', 'user', NULL, 1, 2147483647, 'lubuskie', '10-800', 'Suwałki', 'Truskawkowa 120', '2025-12-29 13:39:27');

--
-- Indeksy dla zrzutów tabel
--

--
-- Indeksy dla tabeli `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeksy dla tabeli `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `cart_items_ibfk_1` (`cart_id`);

--
-- Indeksy dla tabeli `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `parent_id` (`parent_id`);

--
-- Indeksy dla tabeli `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `chat_room_id` (`chat_room_id`);

--
-- Indeksy dla tabeli `chat_rooms`
--
ALTER TABLE `chat_rooms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_context` (`context_type`,`context_id`);

--
-- Indeksy dla tabeli `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`user_id`,`product_id`),
  ADD KEY `idx_favorites_user` (`user_id`),
  ADD KEY `idx_favorites_product` (`product_id`);

--
-- Indeksy dla tabeli `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeksy dla tabeli `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `order_items_ibfk_1` (`order_id`);

--
-- Indeksy dla tabeli `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `fk_products_stores` (`store_id`);

--
-- Indeksy dla tabeli `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_images_ibfk_1` (`product_id`);

--
-- Indeksy dla tabeli `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indeksy dla tabeli `stores`
--
ALTER TABLE `stores`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `chat_rooms`
--
ALTER TABLE `chat_rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=111;

--
-- AUTO_INCREMENT for table `stores`
--
ALTER TABLE `stores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(30) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`chat_room_id`) REFERENCES `chat_rooms` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_stores` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
