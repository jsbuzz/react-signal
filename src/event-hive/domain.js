export const Optional = (value) => { return { $isOptional: true, value } };
Optional.from = obj => obj.$isOptional ? [ true, obj.value ] : [ false, obj ];

export class Mixed {}
