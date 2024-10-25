export function doNothing(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
