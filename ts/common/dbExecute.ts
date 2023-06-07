import OracleDB, { Connection, ExecuteOptions } from "oracledb";
import dbParam from "./dbParam";
import dbPool from "./dbPool";
import logger from "./logger";

/**
 * SQL执行选项
 */
export interface ExecuteOption extends ExecuteOptions {
    single?: boolean;
    toHump?: boolean;
    toMap?: { [key: string]: string },
}

/**
 * SQL执行器
 */
export class Executor {
    poolName?: string;
    connection: Connection;
    options: ExecuteOptions;

    constructor(connection: Connection, poolName?: string, options?: ExecuteOption) {
        this.connection = connection;
        this.poolName = poolName;
        this.options = Object.assign({}, options);
    }

    public getRows<T = any>(result: OracleDB.Result<T>, option: ExecuteOption): T[] {
        if (result.rows == void 0 || result.rows.length == 0) {
            return [];
        }
        //驼峰转换映射列表
        const humps: { from: string, to: string }[] = [];
        for (let column of result.metaData!) {
            if (option.toMap && column.name in option.toMap) {
                humps.push({ from: column.name, to: option.toMap[column.name] });
            } else if (option.toHump !== false) {
                const toName = column.name.toLowerCase().replace(/_(\w)/g, x => x[1].toUpperCase());
                humps.push({ from: column.name, to: toName });
            } else {
                humps.push({ from: column.name, to: column.name });
            }
        }
        //驼峰转换结果
        const list = <{ [key: string]: any }[]>[];
        for (let row of <any[]>result.rows) {
            const item = <{ [key: string]: any }>{};
            for (let hump of humps) {
                item[hump.to] = row[hump.from];
            }
            list.push(item);
        }
        return <T[]>list;
    }

    public async execute<T = any>(sql: string, params: any = {}, option?: ExecuteOptions): Promise<OracleDB.Result<T>> {
        const options = Object.assign({}, this.options, option);
        const command = dbParam.getArrayCommand(sql, params);
        const result = await this.connection.execute<T>(command.sql, command.bindParams, options);
        return result;
    }

    public async executeMany<T = any>(sql: string, params: any[], option?: ExecuteOptions): Promise<OracleDB.Results<T>> {
        const options = Object.assign({}, this.options, option);
        const result = await this.connection.executeMany<T>(sql, params, options);
        return result;
    }

    public async list<T>(sql: string, params: any = {}, option?: ExecuteOption): Promise<T[]> {
        const options = Object.assign({}, this.options, option);
        const command = dbParam.getArrayCommand(sql, params);
        const result = await this.connection.execute<T>(command.sql, command.bindParams, options);
        return this.getRows<T>(result, options);
    }

    public async get<T>(sql: string, params: any = {}, option?: ExecuteOption): Promise<T | undefined> {
        const options = Object.assign({}, this.options, option);
        const command = dbParam.getArrayCommand(sql, params);
        const result = await this.connection.execute<T>(command.sql, command.bindParams, options);
        if (result.rows && result.rows.length > 1) {
            throw new Error(`应查询到0或1行,实际行数:${result.rows.length}`);
        }
        return this.getRows<T>(result, options)[0];
    }
}


/**
 * 自动创建数据库连接的装饰器工厂方法
 * @param option 连接参数
 * @returns 
 */
export function Execute(option?: { poolName?: string, commit?: boolean }): MethodDecorator {
    return (function (target: Object, propertyName: string, descriptor: TypedPropertyDescriptor<any>) {
        const orginMethod = <Function>descriptor.value;
        descriptor.value = async function (query: any, executor?: Executor) {
            const instance = this;
            const options = Object.assign({ commit: true }, option);
            const poolName = options.poolName || dbPool.getDefaultDB();
            let result: any;
            let connection: Connection | undefined;
            try {
                if (executor == void 0 || executor.poolName != poolName) {
                    connection = await dbPool.getConnection(poolName);
                    executor = new Executor(connection, poolName, { autoCommit: false });
                }
                result = await orginMethod.call(instance, query, executor);
                options.commit && connection && connection.commit();
            } catch (err: any) {
                connection && connection.rollback();
                console.error(`ExecuteError->${target.constructor.name}->${propertyName}异常:`, err.message || err);
                logger.error(`ExecuteError->${target.constructor.name}->${propertyName}异常:`, err.message || err);
                throw err;
            } finally {
                connection && connection.release();
            }
            return result;
        };
    }) as MethodDecorator;
}