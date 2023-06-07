import { Controller, Request } from "../../common/router";
import RelationService from "../../service/feeder/RelationService";

const service = new RelationService();

@Controller('relation')
export default class RelationController {

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