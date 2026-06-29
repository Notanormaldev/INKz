import { k8sCoreV1Api } from "./config.js";



export async function createpod(sandboxid){

    const podManifest={
        apiVersion:"v1",
        kind:"Pod",
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
                imagePullPolicy:"IfNotPresent",
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
