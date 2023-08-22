import { getDB } from "../logic/database.js";
import { Request, Response } from "express";
import lodash from 'lodash';

function getServers(req: Request, res: Response) {
    const servers = getDB().chain.get('servers').value();
    res
        .status(200)
        .json({message:'All servers', result: servers });
}

function getServer(req: Request, res: Response) {
    const server
     = getDB().chain.get('servers').find({name:req.params.id}).value();
    res
        .status(200)
        .json({message:'All servers', result: server });
}

function  addServer(req: Request, res: Response) {
    const server = req.body;
    const db = getDB();
    const servers = db.chain.get('servers').value();
    servers.push(server);
    db.write();
    res.status(200).json({message:'Server added',result:servers});
}

function  editServer(req: Request, res: Response) {
    const db = getDB();
    console.log("Request Params ", req.params);
    const server = db.chain.get('servers').find({name: req.params.name}).value();
    console.log("Server to update", server);

    lodash.merge(server, req.body);
    db.write();
    const servers =db.chain.get('servers').value();
    res.status(200).json({message:'Server Edited',result:servers});
}

function deleteServer(req: Request, res: Response) {

}

export function registerServersRoutes(app: any) {
    // app.use("/servers", checkAuth);
    
    app.get("/servers", getServers);
    app.post("/servers", addServer);
    app.patch("/servers/:name", editServer);
    app.get("/servers/:id", getServer);
    app.delete("/servers/:id", deleteServer);
}
  