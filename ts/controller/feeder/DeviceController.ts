import { Controller, Request } from "../../common/router";
import DeviceService from "../../service/feeder/DeviceService";
 
const service = new DeviceService();

@Controller('device')
export default class DeviceController {

    @Request("/listByFeederKey")
    @Request("/listByFeederKey/:feederKey")
    public async listByFeederKey(query: { feederKey: number }): Promise<any> {
        return service.listByFeederKey(query);
    }


    @Request("/listByFeederKeys")
    public async listByFeederKeys(query: { feederKeys: number[] }): Promise<any> {
        return service.listByFeederKeys(query);
    }
}