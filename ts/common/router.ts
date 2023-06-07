import express from 'express';
import path from "path";
import fs from "fs";
import wjson from "wjson-util";

export enum Method {
    Get = "get",
    Post = "post",
    Put = "put",
    Delete = "delete"
}

interface IController {
    target: Function;
    name: string;
    path: string;
}

interface IRequest {
    target: any;
    propertyKey: string | symbol;
    descriptor: TypedPropertyDescriptor<any>;
    path: string;
    method: Method;
    format?: boolean;
}

const RequestList: IRequest[] = [];
const ControllerList: IController[] = [];
const ControllerMap = new Map<Function, IController>();


/**
 * @description:  控制器类注解
 * @param {string} name 请求路径
 * @return {*}
 */
export function Controller(name?: string): ClassDecorator {
    return (target: Function) => {
        name = name || ('/' + target.name.replace(/Controller$/, ''));
        const controller = <IController>{ target, name };
        ControllerMap.set(target, controller);
        ControllerList.push(controller);
    }
}

/**
 * @description:  将一个方法标记为路由请求
 * @param {string} path     请求路径
 * @param {boolean} format:  是否格式化参数
 * @param {Method | Method[]} method：方法类型 默认为[get,post]
 * @return {MethodDecorator}
 */
export function Request(path?: string, format: boolean = true, method: Method | Method[] = [Method.Get, Method.Post]): MethodDecorator {
    return (function <T>(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) {
        const methods = Array.isArray(method) ? method : [method];
        const methodKey = path || ('/' + propertyKey);
        for (const methodName of methods) {
            RequestList.push({
                path: methodKey,
                method: methodName,
                target: target,
                format: format,
                propertyKey: propertyKey,
                descriptor: descriptor
            });
        }
    }) as MethodDecorator;
}

/**
 * @description:  将一个方法标记为Get请求
 * @param path 请求路径
 * @param format 是否格式化参数
 * @returns 
 */
export function GetRequest(path?: string, format: boolean = true): MethodDecorator {
    return Request(path!, format, Method.Get);
}

/**
 * @description:  将一个方法标记为Post请求
 * @param path 请求路径
 * @param format 是否格式化参数
 * @returns 
 */
export function PostRequest(path?: string, format: boolean = true): MethodDecorator {
    return Request(path!, format, Method.Post);
}


function searchController(scandir: string, rootUrl: string = '') {
    const rootDir = path.isAbsolute(scandir) ? scandir : path.join(__dirname, '../', scandir);
    const roots: string[] = [rootDir];
    for (let index = 0; index < roots.length; index++) {
        const dirFull = roots[index];
        fs.readdirSync(dirFull).forEach(fileName => {
            const full = path.join(dirFull, fileName)
            const stat = fs.statSync(full);
            if (stat.isDirectory()) {
                roots.push(full);
            } else if (stat.isFile() && fileName.match(/.ts$|.js$/i)) {
                const router = require(full).default;
                if (router && ControllerMap.has(router)) {
                    const controller = ControllerMap.get(router)!;
                    const controllerPath = path.join(rootUrl, dirFull.substring(rootDir.length), controller.name);
                    controller.path = controllerPath.replace(/\\/g, '/');
                }
            }
        });
    }
}

function routerController(app: express.Application) {
    const records = new Set<string>();
    for (const controller of ControllerList) {
        if (records.has(controller.path.toLowerCase())) {
            throw new Error(`控制器地址重复使用:${controller.path}`);
        }
        records.add(controller.path.toLowerCase());
        const router = express.Router()
        for (const request of RequestList.filter(item => item.target.constructor == controller.target)) {
            router[request.method](request.path, async function (req, res, next) {
                try {
                    const instance = new (<new () => any>(controller.target))();
                    const query = request.format ? wjson.decode(req.query) : req.query;
                    const body = request.format ? wjson.clone(req.body) : req.body;
                    const option = Object.assign({}, req.params, query, body);
                    const result = await instance[request.propertyKey](option, req, res);
                    return res.json({ code: 0, data: result });
                } catch (err) {
                    next(err);
                }
            });
            console.log(`${request.method}:${controller.path}${request.path}`);
        }
        app.use(controller.path, router);
    }
}

/**
 * @description: 注册路由
 * @param {express.Application} app
 * @param {string} scandir
 * @param {string} rootUrl
 * @return {void}
 */
export function registerController(app: express.Application, scandir: string, rootUrl: string = '/service'): void {
    searchController(scandir, rootUrl);
    routerController(app);
}