import { uid as serverUid } from "@/lib/server/db/id";

export function read<T>(_key: string, fallback: T): T {
  return fallback;
}

export function write<T>(_key: string, _value: T): void {}

export function remove(_key: string): void {}

export function clearAll(): void {}

export function uid(prefix = ""): string {
  return serverUid(prefix);
}
