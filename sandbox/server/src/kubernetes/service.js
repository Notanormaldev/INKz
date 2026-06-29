import { k8sCoreV1Api } from "./config";


export const createService=async (sandboxid)=>{
   const serviceManifest={
    metadata:{
        name:`sandbox-service-${sandboxid}`,
        labels:{
            sandboxid:sandboxid
        }
    },
    spec:{
        selector:{
            app:"sandbox",
            sandboxid:sandboxid
        },
        ports:[
            {   name:"http",
                protocol:"TCP",
                port:80,
                targetPort:5173
            }
        ],
        type:"ClusterIp"
    }
   }
   
   const res= await k8sCoreV1Api.createNamespacedService({
    namespace:"default",
    body:serviceManifest
   })
   return res
}