export function toLowerObject(params: any = {}): any {
    const result = <{ [key: string]: string }>{};
    for (let key in params) {
        result[key.toLowerCase()] = params[key];
    }
    return result;
}

export function getBindNames(sql: string, toLower: boolean = true): string[] {
    return <string[]>(sql.match(/(?<=:)[a-zA-z0-9_$]+/g) || []);
}

export function getBindParams(names: string[], params: any = {}): any {
    const lowers = toLowerObject(params);
    const result = <{ [key: string]: any }>{};
    for (let name of names) {
        result[name] = lowers[name.toLowerCase()];
    }
    return result;
}

export function hasArrayParams(names: string[], params: any = {}): boolean {
    for (let key in params) {
        if (Array.isArray(params[key])) {
            return true;
        }
    }
    return false;
}

export function getArrayParams(params: any = {}): any {
    const result = <{ [key: string]: any }>{};
    for (let key in params) {
        const value = params[key];
        if (Array.isArray(value)) {
            value.forEach((item, i) => result[`${key}_${i}`] = item);
        } else {
            result[key] = value;
        }
    }
    return result;
}

export function getArraySQL(sql: string, params: any): string {
    return sql.replace(/:[a-zA-z0-9_$]+/g, (item) => {
        const value = params[item.substring(1).toLowerCase()];
        if (Array.isArray(value)) {
            return value.map((_v, i) => `${item}_${i}`).join(',');
        } else {
            return item;
        }
    });
}

export function getBindCommand(sql: string, params: any = {}): { sql: string, bindParams: any } {
    const bindNames = getBindNames(sql);
    const bindParams = getBindParams(bindNames, params);
    return { sql: sql, bindParams: bindParams };
}

export function getArrayCommand(sql: string, params: any = {}): { sql: string, bindParams: any } {
    const bindNames = getBindNames(sql);
    const bindParams = getBindParams(bindNames, params);
    if (bindNames.length > 0 && hasArrayParams(bindNames, bindParams)) {
        const arrSQL = getArraySQL(sql, toLowerObject(bindParams));
        const arrParams = getArrayParams(bindParams);
        return { sql: arrSQL, bindParams: arrParams };
    }
    return { sql: sql, bindParams: bindParams };
}

export default {
    getBindNames,
    getBindParams,
    getBindCommand,
    hasArrayParams,
    getArrayParams,
    getArrayCommand
}