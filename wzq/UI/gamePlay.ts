
namespace WZQ{
    export class gamePlay extends ui.gamePlayUI{    
        private chessboardUI:WZQ.wzqChessBoardUI
        private chessboard:WZQ.wzqChessBoard

        private playerColor:wzqColor
        private aiColor:wzqColor
        private lock:boolean = true
        private AI:wzqAI

        private isPlaying = false
        constructor(){
            super()
        }

        public start(){       
            this.AI.Difficult = this.radioDifficulty.selectedIndex + 1
            this.playerColor = WZQ.wzqColor.white
            if(this.radioColor.selectedIndex == 0){
                this.playerColor = WZQ.wzqColor.black
            }
            this.aiColor = this.playerColor == wzqColor.black ? wzqColor.white : wzqColor.black
            this.lock = false
            this.chessboard.reset()
            this.chessboardUI.reset()
            this.chessboard.enableForb33 = this.cbFb33.selected
            this.chessboard.enableForb44 = this.cbFb44.selected
            if(this.aiColor == wzqColor.black){
                this.aiMove()
            }

            this.radioColor.disabled = true
            this.radioDifficulty.disabled = true
            this.cbFb33.disabled = true
            this.cbFb44.disabled = true
            this.btnStart.label = "结束游戏"
            this.lblMsg.text = '战斗中..'
            this.isPlaying = true
        }
        public stop(){
            this.timer.clearAll(this)
            this.lock = true
            this.chessboard.reset()
            this.chessboardUI.reset()

            this.radioColor.disabled = false
            this.radioDifficulty.disabled = false
            this.cbFb33.disabled = false
            this.cbFb44.disabled = false
            this.btnStart.label = "开始游戏"
            this.lblMsg.text = '快点开始吧'
            this.isPlaying = false
        }
        // ai 落子
        public aiMove(){
            if(this.lock){
                console.log('ai move failed! chessboard is locked')
                return
            }
            // this.chessboard.printWeight()
            console.log('ai start move..')
            this.lblstate.text = '电脑落子..'
            this.lock = true
            var startTime = this.timer.currTimer
            this.timer.once(100, this, ()=>{
                var pos = this.AI.put(this.aiColor)
                if(pos){
                    if(this.chessboard.put(pos.row, pos.col, this.aiColor)){
                        this.chessboardUI.updateUI()
                    }else{
                        console.log('chessboard failed put')
                    }
                }else{
                    console.log("ai落子失败")
                    return
                }
                this.lock = false
                this.lblstate.text = '玩家落子..'
                
                if(this.chessboard.getWinner() == this.aiColor){                    
                    this.lblMsg.text = '电脑赢了'
                    this.lock = true
                    this.lblstate.text = ''
                }else if(this.chessboard.isDraw()){                 
                    this.lblMsg.text = '和棋'
                    this.lock = true
                    this.lblstate.text = ''
                }
                var costTime = this.timer.currTimer - startTime
                console.log('ai move finished! deep:' + this.AI.SearchDeep + ' total:' + this.AI.Total + " alphaCut:" + this.AI.AlphaCut + " betaCut:" + this.AI.BetaCut + 
                    " costTime:" + costTime + " nodeTime:" + (costTime/this.AI.Total).toFixed(4) + " optionIndex:" + this.AI.OptionIndex + " optionCount:" + this.AI.OptionCount)  
            })
        }
        //
        public playerMove(x:number, y:number, color?:wzqColor):boolean{
            if(this.lock){
                console.log('chessboard is locked')
                return false
            }
            var pos = this.chessboardUI.getPos(x, y)
            if(pos == null){
                console.log('无效的位置')
                return false
            }
            var putColor = color ? color : this.playerColor
            if(!this.chessboard.put(pos.row, pos.col, putColor)){
                console.log("玩家落子失败 row=" + pos.row + " col=" + pos.col)
                return false
            }
            this.chessboardUI.updateUI()
            if(this.chessboard.getWinner() == putColor){
                this.lblMsg.text = '玩家赢了'
                this.lock = true
                this.lblstate.text = ''
            }else if(this.chessboard.isDraw()){
                this.lblMsg.text = '和棋'
                this.lock = true
                this.lblstate.text = ''
            }
            return true
        }
        //
        public playerMoveAndThanAIMove(x:number, y:number){
            if(this.playerMove(x, y)){
                this.aiMove()
            }
        }

        // ui
        public createChildren():void{
            super.createChildren()

            this.radioColor.selectedIndex = 0
            this.radioDifficulty.selectedIndex = 3

            this.chessboard = new WZQ.wzqChessBoard(15, 15)
            this.chessboardUI = new WZQ.wzqChessBoardUI(this.chessboard, this.panelCb)
            
            this.AI = new wzqAI(this.chessboard)
            this.timer = new laya.utils.Timer()

            this.panelCb.on(laya.events.Event.CLICK, this, this.onPlayerClick)
            this.btnStart.on(laya.events.Event.CLICK, this, this.onStartClick)
            this.btnRollback.on(laya.events.Event.CLICK, this, this.onRollbackClick)
            
            this.testPanel.visible = false
        }

        private onPlayerClick(){
            if(this.cbxWeight.selected){
                var pos = this.chessboardUI.getPos(this.panelCb.mouseX, this.panelCb.mouseY)
                if(pos){
                    this.lblstate.text = this.chessboard.PosChart[pos.row][pos.col].printWeight()
                }
            }else{
                if(this.cbxAlone.selected){
                    var curColor = this.radioTestColor.selectedIndex == 0 ? wzqColor.black : wzqColor.white
                    this.playerMove(this.panelCb.mouseX, this.panelCb.mouseY, curColor)
                }else{
                    this.playerMoveAndThanAIMove(this.panelCb.mouseX, this.panelCb.mouseY)
                }
            }
        }
        private onRollbackClick(){
            var pos = this.chessboard.rollback()
            if(pos){
                this.chessboardUI.updateUI()
            }
        }
        private onStartClick(){
            if(this.isPlaying){
                this.stop()
            }else{
                this.start()
            }
        }
    }
}
