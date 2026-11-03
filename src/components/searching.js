import { rules, createComparison } from "../lib/compare.js";

export function initSearching(searchField) {
  // @todo: #5.1 — настроить компаратор
  const searchRules = {
    searchMultipleFields: (value) =>
      rules.searchMultipleFields(value, ["date", "customer", "seller"], false),
  };

  return (data, state, action) => {
    // @todo: #5.2 — применить компаратор
    const query = state[searchField];
    if (!query) {
      return data;
    }
    const comparator = createComparison(searchRules, state);

    // Используем метод filter: оставляем только те строки, где comparator вернул true
    return data.filter((item) => comparator(item));
  };
}
