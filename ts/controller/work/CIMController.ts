import { Controller, Request } from "../../common/router";
import CIMService from "../../service/work/CIMService";

const service = new CIMService();

/**
 * 工单CIM文件信息查询 
 */
@Controller('cim')
export default class CIMController {

    @Request("/get")
    @Request("/get/:feederKey")
    public async get(query: { feederKey: number }): Promise<any> {
        return service.get(query);
    }

}