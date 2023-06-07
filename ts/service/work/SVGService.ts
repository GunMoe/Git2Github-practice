import { Execute, Executor } from "../../common/dbExecute";

/**
 * 馈线设备拓扑查询
 */
export default class SVGService {

    @Execute()
    public async get(query: { feederKey: number }, executor?: Executor): Promise<any> {
        const sql = `SELECT T.NOTICE_ID FEEDER_KEY,
        T.NOTICE_TIME,
        T.NOTICE_STATUS,
        T.VERSION_ID,
        T.SVG_FILE
   FROM NSL_WORK_NOTICE T
  WHERE T.NOTICE_ID = :feederKey`;
        return await executor!.get(sql, query);
    }

}