import { k8sCoreV1Api } from "./config.js";



export async function createpod(sandboxid){

    const podManifest={
        metadata:{
            name:`sandbox-pod-${sandboxid}`,
            labels:{
                app:`sandbox`,
                sandboxid:sandboxid
            }
        },
        spec:{
            containers:[{
                image:"template",
                imagepullpolicy:"IfNotPresent",
                name:"sandbox-container",
                ports:[{containerPort:5173,name:"http"}],
                resources:{
                    requests:{
                        memory:"256Mi",
                        cpu:"250m"
                    },
                    limits:{
                        memory:"512Mi",
                        cpu:"500m"
                    }
                },

            }]
        }
        
        
    }
    
    const res= await k8sCoreV1Api.createNamespacedPod({
        namespace:"default",
        body:podManifest
    })

    return res
}
