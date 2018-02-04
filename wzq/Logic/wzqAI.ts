// --------------------------------------------------------------------
// -- 创建人:  panyinglong(503940285@qq.com)
// -- 日  期:	2018/01/31
// -- 描  述:	ai
// --------------------------------------------------------------------

namespace WZQ{
    const MAX = Weight.CHENG_WU * 100
    const MIN = -1 * MAX

    export class wzqAI {
        private optionLimit:number = 6 // 每一步棋考虑的广度，即多少个候选项
        private aiDeep:number = 9 // 搜索深度，只能为奇数

        private alphaCut = 0
        private betaCut = 0
        private total = 0
        private optionIndex = 0
        private optionCount = 0

        private chessboard:wzqChessBoard
        private color:wzqColor
        private enemyColor:wzqColor
        constructor(cb:wzqChessBoard, color:wzqColor){
            this.chessboard = cb
            this.color = color
            this.enemyColor = this.color == wzqColor.black ? wzqColor.white : wzqColor.black
        }
        public get Color():wzqColor{
            return this.color
        }

        public put(onPut:Function, thisObj:any){
            var startTime = egret.getTimer()
            console.log('ai start move..')
            egret.setTimeout(()=>{
                var pos = null
                var deep = this.aiDeep
                if(this.chessboard.stepIndex == 0){
                    var size = this.chessboard.RowCount < this.chessboard.ColCount ? this.chessboard.RowCount : this.chessboard.ColCount
                    var s = Math.floor(size/3)                    
                    var row = s + Math.floor(Math.random() * s) 
                    var col = s + Math.floor(Math.random() * s)
                    pos = {row:row, col:col}
                }else{
                    if(this.chessboard.stepIndex == 1){
                        deep = 1
                    }else if(this.chessboard.stepIndex <= 4 && deep > 3){
                        deep = 3
                    }else if(this.chessboard.stepIndex <= 8 && deep > 5){
                        deep = 5
                    }else if(this.chessboard.stepIndex <= 12 && deep > 7){
                        deep = 7
                    }
                    var p = this.negamax(deep)
                    if(p){
                        row = p.row
                        col = p.col
                        pos = {row:row, col:col}
                    }else{
                        console.error('ai failed found pos')
                        pos = null
                    }
                }
                var costTime = egret.getTimer() - startTime
                console.log('ai move finished! deep:' + deep + ' total:' + this.total + " alphaCut:" + this.alphaCut + " betaCut:" + this.betaCut + 
                    " costTime:" + costTime + " nodeTime:" + (costTime/this.total).toFixed(2) + " optionIndex:" + this.optionIndex + " optionCount:" + this.optionCount)
                onPut.call(thisObj, pos)
            }, this, 200)            
        }
        private evaluate():number{
            var sw = 0
            var ew = 0
            for(var r = 0; r < this.chessboard.ColCount; r++){
                for(var c = 0; c < this.chessboard.RowCount; c++){
                    var pos = this.chessboard.PosChart[r][c]
                    if(pos.color == wzqColor.none){
                        sw += pos.getWei(this.color)
                        ew += pos.getWei(this.enemyColor)                        
                    }
                }
            } 
            return sw - ew
        }
        private getOptions(thisColor:wzqColor):Array<wzqPos>{
            var oppoColor = thisColor == wzqColor.black ? wzqColor.white : wzqColor.black
            var options = []
            for(var r = 0; r < this.chessboard.ColCount; r++){
                for(var c = 0; c < this.chessboard.RowCount; c++){
                    var pos = this.chessboard.PosChart[r][c]
                    if(pos.color == wzqColor.none){
                        options.push(pos)
                    }
                }
            }
            for(var i = 0; i < options.length; i++){
                for(var j = i + 1; j < options.length; j++){
                    var a = options[i].getWei(thisColor) + options[i].getWei(oppoColor)
                    var b = options[j].getWei(thisColor) + options[j].getWei(oppoColor)
                    if(a < b){
                        var temp = options[j]
                        options[j] = options[i]
                        options[i] = temp
                    }
                }
            }
            if(options.length > this.optionLimit){
                options = options.slice(0, this.optionLimit)
            }
            return options
        }

