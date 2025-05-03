function parseValue(value: any) {
    if (typeof value !== 'string' || !value.trim()) {
      return null;
    }
    const trimmed = value.trim().toLowerCase();
  
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;
  
    const numberValue = Number(value);
    if (!isNaN(numberValue)) return numberValue;
  
    return value.trim();
  }
  
  export function parseStringToJson(script: string): any {
    // function to convert data sent from Mikrotik into JSON format
    // params:
    //      script : id=*1;advertising=10M-baseT-half;10M-baseT-full;
    //
    const pairs = script.split(';');
  
    const obj: Record<string, any> = {};
    pairs.forEach(pair => {
      const [key, value] = pair.split('=');
      if (key) {
        obj[key.trim()] = parseValue(value)
      }
    });
    return obj
  }
  
  export function parseArrayToJson(script: string[]): any[] {
    // function to convert data sent from Mikrotik into JSON format
    // params:
    //      script : id=*1;advertising=10M-baseT-half;10M-baseT-full;
    //
    return script.map(entry => parseStringToJson(entry));
  }
  
  export function jsonFilter(json: {}, keysToKeep: string[]) {
    // function to filter data from a JSON object
    // params:
    //      json : the JSON object to be filtered
    //             e.g. {id:1, name:a}
    //      keysToKeep : a list of keys to retain in the resulting JSON
    return Object.fromEntries(
      Object.entries(json).filter(([key]) => keysToKeep.includes(key))
    );
  }
  
  export function filterJsonList(jsonList: any, keysToKeep: any) {
    // function to filter a list of JSON objects
    // params:
    //      jsonList : the list of JSON objects to be filtered
    //                 e.g. [{id:1, name:a}, {id:2, name:b}, {id:3, name:c}]
    //      keysToKeep : a list of keys to retain in the resulting JSON
    return jsonList.map((json: any) => jsonFilter(json, keysToKeep));
  }
  
  export function parserRate(rate: string) {
    const regex = new RegExp(`Gbps`, "i");
    if (regex.test(rate)) {
      return parseFloat(rate) * 1000;
    }
    return parseInt(rate);
  }
  