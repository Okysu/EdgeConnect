export function describeTime(date: Date): string {
  const now = new Date();
  const diff = Math.round((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) {
    return `${diff}秒前`;
  } else if (diff < 60 * 60) {
    return `${Math.floor(diff / 60)}分钟前`;
  } else if (diff < 60 * 60 * 24) {
    return `${Math.floor(diff / 60 / 60)}小时前`;
  } else if (diff < 60 * 60 * 24 * 3) {
    const yesterday = new Date(now.getTime() - 864e5);
    if (date.getDay() === yesterday.getDay()) {
      return "昨天";
    } else {
      return `${Math.floor(diff / 60 / 60 / 24)}天前`;
    }
  } else {
    return date.toLocaleString();
  }
}

export const copyText = (str: string): Promise<void> => {
  return navigator.clipboard.writeText(str);
};
