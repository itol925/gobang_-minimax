// --------------------------------------------------------------------
// -- 创建人:	panyinglong(503940285@qq.com)
// -- 日  期:	2018/01/31
// -- 描  述:	权重评估类
// --------------------------------------------------------------------

namespace WZQ{
    export enum Weight {
        CHENG_WU		=	1000000,		// 五连

        LIAN_HUO_SI		=	10000,			// 连活四
        TIAO_HUO_SI     =   4001,           // 跳活四
        LIAN_MIAN_SI	=	4000,			// 连眠四

        LIAN_HUO_SAN	=	3500,			// 连活三
        TIAO_HUO_SAN	=	3000,			// 跳活三
        LIAN_MIAN_SAN	=	60, 			// 连眠三
        TIAO_MIAN_SAN	=	50,			    // 跳眠三

        LIAN_HUO_ER		=	40,			    // 连活二
        TIAO_HUO_ER		=	30,			    // 跳活二
        LIAN_MIAN_ER	=	2,				// 连眠二
        TIAO_MIAN_ER	=	1				// 跳眠二
    };
    export var WeightList = [
        Weight.CHENG_WU,
        Weight.LIAN_HUO_SI, Weight.TIAO_HUO_SI, Weight.LIAN_MIAN_SI,
        Weight.LIAN_HUO_SAN, Weight.TIAO_HUO_SAN, Weight.LIAN_MIAN_SAN, Weight.TIAO_MIAN_SAN, 
        Weight.LIAN_HUO_ER, Weight.TIAO_HUO_ER, Weight.LIAN_MIAN_ER, Weight.TIAO_MIAN_ER, 
    ]
    export var WeightName = {
        [Weight.CHENG_WU] : "成五",

        [Weight.LIAN_HUO_SI] : "连活四",
        [Weight.TIAO_HUO_SI] : "跳活四",
        [Weight.LIAN_MIAN_SI] : "连眠四",

        [Weight.LIAN_HUO_SAN] : "连活三",
        [Weight.TIAO_HUO_SAN] : "跳活三",
        [Weight.LIAN_MIAN_SAN] : "连眠三",
        [Weight.TIAO_MIAN_SAN] : "跳眠三",

        [Weight.LIAN_HUO_ER] : "连活二",
        [Weight.TIAO_HUO_ER] : "跳活二",
        [Weight.LIAN_MIAN_ER] : "连眠二",
        [Weight.TIAO_MIAN_ER] : "跳眠二",
    }
    
    export enum Line {
        L_R = 1,
        U_D = 2,
        LU_RD = 3,
        LD_RU = 4
    };

    export class Evaluate {
        // private static LineValues = [Line.L_R, Line.U_D, Line.LU_RD, Line.LD_RU]
        private static chessTypes = [
            {
                weight:Weight.CHENG_WU,
                templates:[
                    [1,1,1,1,1],
                ]
            },
            {
                weight:Weight.LIAN_HUO_SI,
                templates:[
                    [0,1,1,1,1,0],
                ]
            },
            {
                weight:Weight.TIAO_HUO_SI,
                templates:[
                    [1,1,0,1,1],
                    [1,0,1,1,1],
                    [1,1,1,0,1],
                ]
            },
            {
                weight:Weight.LIAN_MIAN_SI,
                templates:[
                    [2,1,1,1,1,0],
                    [0,1,1,1,1,2],
                ]
            },
            {
                weight:Weight.LIAN_HUO_SAN,
                templates:[
                    [0,1,1,1,0],
                ]
            },
            {
                weight:Weight.LIAN_MIAN_SAN,
                templates:[
                    [2,1,1,1,0,0],
                    [0,0,1,1,1,2],
                ]
            },
            {
                weight:Weight.TIAO_HUO_SAN,
                templates:[
                    [0,1,1,0,1,0],
                    [0,1,0,1,1,0],         
                ]
            },
            {
                weight:Weight.TIAO_MIAN_SAN,
                templates: [
                    [2,1,1,0,1,0],
                    [2,1,0,1,1,0],
                    [0,1,1,0,1,2],
                    [0,1,0,1,1,2],
                ]
            },
            {
                weight:Weight.LIAN_HUO_ER,
                templates:[
                    [0,1,1,0,0],
                    [0,0,1,1,0]
                ]
            },
            {
                weight:Weight.LIAN_MIAN_ER,
                templates:[
                    [2,1,1,0,0,0],
                    [0,0,0,1,1,2],
                ]
            },
            {
                weight:Weight.TIAO_HUO_ER,
                templates:[
                    [0,1,0,1,0],
                ]
            },
            {
                weight:Weight.TIAO_MIAN_ER,
                templates:[
                    [2,1,0,1,0,0],
                    [0,0,1,0,1,2],
                ]
            }
        ]
        private static getMatchIndex(arr:number[], template:number[]):number[]{
            var difIndex = []
            for(var i = 0; i <= arr.length - template.length; i++){
                var matchCount = 0
                var dif = -1
                for(var j = 0; j < template.length; j++){
                    if(template[j] != arr[i + j]){
                        if(dif >= 0){
                            dif = -1
                            break
                        }else{
                            if(template[j] == 1 && arr[i + j] == 0){
                                dif = i + j
                            }else{
                                break
                            }
                        }
                    }
                }
                if(dif > 0){
                    difIndex.push(dif)
                }
            }
            return difIndex
        }
        public static updateWeights(arr:Array<wzqPos>, line:Line){
            var blackArr = []
            var whiteArr = []
            for(var i = 0; i < arr.length; i++){
                if(arr[i].color == wzqColor.none){
                    blackArr.push(0)
                    whiteArr.push(0)
                }else if(arr[i].color == wzqColor.black){
                    blackArr.push(1)
                    whiteArr.push(2)
                }else if(arr[i].color == wzqColor.white){
                    blackArr.push(2)
                    whiteArr.push(1)
                }else if(arr[i].color == wzqColor.forbidden){
                    blackArr.push(2)
                    whiteArr.push(2)
                }
            }
            for(var ct = 0; ct < this.chessTypes.length; ct++){
                var chessType = this.chessTypes[ct]
                for(var t = 0; t < chessType.templates.length; t++){
                    var template = chessType.templates[t]
                    var blackIndex = this.getMatchIndex(blackArr, template)
                    if(blackIndex.length > 0){
                        for(var i = 0; i < blackIndex.length; i++){
                            arr[blackIndex[i]].setWei(chessType.weight, wzqColor.black, line)
                        }
                    }
                    var whiteIndex = this.getMatchIndex(whiteArr, template)
                    if(whiteIndex.length > 0){
                        for(var i = 0; i < whiteIndex.length; i++){
                            arr[whiteIndex[i]].setWei(chessType.weight, wzqColor.white, line)
                        }
                    }
                }
            }
        }
    }
}