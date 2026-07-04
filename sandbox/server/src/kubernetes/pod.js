import { V1Volume } from "@kubernetes/client-node";
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
          volumes:[{
            name:"workspace-volume",
            emptyDir:{}
          }],
         initContainers:[
            {
                name:"init-container",
                image:"template:latest",
                imagePullPolicy:"Always",
                command:['sh','-c','cp -r /workspace/. /seed/'],
                volumeMounts:[{
                    name:"workspace-volume",
                    mountPath:"/seed"
                }]
                

            }
         ],
            containers:[{
                image:"template:latest",
                imagePullPolicy:"Always",
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
                volumeMounts:[{
                    name:"workspace-volume",
                    mountPath:"/workspace"
                }]
            },{
                image:"agent:latest",
                imagePullPolicy:"Always",
                name:"agent-container",
                ports:[{containerPort:3000,name:"http"}],
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
                 volumeMounts:[{
                    name:"workspace-volume",
                    mountPath:"/workspace"
                }]

            }]
        }
        
        
    }
    
    const res= await k8sCoreV1Api.createNamespacedPod({
        namespace:"default",
        body:podManifest
    })

    return res
}
