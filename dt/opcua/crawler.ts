

import { OPCUAClient, ClientSession, NodeCrawler, CacheNode, UserData, BrowseDirection, NodeClass, CacheNodeVariable, DataType } from "node-opcua";
const endpointUrl = "opc.tcp://localhost:4334/UA/OPCServer";
const js2xml = require("js2xmlparser");

//const nodeId = "ns=0;i=85"; // ObjectFolder
const nodeId = "ns=1;i=1000"; // MyDevices
const nodeId2 = "ns=1;i=1001";
const nodeId3 = "ns=1;i=1002";
const nodeId4 = "ns=1;i=1003";

(async () => {
    try {
        function onBrowse(crawler: NodeCrawler, cacheNode: CacheNode, userData: UserData) {
            if (cacheNode.nodeClass === NodeClass.ReferenceType) {
                return;
            }
            const node: any = { "@": {} };

            node["@"].nodeClass = NodeClass[cacheNode.nodeClass];

            if (cacheNode.nodeClass === NodeClass.Variable) {
                const cacheNodeVariable = (cacheNode as CacheNodeVariable);
                node["@"].dataType = DataType[cacheNodeVariable.dataType.value.toString()];
            }
            const myUserData = {
                onBrowse,
                root: node,
            };
            (userData as any).root[cacheNode.browseName.name.toString()] = node;
            if (cacheNode.nodeClass === NodeClass.Variable) {
                return;
            }
            NodeCrawler.follow(crawler, cacheNode, myUserData, "Organizes", BrowseDirection.Forward);
            NodeCrawler.follow(crawler, cacheNode, myUserData, "HasComponent", BrowseDirection.Forward);
            NodeCrawler.follow(crawler, cacheNode, myUserData, "HasProperty", BrowseDirection.Forward);
        }

        const client = OPCUAClient.create({ endpoint_must_exist: false });
        client.on("backoff", () => { console.log("keep trying to connect"); });
        const pojo = await client.withSessionAsync(endpointUrl, async (session: ClientSession) => {
            const crawler = new NodeCrawler(session);
            const userData = { onBrowse, root: {} };
            await crawler.crawl(nodeId, userData);
            await crawler.crawl(nodeId2, userData);
            await crawler.crawl(nodeId3, userData);
            await crawler.crawl(nodeId4, userData);
            return userData.root;
        });
        console.log(js2xml.parse("data", pojo));
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
})();
