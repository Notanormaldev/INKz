import { V1Volume } from "@kubernetes/client-node";
import { k8sCoreV1Api } from "./config.js";



export async function createpod(sandboxid,projectid){

    const podManifest={
        apiVersion:"v1",
        kind:"Pod",
        metadata:{
            name:`sandbox-pod-${sandboxid}`,
            labels:{
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

            },
        {
           name:"sync-agent",
           image:"sync-agent:latest",
           imagePullPolicy:"Always",
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
           }],
           env:[
            {
                name:"PROJECT_ID",
                value:projectid
            },
            {
                name:"AWS_ACCESS_KEY_ID",
                valueFrom:{
                    secretKeyRef:{
                        name:"aws",
                        key:"AWS_ACCESS_KEY_ID"
                    }
                }
            },
            {
                name:"AWS_SECRET_ACCESS_KEY",
                valueFrom:{
                    secretKeyRef:{
                        name:"aws",
                        key:"AWS_SECRET_ACCESS_KEY"
                    }
                }
            },
            {
                name:"AWS_REGION",
                valueFrom:{
                    secretKeyRef:{
                        name:"aws",
                        key:"AWS_REGION"
                    }
                }
            }
           ]
        }]
        }
        
        
    }
    
    const res= await k8sCoreV1Api.createNamespacedPod({
        namespace:"default",
        body:podManifest
    })

    return res
}
export async function deletepod(sandboxid){
   const res = await k8sCoreV1Api.deleteNamespacedPod({
        namespace:"default",
        name:`sandbox-pod-${sandboxid}`
    },{
        gracePeriodSeconds:0
    })
    return res ;
}


