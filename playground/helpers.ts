export function getEnumName(
  enumObj: any,
  value?: { value: number },
  defaultName = ""
) {
  return (
    ((typeof enumObj === "function" || typeof enumObj === "object") &&
      value &&
      Object.keys(enumObj).find((key) => enumObj[key] === value)) ||
    defaultName
  );
}

export function makeEnumFromName(enumObj: any, name: string) {
  return (typeof enumObj === "function" || typeof enumObj === "object") &&
    enumObj.hasOwnProperty(name)
    ? enumObj[name]
    : undefined;
}

export function getEnumNames(enumObj: any) {
  return typeof enumObj === "function" || typeof enumObj === "object"
    ? Object.keys(enumObj).filter((x) => x != "values" && x != "mh" && x != "Gh")
    : [];
}
