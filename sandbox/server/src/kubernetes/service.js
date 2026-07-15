import { k8sCoreV1Api } from "./config.js";


export const createservice=async (sandboxid)=>{
   const serviceManifest={
    apiVersion:"v1",
    kind:"Service",
    metadata:{
        name:`sandbox-service-${sandboxid}`,
        labels:{
            sandboxid:sandboxid
        }
    },
    spec:{
        selector:{
            sandboxid:sandboxid
        },
        ports:[
            {   name:"http",
                protocol:"TCP",
                port:80,
                targetPort:5173
            },
            {   name:"agent-http",
                protocol:"TCP",
                port:3000,
                targetPort:3000
            }

        ],
        type:"ClusterIP"
    }
   }
   
   const res= await k8sCoreV1Api.createNamespacedService({
    namespace:"default",
    body:serviceManifest
   })
   return res
}


