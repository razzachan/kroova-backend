export function unwrap<T = any>(res: { data: any }): T {
  const d = res?.data;
  if (d && typeof d === 'object' && 'data' in d) {
    return (d as any).data as T;
  }
  return d as T;
}
