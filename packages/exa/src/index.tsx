import s from "path";

console.log("xxx11", s);
11;


interface StoreSlice<N extends string, S, R, E, W, C> {
    namespace: N;
    state?: S;
    reducers?: E;
    effects?: E;
    watchs?: W,
    computed?: C
}


function defineStoreSlice<N extends string, S, R, E, W, C, STORE extends StoreSlice<N, S, R, E, W, C>>(store: STORE): STORE & {
    useStore: () => STORE["state"];
    useAction: (dispatch:any,event :keyof STORE["reducers"],options?:{ loading:boolean}) => STORE["reducers"] & STORE["effects"];
    useComputed: () => STORE["computed"];
}

function defineStoreSlice(store) {
    return store;
}

const dispatch:any=null;



const store1 = defineStoreSlice({ 
    namespace: "x1",
    state:{
        name:"张三"
    },
    reducers:{
        onChangeName1(){}
    } ,
    computed:{
        fullName(){

        }
    }
})

const store2 = defineStoreSlice({ 
    namespace: "x1",
    state:{
        name:"张三"
    },
    reducers:{
        onChangeName(){}
    } ,
    computed:{
        fullName(){

        }
    }
})


// function App(){

//     const {
//         run,
//         loading,
//         retry
//     }  = store1.useAction(dispatch,"onChangeName1",{ loading:true });



//     store1.useComputed();

//     store1.useStore();

//     store2.useAction(dispatch,"onChangeName");

//     store2.useComputed();

//     store2.useStore();

//     return (
//         <>
//             <h1>hello</h1>
//         </>
//     )
// }