declare module "event-source-polyfill" {
  export class EventSourcePolyfill {
    constructor(
      url: string,
      options?: {
        headers?: Record<string, string>;
        withCredentials?: boolean;
        heartbeatTimeout?: number;
      },
    );
    onmessage: ((evt: MessageEvent) => any) | null;
    close(): void;
  }
}

