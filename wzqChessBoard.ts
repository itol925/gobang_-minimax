<<<<<<< HEAD:wzqChessBoard.ts
// --------------------------------------------------------------------
// -- 创建人:	panyinglong(503940285@qq.com)
// -- 日  期:	2018/01/31
// -- 描  述:	棋盘
// --------------------------------------------------------------------
namespace WZQ{
    /// 棋局    
    export class wzqChessBoard{
        private posChart:Array<Array<wzqPos>> = null   //存放棋子的二维数组
        
        private rowCount:number = 15    //最大行数
        private colCount:number = 15    //最大列数

        private posList = []

        public enableForb33:boolean = false
        public enableForb44:boolean = false

        constructor(rowCount:number, colCount:number){
            this.posChart = new Array<Array<wzqPos>>()
            this.rowCount = rowCount
            this.colCount = colCount
            
            this.reset()
        }

        // 当前步数
        public get stepIndex():number{
            return this.posList.length
        }
        public get RowCount():number { return this.rowCount }
        public get ColCount():number { return this.colCount }

        // 重置棋盘
        public reset(){
            for(var r = 0; r < this.rowCount; r++){
                this.posChart[r] = new Array<wzqPos>()
                for(var c = 0; c < this.colCount; c++){
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
            if(row >= this.rowCount || col >= this.colCount){
                return null;
            }
            if(this.posChart[row][col].color != wzqColor.none){
                console.log('try put invalide pos r:' + row + ' c:' + col + ' color:' + color)
                return null;
            }
            this.posChart[row][col].color = color
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
            for(var r = 0; r < this.colCount; r++){
                for(var c = 0; c < this.rowCount; c++){
                    var pos = this.posChart[r][c]
                    var bw = pos.getWei(wzqColor.black)
                    var ww = pos.getWei(wzqColor.white)
                    if(bw > 0 || ww > 0){
                        s += '[' + pos.row + ',' + pos.col + ']:{b:'+ bw + ' w:' + ww +'}\n'
                    }
                }
            } 
            console.log(s)
        }
        public updateWeight(pos:wzqPos):void{
            var lr = []
            var ud = []
            var ld_ru = []
            var lu_rd = []
            for(var i = -12; i < 12; i++){
                var p = this.getNeighbor(pos.row, pos.col, i, Line.L_R)
                if(p){
                    p.clearWei(Line.L_R)
                    lr.push(p)
                }
                p = this.getNeighbor(pos.row, pos.col, i, Line.U_D)
                if(p){
                    p.clearWei(Line.U_D)
                    ud.push(p)
                }
                p = this.getNeighbor(pos.row, pos.col, i, Line.LD_RU)
                if(p){
                    p.clearWei(Line.LD_RU)
                    ld_ru.push(p)
                }
                p = this.getNeighbor(pos.row, pos.col, i, Line.LU_RD)
                if(p){
                    p.clearWei(Line.LU_RD)
                    lu_rd.push(p)
                }
            }
            Evaluate.updateWeights(lr, Line.L_R)
            Evaluate.updateWeights(ud, Line.U_D)
            Evaluate.updateWeights(lu_rd, Line.LU_RD)
            Evaluate.updateWeights(ld_ru, Line.LD_RU)
        }
        
        public getNearbyColor(r:number, c:number, step:number, l:Line):wzqColor{
            var neighbor = this.getNeighbor(r, c, step, l)
            if(neighbor){
                return neighbor.color
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
            if(lr < 0 || lr >= this.colCount || lc < 0 || lc >= this.rowCount){
                return null
            }else{
                return this.posChart[lr][lc]
            }
        }

        public hasNeighborAtLine(r:number, c:number, line:Line):boolean{
            for(var i = -2; i <= 2; i++){
                if(i == 0){
                    continue
                }
                var color = this.getNearbyColor(r, c, i, line)
                if(color == wzqColor.black || color == wzqColor.white){
                    return true
                }
            }
            return false
        }

        public hasNeighbor(r:number, c:number):boolean{
            for(var i = -2; i <= 2; i++){
                if(i == 0){
                    continue
                }
                var color = this.getNearbyColor(r, c, i, Line.L_R)
                if(color == wzqColor.black || color == wzqColor.white){
                    return true
                }
                color = this.getNearbyColor(r, c, i, Line.U_D)
                if(color == wzqColor.black || color == wzqColor.white){
                    return true
                }
                color = this.getNearbyColor(r, c, i, Line.LD_RU)
                if(color == wzqColor.black || color == wzqColor.white){
                    return true
                }
                color = this.getNearbyColor(r, c, i, Line.LU_RD)
                if(color == wzqColor.black || color == wzqColor.white){
                    return true
                }                
            }
            return false
        }

        public getWinner():wzqColor{
            var lines = [Line.L_R, Line.U_D, Line.LU_RD, Line.LD_RU]
            for(var r = 0; r < this.colCount; r++){
                for(var c = 0; c < this.rowCount; c++){
                    var pos = this.posChart[r][c]
                    if(pos.color == wzqColor.black || pos.color == wzqColor.white){
                        for(var l = 0; l < lines.length; l++){
                            var count = 0
                            for(var i = 1; i <= 4; i++){
                                var nextColor = this.getNearbyColor(r, c, i, lines[l])
                                if(nextColor == pos.color){
                                    count++
                                }else{
                                    break
                                }
                            }
                            if(count == 4){
                                return pos.color
                            }
                        }
                    }
                }
            }
            return wzqColor.none
        }

        // 所有的空位都下满了，和棋
        public isDraw():boolean{
            return this.posList.length >= this.colCount * this.rowCount
        }
    }
=======
// --------------------------------------------------------------------
// -- 创建人:	panyinglong(503940285@qq.com)
// -- 日  期:	2018/01/31
// -- 描  述:	棋盘
// --------------------------------------------------------------------
namespace WZQ{
    /// 棋局    
    export class wzqChessBoard{
        private posChart:Array<Array<wzqPos>> = null   //存放棋子的二维数组
        
        private rowCount:number = 15    //最大行数
        private colCount:number = 15    //最大列数

        private posList = []

        public enableForb33:boolean = false
        public enableForb44:boolean = false

        constructor(rowCount:number, colCount:number){
            this.posChart = new Array<Array<wzqPos>>()
            this.rowCount = rowCount
            this.colCount = colCount
            
            this.reset()
        }

        // 当前步数
        public get stepIndex():number{
            return this.posList.length
        }
        public get RowCount():number { return this.rowCount }
        public get ColCount():number { return this.colCount }

        // 重置棋盘
        public reset(){
            for(var r = 0; r < this.colCount; r++){
                this.posChart[r] = new Array<wzqPos>()
                for(var c = 0; c < this.rowCount; c++){
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
            if(row >= this.rowCount || col >= this.colCount){
                return null;
            }
            if(this.posChart[row][col].color == wzqColor.forbidden){
                return null;
            }
            if(this.posChart[row][col].color != wzqColor.none){
                return null;
            }
            this.posChart[row][col].color = color
            this.posChart[row][col].clearWei()
            this.posList.push(this.posChart[row][col])
            this.updateWeight(this.posChart[row][col])
            return this.posChart[row][col];
        }
        public rollback():wzqPos{
            if(this.posList.length > 0){
                var pos = this.posList.pop()
                this.posChart[pos.row][pos.col].color = wzqColor.none
                this.posChart[pos.row][pos.col].clearWei()
                this.updateWeight(pos)
                return pos
            }
            return null
        }
        public printWeight(){
            var s = ''
            for(var r = 0; r < this.colCount; r++){
                for(var c = 0; c < this.rowCount; c++){
                    var pos = this.posChart[r][c]
                    var bw = pos.getWei(wzqColor.black)
                    var ww = pos.getWei(wzqColor.white)
                    if(bw > 0 || ww > 0){
                        s += '[' + pos.row + ',' + pos.col + ']:{b:'+ bw + ' w:' + ww +'}\n'
                    }
                }
            } 
            console.log(s)
        }
        public updateWeight(pos:wzqPos):void{
            var lr = []
            var ud = []
            var ld_ru = []
            var lu_rd = []
            for(var i = -12; i < 12; i++){
                var p = this.getNeighbor(pos.row, pos.col, i, Line.L_R)
                if(p){
                    p.clearWei(Line.L_R)
                    lr.push(p)
                }
                p = this.getNeighbor(pos.row, pos.col, i, Line.U_D)
                if(p){
                    p.clearWei(Line.U_D)
                    ud.push(p)
                }
                p = this.getNeighbor(pos.row, pos.col, i, Line.LD_RU)
                if(p){
                    p.clearWei(Line.LD_RU)
                    ld_ru.push(p)
                }
                p = this.getNeighbor(pos.row, pos.col, i, Line.LU_RD)
                if(p){
                    p.clearWei(Line.LU_RD)
                    lu_rd.push(p)
                }
            }
            Evaluate.updateWeights(lr, Line.L_R)
            Evaluate.updateWeights(ud, Line.U_D)
            Evaluate.updateWeights(lu_rd, Line.LU_RD)
            Evaluate.updateWeights(ld_ru, Line.LD_RU)
            if(this.enableForb33 || this.enableForb44){
                var last = this.LastPos
                if(last){
                    if(last.color == wzqColor.white){
                        this.addForbidden()
                    }else{
                        this.removeForbidden()
                    }
                }
            }
        }
        private addForbidden(){
            for(var r = 0; r < this.colCount; r++){
                for(var c = 0; c < this.rowCount; c++){
                    var pos = this.posChart[r][c]
                    if(this.enableForb33){
                        if(pos.isForb33()){
                            pos.color = wzqColor.forbidden
                        }
                    }else if(this.enableForb44){
                        if(pos.isForb44()){
                            pos.color = wzqColor.forbidden
                        }
                    }
                }
            } 
        }
        private removeForbidden(){
            for(var r = 0; r < this.colCount; r++){
                for(var c = 0; c < this.rowCount; c++){
                    var pos = this.posChart[r][c]
                    if(pos.color == wzqColor.forbidden){
                        pos.color = wzqColor.none
                    }
                }
            } 
        }
        
        public getNearbyColor(r:number, c:number, step:number, l:Line):wzqColor{
            var neighbor = this.getNeighbor(r, c, step, l)
            if(neighbor){
                return neighbor.color
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
            if(lr < 0 || lr >= this.colCount || lc < 0 || lc >= this.rowCount){
                return null
            }else{
                return this.posChart[lr][lc]
            }
        }

        public hasNeighborAtLine(r:number, c:number, line:Line):boolean{
            for(var i = -2; i <= 2; i++){
                if(i == 0){
                    continue
                }
                var color = this.getNearbyColor(r, c, i, line)
                if(color == wzqColor.black || color == wzqColor.white){
                    return true
                }
            }
            return false
        }

        public hasNeighbor(r:number, c:number):boolean{
            for(var i = -2; i <= 2; i++){
                if(i == 0){
                    continue
                }
                var color = this.getNearbyColor(r, c, i, Line.L_R)
                if(color == wzqColor.black || color == wzqColor.white){
                    return true
                }
                color = this.getNearbyColor(r, c, i, Line.U_D)
                if(color == wzqColor.black || color == wzqColor.white){
                    return true
                }
                color = this.getNearbyColor(r, c, i, Line.LD_RU)
                if(color == wzqColor.black || color == wzqColor.white){
                    return true
                }
                color = this.getNearbyColor(r, c, i, Line.LU_RD)
                if(color == wzqColor.black || color == wzqColor.white){
                    return true
                }                
            }
            return false
        }

        public getWinner():wzqColor{
            var lines = [Line.L_R, Line.U_D, Line.LU_RD, Line.LD_RU]
            for(var r = 0; r < this.colCount; r++){
                for(var c = 0; c < this.rowCount; c++){
                    var pos = this.posChart[r][c]
                    if(pos.color == wzqColor.black || pos.color == wzqColor.white){
                        for(var l = 0; l < lines.length; l++){
                            var count = 0
                            for(var i = 1; i <= 4; i++){
                                var nextColor = this.getNearbyColor(r, c, i, lines[l])
                                if(nextColor == pos.color){
                                    count++
                                }else{
                                    break
                                }
                            }
                            if(count == 4){
                                return pos.color
                            }
                        }
                    }
                }
            }
            return wzqColor.none
        }

        // 所有的空位都下满了，和棋
        public isDraw():boolean{
            return this.posList.length >= this.colCount * this.rowCount
        }
    }
>>>>>>> 518613089f881615be72b343a59276e4b38f64dc:wzq/Logic/wzqChessBoard.ts
}