export function serializeMap<T,K>(map: Map<T,K>): string {
    return JSON.stringify([...map]);
  }
  
export function deserializeMap<T,K>(serializedMap: string): Map<T,K> {
    return new Map(JSON.parse(serializedMap));
  }
