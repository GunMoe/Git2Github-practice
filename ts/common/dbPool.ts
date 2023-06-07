import oracledb, { Connection, Pool } from 'oracledb';
import dbConfig from "../config/dbconfig";
import logger from './logger';

oracledb.maxRows = 99999;
oracledb.fetchAsBuffer = [oracledb.BLOB];
oracledb.fetchAsString = [oracledb.CLOB];
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const dbPools = <{ [key: string]: oracledb.Pool }>{};
const dbOptions = { defaultDB: 'nsl' };

export function getDefaultDB(): string {
    return dbOptions.defaultDB;
}

/**
 * 初始化获取所有连接池
 * @returns 
 */
export async function initPools(): Promise<Pool[]> {
    const result: Pool[] = [];
    for (const name in dbConfig) {
        result.push(await getPool(name));
    }
    return result;
}


/**
 * 获取指定数据库的连接池
 * @param poolName 
 * @returns 
 */
export async function getPool(poolName?: string): Promise<Pool> {
    try {
        const defName = poolName || dbOptions.defaultDB;
        return dbPools[defName] ||
            (dbPools[defName] = await oracledb.createPool(Object.assign({
                poolMin: 1,
                poolMax: 99,
                poolAlias: poolName
            }, dbConfig[defName])));
    } catch (err: any) {
        console.error(`打开连接池异常-Name:${poolName}\r\n`, err.message || err);
        logger.error(`打开连接池异常-Name:${poolName}\r\n`, err.message || err);
        throw err;
    }
}

/**
 * 从连接池中获取一个数据库连接
 * @param poolName 
 * @returns 
 */
export async function getConnection(poolName?: string): Promise<Connection> {
    return (await getPool(poolName)).getConnection();
}

export default { initPools, getPool, getConnection, getDefaultDB };