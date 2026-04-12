# TrenUI — Aplikacja do śledzenia treningów

**TrenUI** to webowa aplikacja do zarządzania treningami siłowymi, umożliwiająca tworzenie własnych planów treningowych, śledzenie postępów na żywo oraz przeglądanie historii i statystyk sesji. Aplikacja powstała jako projekt inżynierski i rozwiązuje problem braku prostego, szybkiego narzędzia do rejestrowania treningów bezpośrednio z przeglądarki — bez instalacji aplikacji mobilnej.

---

## Spis treści

1. [Technologie](#technologie)
2. [Wymagania systemowe](#wymagania-systemowe)
3. [Instalacja i uruchomienie](#instalacja-i-uruchomienie)
4. [Zmienne środowiskowe](#zmienne-środowiskowe)
5. [Architektura i struktura katalogów](#architektura-i-struktura-katalogów)
6. [Funkcjonalności](#funkcjonalności)
7. [Baza danych](#baza-danych)
8. [Testy](#testy)
9. [Autor](#autor)

---

## Technologie

Aplikacja została zbudowana z użyciem **Next.js 16** (App Router, React Server Components), **React 19**, **Drizzle ORM** oraz **PostgreSQL** hostowanego w serwisie Neon. Uwierzytelnianie realizuje **Neon Auth**. Interfejs oparty jest na bibliotece komponentów **shadcn/ui** (styl New York) z **Radix UI** i **Tailwind CSS 4**. Stan po stronie klienta zarządzany jest przez **Zustand** z persistencją w `localStorage`. Przeciąganie i upuszczanie ćwiczeń obsługuje **@dnd-kit**. Wykresy w statystykach renderuje **Recharts**.

| Warstwa | Technologia |
|---------|-------------|
| Framework | Next.js 16.1.6 (App Router) |
| Biblioteka UI | React 19 |
| Baza danych | PostgreSQL (Neon serverless) |
| ORM | Drizzle ORM 0.45.2 |
| Uwierzytelnianie | Neon Auth (Better Auth) |
| Stan klienta | Zustand 5 |
| Style | Tailwind CSS 4, shadcn/ui, Radix UI |
| Wykresy | Recharts 3 |
| Testowanie | Jest 30, React Testing Library 16 |
| Język | TypeScript 5 |

---

## Wymagania systemowe

- **Node.js** w wersji ≥ 20
- **npm** w wersji ≥ 10 (dostarczany wraz z Node.js 20)
- Konto w serwisie [Neon](https://neon.tech) — wymagane do uruchomienia bazy danych i uwierzytelniania
- System operacyjny: macOS, Linux lub Windows (z WSL2)

---

## Instalacja i uruchomienie

### 1. Klonowanie repozytorium

```bash
git clone https://github.com/mRud3r/tren-ui.git
cd tren-ui
```

### 2. Instalacja zależności

```bash
npm install
```

### 3. Konfiguracja zmiennych środowiskowych

Utwórz plik `.env.local` w głównym katalogu projektu i uzupełnij go własnymi kluczami (szczegóły w sekcji [Zmienne środowiskowe](#zmienne-środowiskowe)):

```bash
cp .env.example .env.local
# następnie otwórz .env.local i uzupełnij wartości
```

### 4. Przygotowanie bazy danych

Uruchom migracje, aby utworzyć wszystkie tabele:

```bash
npm run db:migrate
```

Załaduj dane początkowe:

```bash
npm run db:seed
```

### 5. Uruchomienie serwera deweloperskiego

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem [http://localhost:3000](http://localhost:3000).

> **Wersja produkcyjna** jest dostępna pod adresem: [https://tren-ui.vercel.app](https://tren-ui.vercel.app)

> **Konto demo** — możesz zalogować się na gotowe konto z przykładowymi danymi:
> - E-mail: `example@test.com`
> - Hasło: `Testowy!23`

### 6. Budowanie wersji produkcyjnej

```bash
npm run build
npm run start
```

---

## Zmienne środowiskowe

Utwórz plik `.env.local` w głównym katalogu projektu. Wszystkie wymagane wartości znajdziesz w panelu projektu na [neon.tech](https://neon.tech) po założeniu konta i projektu.

```env
# Połączenie z bazą danych PostgreSQL (Neon) — pooled connection string
DATABASE_URL=...

# Bazowy URL instancji Neon Auth (Neon Console → Auth → Configuration)
NEON_AUTH_BASE_URL=...

# Klucz do szyfrowania ciasteczek sesji (min. 32 znaki)
# Wygeneruj: openssl rand -base64 32
NEON_AUTH_COOKIE_SECRET=...
```

> **Uwaga:** Plik `.env.local` jest automatycznie wykluczony przez `.gitignore` i nie powinien być commitowany do repozytorium.

---

## Architektura i struktura katalogów

Aplikacja jest monolitem opartym na Next.js z podejściem **full-stack w jednym repozytorium**. Logika serwera (pobieranie danych, mutacje) realizowana jest przez React Server Components oraz Next.js Server Actions — bez osobnego backendu REST. Baza danych jest dostępna bezpośrednio z warstwy serwerowej za pomocą Drizzle ORM.

### Struktura katalogów

```
tren-ui/
├── app/                        # Trasy Next.js (App Router)
│   ├── auth/                   # Strony logowania i rejestracji
│   ├── dashboard/              # Chronione strony aplikacji
│   │   ├── exercises/          # Biblioteka ćwiczeń + szczegóły
│   │   ├── plans/              # Plany treningowe (lista, dodawanie, edycja)
│   │   └── workouts/           # Lista, kreator i edycja treningów
│   ├── workout-session/        # Aktywna sesja + podsumowanie
│   └── api/auth/               # Endpointy Neon Auth (GET, POST)
│
├── components/                 # Komponenty React
│   ├── ui/                     # Prymitywy shadcn/ui (button, input, card…)
│   ├── workouts/builder/       # Kreator nowego treningu
│   ├── exercises/              # Przeglądanie i wyszukiwanie ćwiczeń
│   ├── plans/                  # Plany tygodniowe
│   ├── workout-session/        # Śledzenie sesji na żywo
│   ├── dashboard/              # Widżety pulpitu (statystyki)
│   └── layout/                 # Nawigacja boczna, nagłówek, motyw
│
├── data/                       # Warstwa danych (Server Actions + fetchery)
│   ├── workouts.actions.ts     # Tworzenie, edycja, usuwanie treningów
│   ├── session.actions.ts      # Zapis ukończonej sesji
│   ├── plans.actions.ts        # Zarządzanie planami
│   ├── exercises.server.ts     # Pobieranie ćwiczeń po stronie serwera
│   ├── workouts.server.ts      # Pobieranie treningów po stronie serwera
│   └── dashboard.server.ts     # Obliczanie statystyk pulpitu
│
├── db/                         # Konfiguracja bazy danych
│   ├── schema.ts               # Definicja tabel (Drizzle ORM)
│   ├── index.ts                # Instancja połączenia z bazą
│   └── seed.ts                 # Skrypt seedujący ćwiczenia
│
├── drizzle/                    # Migracje SQL (generowane automatycznie)
├── stores/                     # Zustand — stan po stronie klienta
│   ├── create-workout.store.ts # Stan formularza tworzenia i edycji treningu
│   └── workout-session.store.ts# Stan aktywnej sesji (+ localStorage)
│
├── hooks/                      # Własne hooki React
├── lib/auth/                   # Konfiguracja Neon Auth (serwer + klient)
├── types/                      # Definicje TypeScript
└── tests/                      # Testy jednostkowe (Jest)
```

### Przepływ danych

```
Przeglądarka
    │
    ▼
Next.js App Router
    ├── Server Component ──────► Drizzle ORM ──► Neon PostgreSQL
    │   (render SSR, pobieranie danych)
    │
    └── Client Component
            │
            ├── Server Action ──► Drizzle ORM ──► Neon PostgreSQL
            │   (mutacje: zapis, usunięcie)
            │
            └── Zustand Store
                (stan lokalny, persistowany w localStorage)
```

### Ochrona tras

Ochrona tras realizowana jest bezpośrednio w Server Components i Server Actions przez funkcję `getCurrentUserId()`, która wywołuje `auth.getSession()` i rzuca wyjątek `'Unauthorized'` gdy sesja nie istnieje.

---

## Funkcjonalności

### Uwierzytelnianie
- Rejestracja i logowanie przy użyciu adresu e-mail i hasła
- Sesja przechowywana w ciasteczku HTTP-only zarządzanym przez Neon Auth
- Automatyczne odświeżanie sesji przy każdym żądaniu (middleware)

### Biblioteka ćwiczeń
- Predefiniowana biblioteka ćwiczeń z kategoryzacją (załadowana przez `npm run db:seed`)
- Wyszukiwanie po nazwie ćwiczenia
- Filtrowanie według grupy mięśniowej (klatka, plecy, nogi itd.)
- Filtrowanie według typu ćwiczenia (siłowe, kardio, core, plyometryczne, elastyczność)
- Widok szczegółów z opisem, typem śledzenia i grupami mięśniowymi
- Statystyki postępów dla każdego ćwiczenia (wykresy historii sesji, wskaźnik intensywności RPE)

### Zarządzanie treningami
- Tworzenie własnych treningów z dowolnego zestawu ćwiczeń z biblioteki
- Edycja treningu: zmiana nazwy, dodawanie/usuwanie ćwiczeń, zmiana kolejności metodą przeciągnij-i-upuść
- Usuwanie treningu (kaskadowe usunięcie powiązanych sesji)
- Lista treningów z nieskończonym przewijaniem

### Plany treningowe
- Tworzenie tygodniowych harmonogramów (7 dni, od poniedziałku do niedzieli)
- Przypisywanie konkretnego treningu do każdego dnia tygodnia
- Edycja istniejących planów (zmiana nazwy i przypisań dni)
- Ustawianie jednego planu jako aktywnego
- Aktywacja i dezaktywacja planów

### Aktywna sesja treningowa
- Rozpoczęcie sesji z poziomu zapisanego treningu jednym kliknięciem
- Rejestrowanie serii dla każdego ćwiczenia:
  - liczba powtórzeń
  - ciężar (kg)
  - czas trwania w sekundach — dla ćwiczeń kardio
  - intensywność RPE (skala 1–10)
- Dodawanie notatek do ćwiczenia
- Zapis stanu sesji w `localStorage` — możliwy powrót po zamknięciu karty
- Alert informujący o niedokończonej sesji przy wejściu na inną stronę

### Pulpit i statystyki
- Całkowita liczba ukończonych sesji treningowych
- Liczba sesji w bieżącym tygodniu i miesiącu
- Wyświetlanie dzisiejszego treningu z aktywnego planu
- Szybkie przejście do sesji jednym kliknięciem

---

## Baza danych

Schemat bazy danych zarządzany jest przez Drizzle ORM. Migracje SQL przechowywane są w katalogu `drizzle/` i generowane automatycznie na podstawie zmian w pliku `db/schema.ts`.

### Schemat tabel

| Tabela | Opis |
|--------|------|
| `exercises` | Biblioteka ćwiczeń (nazwa, typ, grupy mięśniowe, sposób śledzenia) |
| `muscle_groups` | Słownik grup mięśniowych |
| `workouts` | Treningi tworzone przez użytkownika |
| `workout_exercises` | Powiązanie trening ↔ ćwiczenie (z kolejnością) |
| `workout_session` | Zapis ukończonej sesji treningowej |
| `exercise_session` | Ćwiczenia wykonane w ramach sesji |
| `exercise_set` | Pojedyncze serie (powtórzenia, ciężar, czas, intensywność) |
| `workout_plans` | Tygodniowe plany treningowe |
| `workout_plan_days` | Przypisanie treningu do dnia tygodnia (0 = pon., 6 = ndz.) |

### Typy wyliczeniowe (enums)

- `exercise_tracking_type`: `reps` | `duration`
- `exercise_weight_type`: `weighted` | `bodyweight`
- `exercise_type`: `strength` | `cardio` | `flexibility` | `core` | `plyometric`

### Polecenia zarządzania bazą

```bash
npm run db:generate   # Generowanie nowej migracji po zmianie schema.ts
npm run db:migrate    # Aplikowanie migracji do bazy danych
npm run db:push       # Szybkie naniesienie zmian (bez migracji, tylko dev)
npm run db:studio     # Graficzny interfejs Drizzle Studio w przeglądarce
npm run db:seed       # Załadowanie danych początkowych (grupy mięśniowe + ćwiczenia)
```

---

## Testy

Projekt zawiera testy jednostkowe komponentów React oparte na **Jest 30** i **React Testing Library 16**.

### Uruchamianie testów

```bash
# Wszystkie testy
npm run test

# Pojedynczy plik testowy
npx jest tests/workout-card.test.tsx

# Tryb watch (automatyczne uruchamianie po zmianach)
npx jest --watch
```

### Pokrycie testami

| Plik testowy | Testowany komponent | Zakres |
|---|---|---|
| `add-workout-name-input.test.tsx` | `AddWorkoutNameInput` | Synchronizacja ze Zustand, walidacja |
| `add-workout-save-button.test.tsx` | `AddWorkoutSaveButton` | Stany disabled, zapis, obsługa błędów |
| `add-workout-selected-exercises.test.tsx` | `AddWorkoutSelectedExercises` | Lista ćwiczeń, drag-and-drop |
| `workout-card.test.tsx` | `WorkoutCard` | Renderowanie danych treningu |
| `workout-card-actions.test.tsx` | `WorkoutCardActions` | Usuwanie z potwierdzeniem, obsługa błędów |
| `exercise-card.test.tsx` | `ExerciseCard` | Wyświetlanie danych ćwiczenia |
| `exercise-search.test.tsx` | `ExerciseSearch` | Wyszukiwanie, filtrowanie |
| `exercise-stats.test.tsx` | `ExerciseStats` | Wykresy, wskaźniki intensywności RPE |
| `start-workout-button.test.tsx` | `StartWorkoutButton` | Nawigacja do sesji |
| `finish-workout-button.test.tsx` | `FinishWorkoutButton` | Zapis sesji, czyszczenie store |
| `plan-card-actions.test.tsx` | `PlanCardActions` | Usuwanie planu, powiadomienia toast |
| `set-active-plan-button.test.tsx` | `SetActivePlanButton` | Aktywacja i dezaktywacja planu |

Środowisko testowe to **jsdom**. Konfiguracja znajduje się w `jest.config.ts` i `jest.setup.ts`. Moduły zewnętrzne (`next/navigation`, `sonner`, `next-themes`) są mockowane per plik testowy.

---

## Autor

| | |
|---|---|
| **Imię i nazwisko** | Mikołaj Rudkowski |
| **Uczelnia** | Warszawska Wyższa Szkoła Informatyki |
| **Kierunek** | Informatyka |

---

*Projekt zrealizowany jako praca inżynierska.*
