// --------------------------------------------------------------------
// -- 创建人:	panyinglong(503940285@qq.com)
// -- 日  期:	2018/01/31
// -- 描  述:	控制器
// --------------------------------------------------------------------

namespace WZQ{
    export class wzqSingleController{
        private chessboardUI:WZQ.wzqChessBoardUI
        private chessboard:WZQ.wzqChessBoard

        private aiDeep = 2
        public playerColor:wzqColor
        private aiColor:wzqColor
        private lock:boolean = true
        private AI:wzqAI

        constructor(cb:wzqChessBoard, cbui:wzqChessBoardUI, playerColor:wzqColor){
            this.chessboard = cb
            this.chessboardUI = cbui
            this.playerColor = playerColor
            this.aiColor = playerColor == wzqColor.black ? wzqColor.white : wzqColor.black
            this.AI = new wzqAI(cb, this.aiColor)
        }

        public start(){
            this.lock = false
            this.chessboard.reset()
            this.chessboardUI.reset()
            if(this.aiColor == wzqColor.black){
                this.aiMove()
            }
        }
        public back():wzqPos{
            return this.chessboard.rollback()
        }

        // ai 落子
        public aiMove(){
            if(this.lock){
                console.log('ai move failed! chessboard is locked')
                return
            }
            // this.chessboard.printWeight()
            this.lock = true
            this.AI.put((pos)=>{
                if(pos){
                    if(this.chessboard.put(pos.row, pos.col, this.AI.Color)){
                        this.chessboardUI.add(pos.row, pos.col, this.AI.Color)
                    }else{
                        console.log('chessboard failed put')
                    }
                }else{
                    console.log("ai落子失败")
                    return
                }
                this.lock = false
                
                if(this.chessboard.getWinner() == this.aiColor){
                    UIManager.Instance.showNotice("电脑赢了")
                    this.lock = true
                }else if(this.chessboard.isDraw()){
                    UIManager.Instance.showNotice("和棋")
                    this.lock = true
                }
            }, this)            
        }
        //
        public playerAndAIMove(x:number, y:number){
            if(this.lock){
                console.log('chessboard is locked')
                return
            }

            var pos = this.chessboardUI.getPos(x, y)
            if(pos == null){
                console.log('无效的位置')
                return
            }
            if(this.chessboard.put(pos.row, pos.col, this.playerColor)){
                this.chessboardUI.add(pos.row, pos.col, this.playerColor)
                if(this.chessboard.getWinner() == this.playerColor){
                    UIManager.Instance.showNotice("玩家赢了")
                    this.lock = true
                }else if(this.chessboard.isDraw()){
                    UIManager.Instance.showNotice("和棋")
                    this.lock = true
                }else{
                    this.aiMove()                  
                }                
            }else{
                console.log("玩家落子失败 row=" + pos.row + " col=" + pos.col)
            }
        }

        public reset(){
            this.chessboard.reset()
            this.chessboardUI.reset()
        }
    }
}