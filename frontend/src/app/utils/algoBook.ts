import { Book } from '../models/Book';

interface StoredBookEntry {
  id: number;
  titulo?: string;
  genero?: string;
  state?: string;
}

function loadUserSavedBooks(userId: number): StoredBookEntry[] {
  try {
    const raw = localStorage.getItem(`profileBooks:${userId}`);
    if (!raw) return [];
    return JSON.parse(raw) as StoredBookEntry[];
  } catch {
    return [];
  }
}

function buildGenreScores(userBooks: StoredBookEntry[]): Map<string, number> {
  const scores = new Map<string, number>();
  for (const book of userBooks) {
    if (!book.genero) continue;
    const g = book.genero.toLowerCase().trim();
    scores.set(g, (scores.get(g) ?? 0) + 1);
  }
  return scores;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}


export function getRecommendedBooks(
  allBooks: Book[],
  userId: number | null,
  count = 5
): Book[] {
  if (!userId || allBooks.length === 0) {
    return shuffle(allBooks).slice(0, count);
  }

  const userBooks = loadUserSavedBooks(userId);
  if (userBooks.length === 0) {
    return shuffle(allBooks).slice(0, count);
  }

  const savedIds = new Set(userBooks.map((b) => b.id));
  const genreScores = buildGenreScores(userBooks);
  const unsaved = allBooks.filter((b) => !savedIds.has(b.id));

  const withGenre: Book[] = [];
  const withoutGenre: Book[] = [];

  for (const book of unsaved) {
    const g = (book.genero ?? '').toLowerCase().trim();
    if (g && genreScores.has(g)) {
      withGenre.push(book);
    } else {
      withoutGenre.push(book);
    }
  }

  withGenre.sort((a, b) => {
    const sa = genreScores.get((a.genero ?? '').toLowerCase().trim()) ?? 0;
    const sb = genreScores.get((b.genero ?? '').toLowerCase().trim()) ?? 0;
    return sb - sa;
  });

  const result = withGenre.slice(0, count);

  if (result.length < count) {
    result.push(...shuffle(withoutGenre).slice(0, count - result.length));
  }

  return result;
}
