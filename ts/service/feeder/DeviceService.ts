import { Execute, Executor } from "../../common/dbExecute";

/**
 * 馈线设备拓扑查询
 */
export default class DeviceService {

    @Execute()
    public async listByFeederKeys(query: { feederKeys: number[] }, executor?: Executor): Promise<any> {
        const sql = `SELECT T.FEEDER_KEY,
        T.VERSION_ID,
        T.DISPATCH_NUMBER,
        T.DEV_ID,
        T.DEV_NAME,
        T.DEV_CODE,
        T.DEV_TYPE,
        T.SUB_TYPE,
        T.SITE_ID,
        T.SITE_TYPE,
        T.SITE_NAME,
        T.HEAD_NODE,
        T.TAIL_NODE,
        T.NORMAL_OPEN,
        T.NORMAL_POS,
        T.OWNERSHIP,
        T.STATUS
        FROM NSL_FEEDER_DEVICE T
        WHERE T.FEEDER_KEY in (:feederKeys)`;
        return await executor!.list(sql, query);
    }

    @Execute()
    public async listByFeederKey(query: { feederKey: number }, executor?: Executor) {
        return await this.listByFeederKeys({ feederKeys: [query.feederKey] }, executor);
    }
}