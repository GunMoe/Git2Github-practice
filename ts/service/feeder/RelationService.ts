import { Execute, Executor } from "../../common/dbExecute";

/**
 * 馈线间关系查询
 */
export default class RelationService {

    @Execute()
    public async listByFeederKeys(query: { feederKeys: number[] }, executor?: Executor): Promise<any> {
        const sql = `SELECT T.FEEDER_KEY,
        T.RELATION_KEY,
        T.RELATION_STATUS,
        T.START_TIME,
        T.END_TIME,
        T.START_COMMIT_ID,
        T.END_COMMIT_ID,
        T.DEV_ID
   FROM NSL_FEEDER_RELATION T
  WHERE T.FEEDER_KEY IN (:feederKeys)`;
        return await executor!.list(sql, query);
    }

    @Execute()
    public async listByFeederKey(query: { feederKey: number }, executor?: Executor) {
        return await this.listByFeederKeys({ feederKeys: [query.feederKey] }, executor);
    }
}