        /*
        * alpha-beta剪枝算法
        * Max层和Min层分别对应对弈双方，Max层为己方，Min层为对方，算法的前提是双方都不会做出对自己不利的选择，即：
        * Max层总选收益最大的子节点收益作为自己收益，Min层总是选收益最小的子节点作为自己的收益

        * alpha剪枝：对于一个Min节点P，在遍历自己的子节点时，如果自己的第i个子节点的收益值 <= P的父节点的收益值，那么直接剪掉i后面的子节点，
        * 因为P已经可以确定自己的最终收益值 <= 父节点当前的收益了，而P的父节点为Max层，只选最大的，因此，P的父节点不可能选中自己作为它的最终收益，P后面的子节点也不必再计算了
        * beta剪枝：对于一个Max节点P，在遍历自己的子节点时，如果自己的第i个子节点的收益值 >= P的父节点的收益值，那么超前剪掉i后面的子节点。
        * 因为P已经可以确定自己的最终收益值 >= 父节点当前的收益了，而P的父节点为Min层，只选最小的，因此，P的父节点不可能选中自己作为它的最终收益，P后面的子节点也不必再计算了
        */        
        private negamax(deep):any{
            this.alphaCut = 0
            this.betaCut = 0
            this.total = 0

            var alpha = MIN
            var options = this.getOptions(this.color)
            // var str = ''
            // for(var i = 0; i < options.length; i++){
            //     str += '['+ options[i].row + ',' + options[i].col + '],'
            // }
            // console.log('options:' + str)

            if(options.length <= 0){
                console.log('ai failed put, options is empty')
                return null
            }
            var best:wzqPos[] = [options[0]]
            var selfWinPos:wzqPos = null
            var enemyWinPos:wzqPos = null
            this.optionCount = options.length
            this.optionIndex = 0
            for(var i = 0; i < options.length; i++){
                var p = options[i]
                if(p.getWei(this.color) >= Weight.CHENG_WU){
                    selfWinPos = p
                    break
                }else if(p.getWei(this.enemyColor) >= Weight.CHENG_WU){
                    enemyWinPos = p
                }else{
                    this.chessboard.put(p.row, p.col, this.color)
                    var val = this.min(deep - 1, alpha)
                    this.chessboard.rollback()
                    if(val > alpha){
                        alpha = val
                        best = [p]
                        this.optionIndex = i
                    }else if(val == alpha){
                        best.push(p)
                    }
                }                
            }
            if(selfWinPos){
                return {row:selfWinPos.row, col:selfWinPos.col}
            }else if(enemyWinPos){
                return {row:enemyWinPos.row, col:enemyWinPos.col}
            }else{
                var pos = best[Math.floor(best.length * Math.random())];
                return {row:pos.row, col:pos.col} 
            }
        }
        private min(deep, alpha):number{
            this.total++
            if(deep <= 0){
                return this.evaluate()
            }else{
                var beta = MAX
                var options = this.getOptions(this.enemyColor)
                for(var i = 0; i < options.length; i++){
                    var p = options[i]
                    this.chessboard.put(p.row, p.col, this.enemyColor)
                    var val
                    if(this.chessboard.getWinner() == this.enemyColor || this.chessboard.isDraw()){
                        val = MIN
                    }else{
                        val = this.max(deep - 1, beta) * 0.9
                    }             
                    this.chessboard.rollback()
                    if(val < beta){
                        beta = val
                    }
                    if(beta <= alpha){
                        this.alphaCut++
                        break //alpha剪枝
                    }       
                }
                return beta
            }
        }
        private max(deep, beta):number{
            this.total++
            if(deep <= 0){
                return this.evaluate()
            }else{
                var alpha = MIN
                var options = this.getOptions(this.color)
                for(var i = 0; i < options.length; i++){
                    var p = options[i]
                    this.chessboard.put(p.row, p.col, this.color)
                    var val
                    if(this.chessboard.getWinner() == this.color || this.chessboard.isDraw()){
                        val = MAX
                    }else{
                        val = this.min(deep - 1, alpha) * 0.9
                    }
                    this.chessboard.rollback()
                    if(val > alpha){
                        alpha = val
                    }
                    if(alpha >= beta){
                        this.betaCut++
                        break // beta剪枝
                    }
                }
                return alpha
            }
        }
    }
}