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

export async function deleteservice(sandboxid){
    try {
        const res = await k8sCoreV1Api.deleteNamespacedService({
            namespace:"default",
            name:`sandbox-service-${sandboxid}`,
        })
        return res;
    } catch (err) {
        if (err?.code === 404 || err?.statusCode === 404 || (typeof err?.body === 'string' && err?.body?.includes('NotFound'))) {
            console.log(`[K8S] Service sandbox-service-${sandboxid} already deleted or not found.`);
            return null;
        }
        console.error(`[K8S] Error deleting service sandbox-service-${sandboxid}:`, err?.message || err);
        return null;
    }
}