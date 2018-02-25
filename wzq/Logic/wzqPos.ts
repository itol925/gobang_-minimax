// --------------------------------------------------------------------
// -- 创建人:	panyinglong(503940285@qq.com)
// -- 日  期:	2018/01/31
// -- 描  述:	棋盘位置
// --------------------------------------------------------------------

namespace WZQ{
    export enum wzqColor{
        black = 1,  // 白
        white = 2,  // 黑
        none = 3,    // 空位，可落子
        forbidden = 4, // 禁手位
    }
    
    export class wzqPos{
        public row:number = -1
        public col:number = -1
        private b_weight = {}
        private w_weight = {}
        private b_sum_weight = 0
        private w_sum_weight = 0
        private b_weight_details = {}
        private w_weight_details = {}

        public color:wzqColor = wzqColor.none
        constructor(r:number, c:number){
            this.row = r
            this.col = c
            this.clearWei()
        }
        public setWei(weight:Weight, color:wzqColor, line:Line){
            if(color == wzqColor.black){
                if(!this.b_weight_details[line][weight]){
                   this.b_weight_details[line][weight] = 0
                }
                this.b_weight[line] += weight
                this.b_sum_weight += weight
                this.b_weight_details[line][weight] += 1
            }else if(color == wzqColor.white){
                if(!this.w_weight_details[line][weight]){
                    this.w_weight_details[line][weight] = 0
                }
                this.w_weight[line] += weight
                this.w_sum_weight += weight
                this.w_weight_details[line][weight] += 1
            }
        }
        public getWei(color:wzqColor, line?:Line):number{
            if(line){
                if(color == wzqColor.black){
                    return this.b_weight[line]
                }else if(color == wzqColor.white){
                    return this.w_weight[line]
                }
            }else{
                if(color == wzqColor.black){
                    return this.b_sum_weight
                }else if(color == wzqColor.white){
                    return this.w_sum_weight
                }
            }
        }
        public getWeightCount(color:wzqColor, weight:Weight, line?:Line){
            if(line){
                if(color == wzqColor.black){
                    return this.b_weight_details[line][weight] ? this.b_weight_details[line][weight] : 0
                }else if(color == wzqColor.white){
                    return this.w_weight_details[line][weight] ? this.w_weight_details[line][weight] : 0
                }
            }else{
                var n = 0
                if(color == wzqColor.black){
                    n += this.b_weight_details[Line.L_R][weight] ? this.b_weight_details[Line.L_R][weight] : 0
                    n += this.b_weight_details[Line.U_D][weight] ? this.b_weight_details[Line.U_D][weight] : 0
                    n += this.b_weight_details[Line.LD_RU][weight] ? this.b_weight_details[Line.LD_RU][weight] : 0
                    n += this.b_weight_details[Line.LU_RD][weight] ? this.b_weight_details[Line.LU_RD][weight] : 0
                }else if(color == wzqColor.white){
                    n += this.w_weight_details[Line.L_R][weight] ? this.w_weight_details[Line.L_R][weight] : 0
                    n += this.w_weight_details[Line.U_D][weight] ? this.w_weight_details[Line.U_D][weight] : 0
                    n += this.w_weight_details[Line.LD_RU][weight] ? this.w_weight_details[Line.LD_RU][weight] : 0
                    n += this.w_weight_details[Line.LU_RD][weight] ? this.w_weight_details[Line.LU_RD][weight] : 0
                }
                return n
            }
        }
        public clearWei(line?:Line){
            if(line){
                this.b_weight_details[line] = {}
                this.w_weight_details[line] = {}
                this.b_sum_weight -= this.b_weight[line]
                this.w_sum_weight -= this.w_weight[line]
                this.b_weight[line] = 0
                this.w_weight[line] = 0
            }else{                
                this.b_weight_details[Line.L_R] = {}
                this.b_weight_details[Line.U_D] = {}
                this.b_weight_details[Line.LD_RU] = {}
                this.b_weight_details[Line.LU_RD] = {}            
                this.b_weight[Line.L_R] = 0
                this.b_weight[Line.U_D] = 0
                this.b_weight[Line.LD_RU] = 0
                this.b_weight[Line.LU_RD] = 0
                this.b_sum_weight = 0
                
                this.w_weight_details[Line.L_R] = {}
                this.w_weight_details[Line.U_D] = {}
                this.w_weight_details[Line.LD_RU] = {}
                this.w_weight_details[Line.LU_RD] = {}
                this.w_weight[Line.L_R] = 0
                this.w_weight[Line.U_D] = 0
                this.w_weight[Line.LD_RU] = 0
                this.w_weight[Line.LU_RD] = 0
                this.w_sum_weight = 0
            }
        }
        public printWeight(){
            var str = 'black:'
            var str2 = 'white:'
            for(var i = 0; i < WeightList.length; i++){
                var wei = WeightList[i]
                var count = this.getWeightCount(wzqColor.black, wei)
                if(count > 0){
                    str += WeightName[wei] + 'x' + count + '; '
                }
                count = this.getWeightCount(wzqColor.white, wei)
                if(count > 0){
                    str2 += WeightName[wei] + 'x' + count + '; '
                }
            }
            return str + "\n" + str2
            // console.log(str + "\n" + str2)
        }
        public isForb33():boolean{
            if(this.color != wzqColor.none){
                return false
            }
            if(this.getWeightCount(wzqColor.black, Weight.CHENG_WU) > 0){ // 有成五
                return false
            }
            var threeNum = this.getWeightCount(wzqColor.black, Weight.LIAN_HUO_SAN) + this.getWeightCount(wzqColor.black, Weight.TIAO_HUO_SAN)
            return threeNum >= 2
        }
        public isForb44():boolean{
            if(this.color != wzqColor.none){
                return false
            }
            if(this.getWeightCount(wzqColor.black, Weight.CHENG_WU) > 0){ // 有成五
                return false
            }
            var fourNum = this.getWeightCount(wzqColor.black, Weight.LIAN_HUO_SI) + this.getWeightCount(wzqColor.black, Weight.LIAN_MIAN_SI) + this.getWeightCount(wzqColor.black, Weight.TIAO_HUO_SI)
            return fourNum >= 2
        }
    }
}