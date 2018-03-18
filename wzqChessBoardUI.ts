// ui

namespace WZQ{
    export class wzqChessBoardUI {
        // 格子间距离
        private gridWidth:number = 50
        private chessboard:wzqChessBoard

        private startX:number = 20
        private startY:number = 20

        private lineShape:laya.display.Sprite

        private freshPoint:laya.display.Sprite
        private freshPointRadius:number = 10

        private chesses:Array<Array<laya.display.Sprite>>
        private panel:Laya.Panel
        
        constructor(chessboard:wzqChessBoard, panel:Laya.Panel){
            this.chessboard = chessboard
            this.panel = panel

            this.lineShape = new laya.display.Sprite()
            this.panel.addChild(this.lineShape)
            this.drawChessboardLines()

            this.freshPoint = new laya.display.Sprite()
            this.panel.addChild(this.freshPoint)
            this.freshPoint.graphics.drawCircle(0, 0, this.freshPointRadius, '#ff0000')
            this.freshPoint.visible = false

            this.chesses = new Array<Array<laya.display.Sprite>>()
            for(var r = 0; r < this.chessboard.RowCount; r++){
                this.chesses[r] = new Array<laya.display.Sprite>()
                for(var c = 0; c < this.chessboard.ColCount; c++){
                    this.chesses[r].push(null)
                }
            } 
        }

        public reset(){
            this.freshPoint.visible = false
            for(var r = 0; r < this.chessboard.RowCount; r++){
                for(var c = 0; c < this.chessboard.ColCount; c++){
                    this.remove(r, c)
                }
            } 
        }

        private addMark(x, y, number){
            var label = new Laya.Label()
            this.panel.addChild(label)
            label.width = this.gridWidth;
            label.x = x;
            label.y = y;
            label.color = '#000000'
            label.fontSize = 15
            label.text = number
        }
        private drawChessboardLines(){
            for(var r = 0; r < this.chessboard.RowCount; r++){
                var fromX = this.startX
                var fromY = this.startY + r * this.gridWidth
                var toX = this.startX + (this.chessboard.ColCount - 1) * this.gridWidth
                var toY = this.startY + r * this.gridWidth
                this.lineShape.graphics.drawLine(fromX, fromY, toX, toY, '#000000', 1)
                this.addMark(fromX - 22, fromY - 10, r)
            }
            

            for(var c = 0; c < this.chessboard.ColCount; c++){
                var fromX = this.startX + c * this.gridWidth
                var fromY = this.startY
                var toX = this.startX + c * this.gridWidth
                var toY = this.startY + (this.chessboard.RowCount - 1) * this.gridWidth
                this.lineShape.graphics.drawLine(fromX, fromY, toX, toY, '#000000', 1)
                this.addMark(fromX - 10, fromY - 22, c)
            }
        }
        
        private add(r:number, c:number, color:wzqColor){
            var res = ""
            if(color == wzqColor.black){
                res = "game/black16.png"
            }else if(color == wzqColor.white){
                res = "game/white16.png"
            }else if(color = wzqColor.forbidden){
                res = "game/forb16.png"
            }
            if(res != ""){
                var chessWidth = this.gridWidth * 0.8
                var cui = new laya.display.Sprite()
                cui.loadImage(res)
                cui.pivotX = cui.width/2;
                cui.pivotY = cui.height/2;
                this.panel.addChild(cui)
                cui.scaleX = chessWidth/cui.width
                cui.scaleY = chessWidth/cui.height
                cui.x = this.startX + this.gridWidth * c;
                cui.y = this.startY + this.gridWidth * r;
                this.panel.addChild(cui)
                this.chesses[r][c] = cui             
            }
        }
        private setFreshPoint(row, col){
            this.freshPoint.x = this.startX + this.gridWidth * col
            this.freshPoint.y = this.startY + this.gridWidth * row
            this.freshPoint.visible = true
            this.freshPoint.zOrder = this.panel.numChildren + 1
        }
        
        private remove(r:number, c:number){
            if(this.chesses[r][c] != null){
                this.panel.removeChild(this.chesses[r][c])
                this.chesses[r][c] = null
            }
        }

        public updateUI(){
            var lastPos = this.chessboard.LastPos
            for(var r = 0; r < this.chessboard.RowCount; r++){
                for(var c = 0; c < this.chessboard.ColCount; c++){
                    var pos = this.chessboard.PosChart[r][c]
                    var color = pos.color                    
                    if(lastPos && lastPos.color == wzqColor.white && pos.isForb(this.chessboard.enableForb33, this.chessboard.enableForb44)){
                        color = wzqColor.forbidden
                    }
                    if(color == wzqColor.none){
                        this.remove(r, c)
                    }else{
                        if(this.chesses[r][c] == null){
                            this.add(pos.row, pos.col, color)
                        }
                    }
                }
            }
            if(lastPos){
                this.setFreshPoint(lastPos.row, lastPos.col)
            }else{
                this.freshPoint.visible = false
            }
        }

        public getPos(x:number, y:number){
            var c = Math.floor((x - this.startX + this.gridWidth/2)/this.gridWidth)
            var r = Math.floor((y - this.startY + this.gridWidth/2)/this.gridWidth)
            if(r < this.chessboard.RowCount && r >= 0 && c < this.chessboard.ColCount && c >= 0){
                return {row:r, col:c}
            }else{
                return null
            }            
        }
    }
}