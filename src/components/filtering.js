import { createComparison, defaultRules } from "../lib/compare.js";

// Кастомные правила для специфичных полей формы
const customRules = [
    // 1. Игнорируем поля, которых нет в данных строки (totalFrom, totalTo, page, rowsPerPage)
    (key, sourceValue, targetValue, source) => {
        if (!Object.prototype.hasOwnProperty.call(source, key)) {
            return { skip: true };
        }
        return { continue: true };
    },
    // 2. Игнорируем пустые значения фильтров
    (key, sourceValue, targetValue) => {
        if (targetValue === '' || targetValue === undefined || targetValue === null) {
            return { skip: true };
        }
        return { continue: true };
    },
    // 3. Обработка диапазона total (связывает totalFrom/totalTo с полем total)
    (key, sourceValue, targetValue, source) => {
        if (key === 'totalFrom') {
            const total = Number(source.total);
            const bound = Number(targetValue);
            if (isNaN(total) || isNaN(bound)) return { continue: true };
            return total >= bound ? { continue: true } : { result: false };
        }
        if (key === 'totalTo') {
            const total = Number(source.total);
            const bound = Number(targetValue);
            if (isNaN(total) || isNaN(bound)) return { continue: true };
            return total <= bound ? { continue: true } : { result: false };
        }
        return { continue: true };
    },
    // 4. Обработка глобального поиска (поле search)
    (key, sourceValue, targetValue, source) => {
        if (key === 'search') {
            const term = String(targetValue).toLowerCase();
            const fields = ['date', 'customer', 'seller', 'total'];
            const found = fields.some(field => 
                source[field] && String(source[field]).toLowerCase().includes(term)
            );
            return found ? { result: true } : { result: false };
        }
        return { continue: true };
    }
];

// Собираем все правила: сначала кастомные, затем стандартные (для текстовых полей)
const allRules = [...customRules, ...defaultRules];

// Создаем функцию сравнения с полным списком правил
const compare = createComparison([], allRules);

export function initFiltering(elements, indexes) {
  // Заполнение селектов (как у тебя было)
  Object.keys(indexes).forEach((elementName) => {
    if (!elements[elementName]) return; // Защита
    elements[elementName].append(
      ...Object.values(indexes[elementName])
        .map((name) => {
          const option = document.createElement("option");
          option.value = name;
          option.textContent = name;
          return option;
        }),
    );
  });

  return (data, state, action) => {
    // Обработка кнопок очистки (clear)
    if (action && action.name === "clear") {
      const parent = action.parentElement;
      if (parent) {
        const inputFind = parent.querySelector("input");
        if (inputFind) {
          inputFind.value = "";
          const fieldName = action.dataset.field;
          if (fieldName) {
            state[fieldName] = "";
          }
        }
      }
    }

    // Фильтрация
    return data.filter((row) => compare(row, state));
  };
}