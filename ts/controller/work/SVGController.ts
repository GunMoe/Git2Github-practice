import { Controller, Request } from "../../common/router";
import SVGService from "../../service/work/SVGService";

const service = new SVGService();

/**
 * 工单SVG文件与信息查询
 */
@Controller('svg')
export default class SVGController {

    @Request("/get")
    @Request("/get/:feederKey")
    public async get(query: { feederKey: number }): Promise<any> {
        return service.get(query);
    }

}