// --------------------------------------------------------------------
// -- 创建人:	panyinglong(503940285@qq.com)
// -- 日  期:	2018/01/31
// -- 描  述:	棋盘
// --------------------------------------------------------------------
namespace WZQ{
    /// 棋局    
    export class wzqChessBoard{
        private posChart:Array<Array<wzqPos>> = null   //存放棋子的二维数组
        
        private size:number = 15

        private posList = []

        public enableForb33:boolean = false
        public enableForb44:boolean = false

        constructor(s:number){
            this.posChart = new Array<Array<wzqPos>>()
            this.size = s
            
            this.reset()
        }

        // 当前步数
        public get stepIndex():number{
            return this.posList.length
        }
        public get Size():number { return this.size }

        public get Steps():any{
            var b = 0
            var w = 0
            for(var i = 0; i < this.posList.length; i++){
                if(this.posList[i].color == wzqColor.black){
                    b++
                }else if(this.posList[i].color == wzqColor.white){
                    w++
                }
            }
            return {
                black:b,
                white:w
            }
        }
        // 重置棋盘
        public reset(){
            for(var r = 0; r < this.size; r++){
                this.posChart[r] = new Array<wzqPos>()
                for(var c = 0; c < this.size; c++){
                    this.posChart[r].push(new wzqPos(r, c))
                }
            } 
            this.posList = []
        }

        public get LastPos():wzqPos{
            if(this.posList.length > 0){
                return this.posList[this.posList.length - 1]
            }
            return null
        }

        // 获取棋局
        public get PosChart():wzqPos[][]{
            return this.posChart
        }
        // 落子
        public put(row:number, col:number, color:wzqColor):wzqPos {
            if(row >= this.size || col >= this.size){
                return null;
            }
            if(this.posChart[row][col].Color != wzqColor.none){
                console.log('try put invalide pos r:' + row + ' c:' + col + ' color:' + color)
                return null;
            }
            this.posChart[row][col].Color = color
            this.posChart[row][col].clearWei()
            this.posList.push(this.posChart[row][col])
            this.updateWeight(this.posChart[row][col])
            return this.posChart[row][col];
        }
        public rollback():wzqPos{
            if(this.posList.length > 0){
                var pos = this.posList.pop()                
                pos.color = wzqColor.none
                pos.clearWei()
                this.updateWeight(pos)
                return pos
            }
            return null
        }
        public printWeight(){
            var s = ''
            for(var r = 0; r < this.size; r++){
                for(var c = 0; c < this.size; c++){
                    var pos = this.posChart[r][c]
                    var bw = pos.getWei(wzqColor.black)
                    var ww = pos.getWei(wzqColor.white)
                    if(bw > 0 || ww > 0){
                        s += '[' + pos.Row + ',' + pos.Col + ']:{b:'+ bw + ' w:' + ww +'}\n'
                    }
                }
            } 
            console.log(s)
        }
        public updateWeight(pos:wzqPos):void{
            var row = pos.Row
            var col = pos.Col
            
            var lr = []       
            var ud = []
            for(var i = 0; i < this.size; i++){
                var p = this.posChart[row][i]
                p.clearWei(Line.L_R)
                lr.push(p)

                p = this.posChart[i][col]
                p.clearWei(Line.U_D)
                ud.push(p)
            }
            
            var lu_rd = []
            var delta = row < col ? row : col
            var startRow = row - delta
            var startCol = col - delta
            for(var r = startRow, c = startCol; r < this.size && c < this.size; r++, c++){
                var p = this.posChart[r][c]
                p.clearWei(Line.LU_RD)
                lu_rd.push(p)
            }

            var ld_ru = []
            delta = (this.size - 1 - row) < col ? (this.size - 1 - row) : col
            startRow = row + delta
            startCol = col - delta
            for(var r = startRow, c = startCol; r >= 0 && c < this.size; r--, c++){
                var p = this.posChart[r][c]
                p.clearWei(Line.LD_RU)
                ld_ru.push(p)
            }

            Evaluate.updateWeights(lr, Line.L_R)
            Evaluate.updateWeights(ud, Line.U_D)
            Evaluate.updateWeights(lu_rd, Line.LU_RD)
            Evaluate.updateWeights(ld_ru, Line.LD_RU)
        }
        
        public getNearbyColor(r:number, c:number, step:number, l:Line):wzqColor{
            var neighbor = this.getNeighbor(r, c, step, l)
            if(neighbor){
                return neighbor.Color
            }
            return wzqColor.forbidden
        }

        public getNeighbor(r:number, c:number, step:number, l:Line):wzqPos{
            var lr = r
            var lc = c
            switch(l){
                case Line.L_R:
                    lc = c + step
                    break
                case Line.U_D:
                    lr = r + step
                    break
                case Line.LU_RD: // 左上->右下
                    lr = r + step
                    lc = c + step
                    break
                case Line.LD_RU: // 左下->右上
                    lr = r - step
                    lc = c + step
                    break
                default:
                    console.error("error Line option l=" + l)
                    break
            }
            if(lr < 0 || lr >= this.size || lc < 0 || lc >= this.size){
                return null
            }else{
                return this.posChart[lr][lc]
            }
        }

        public getWinner():wzqColor{
            var lines = [Line.L_R, Line.U_D, Line.LU_RD, Line.LD_RU]
            for(var r = 0; r < this.size; r++){
                for(var c = 0; c < this.size; c++){
                    var pos = this.posChart[r][c]
                    if(pos.Color == wzqColor.black || pos.Color == wzqColor.white){
                        for(var l = 0; l < lines.length; l++){
                            var count = 0
                            for(var i = 1; i <= 4; i++){
                                var nextColor = this.getNearbyColor(r, c, i, lines[l])
                                if(nextColor == pos.Color){
                                    count++
                                }else{
                                    break
                                }
                            }
                            if(count == 4){
                                return pos.Color
                            }
                        }
                    }
                }
            }
            return wzqColor.none
        }

        // 所有的空位都下满了，和棋
        public isDraw():boolean{
            return this.posList.length >= this.size * this.size
        }
    }
}