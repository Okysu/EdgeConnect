export function debounce(fn: Function, delay: number) {
  let timerId: NodeJS.Timeout;
  return function (...args: any[]) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

// deep clone
export function deepClone(obj: any) {
  if (obj === null) return null;
  if (typeof obj !== "object") return obj;
  if (obj.constructor === Date) return new Date(obj);
  if (obj.constructor === RegExp) return new RegExp(obj);
  const newObj = new obj.constructor();
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const val = obj[key];
      newObj[key] = typeof val === "object" ? deepClone(val) : val;
    }
  }
  return newObj;
}