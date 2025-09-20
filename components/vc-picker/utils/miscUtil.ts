import type { PresetDate, RangeValue } from '../interface';

export function leftPad(str: string | number, length: number, fill = '0') {
  let current = String(str);
  while (current.length < length) {
    current = `${fill}${str}`;
  }
  return current;
}

export const tuple = <T extends string[]>(...args: T) => args;

export function toArray<T>(val: T | T[]): T[] {
  if (val === null || val === undefined) {
    return [];
  }

  return Array.isArray(val) ? val : [val];
}

export default function getDataOrAriaProps(props: any) {
  const retProps: any = {};

  Object.keys(props).forEach(key => {
    if (
      (key.startsWith('data-') || key.startsWith('aria-') || key === 'role' || key === 'name') &&
      !key.startsWith('data-__')
    ) {
      retProps[key] = props[key];
    }
  });

  return retProps;
}

export function getValue<T>(
  values: RangeValue<T>,
  index: number,
): T | PresetDate<RangeValue<T>> | null {
  return values ? values[index] : null;
}

type UpdateValue<T> = (prev: T) => T;

export function updateValues<T, R extends RangeValue<T> | null>(
  values: R,
  value: T | UpdateValue<T>,
  index: number,
): R {
  const newValues = [getValue(values, 0), getValue(values, 1), getValue(values, 2)];

  newValues[index] =
    typeof value === 'function' ? (value as UpdateValue<T | null>)(newValues[index] as T) : value;

  if (!newValues[0] && !newValues[1]) {
    return null as unknown as R;
  }

  return newValues as unknown as R;
}
