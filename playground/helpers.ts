export function getEnumName(enumObj: any, value?: number, defaultName = "") {
  return (
    (typeof enumObj === "function" &&
      value &&
      Object.keys(enumObj).find((key) => enumObj[key] === value)) ||
    defaultName
  );
}

export function makeEnumFromName(enumObj: any, name: string) {
  console.log("makeEnumFromName", name, enumObj, typeof enumObj);
  return typeof enumObj === "function" && enumObj.hasOwnProperty(name)
    ? enumObj[name]
    : undefined;
}

export function getEnumNames(enumObj: any) {
  return typeof enumObj === "function"
    ? Object.keys(enumObj).filter((x) => x != "values")
    : [];
}
