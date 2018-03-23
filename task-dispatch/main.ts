import { consul, httpRest } from "cmon-lib";
import * as mysql from "mysql";
// import * as redis from "redis";

// const client = redis.createClient();
// client.on("error", (err) => console.log("Error " + err));

// client.lpush("b", "Aaa");

const httpRoute = new httpRest.RouteService();

// httpRoute.get<{ host: string }>("/v1/os/host/:host/tasks", (ctx) => {
//     ctx.res.end("a");
// });

interface TaskOs {
    tn: string;
    sss: string[];
    args: string[];
}

const futureMysqlServices = consul.getServiceByName("mysql");
// const futureRedisServices = consul.getServiceByName("redis");

async function getConnect() {
    const mysqlServices = await futureMysqlServices;
    if (mysqlServices.length === 0) { throw new Error("service mysql no exist."); }
    const mysqlService = mysqlServices[0];
    return mysql.createPool({
        connectionLimit: 10,
        database: "cmon", host: mysqlService.ServiceAddress, password: "123456aA+", user: "root",
    });
}

const pConnect = getConnect()

let num = 0

httpRoute.get<{ endpoint: string }>("/v1/endpoint/:endpoint/tasks", (ctx) => {
    num += 1;
    pConnect.then((connection) => {
        connection.getConnection((err, conn) => {
            if (err) {
                console.error("conn fff");
            } else {
                conn.query("SELECT t_name task_name, t_scripts task_scripts, t_args task_args FROM runtime_tasks_os WHERE ep_name = ?", [ctx.req.param.endpoint], (error, results, fields) => {
                    conn.release();
                    if (error) { console.info(error); } else {
                        ctx.res.statusCode = 200;
                        console.info("return reponce", ctx.req.param.endpoint, num)
                        ctx.res.end(JSON.stringify(results));
                        num -= 1
                    }
                });
            }
        });
    })
});

httpRest.createHttpRestServer(...httpRoute.routes).listen(9000);

// httpRest.createHttpRestServer(...httpRoute.routes).listen(9000);
// async function handler_endpoint_tasks(ctx) {
//     const mysqlServices = await futureMysqlServices;
//     if (mysqlServices.length === 0) { throw new Error("service mysql no exist."); }
//     const mysqlService = mysqlServices[0];
//     const connection = mysql.createPool({
//         database: "cmon",
//         host: mysqlService.ServiceAddress,
//         password: "123456aA+",
//         user: "root",
//     });

//     console.info("connect start.");
//     connection.on("error", (err) => console.info(err));

//     setInterval(async () => {
//         connection.getConnection((err, conn) => {
//             if (err) {
//                 console.info("conn fff");
//             } else {
//                 conn.query("SELECT 1 + 1 AS solution", (error, results, fields) => {
//                     conn.release();
//                     if (error) { console.info(error); } else {
//                         console.info(results[0], new Date());
//                     }
//                 });
//             }
//         });
//     }, 1000);
// }

// main().catch((err) => console.error(err));
