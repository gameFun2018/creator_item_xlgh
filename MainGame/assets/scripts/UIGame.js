// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var UIType = require('UIType');
var SoundType = require('SoundType');

var Items = require('ItemManager');

//cc.log("Items", Items);

//游戏状态
var GameState = 
{
    //无效
    GS_Invalid: -1,
    //游戏准备，等待开始
    GS_Ready: 0,
    //暂停
    GS_Pause: 1,
    //游戏已开始，等待操作
    GS_WaitOP: 2, 
    //游戏，玩家驴跳跃中
    GS_PlayerJump: 3,
    //结束
    GS_Over: 4,
};

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },

        //开始按钮 
        StartBtn: 
        {
            default: null,  
            type: cc.Button,

        },
        //暂停按钮:
        PauseBtn:
        {
            default: null,  
            type: cc.Button,
        },
        //跳跃一次加分
        Score_OneJump:
        {
            default: 1,
            type: cc.Integer,
        },

        //提示信息Label
        TipInfoLabel: 
        {
            default: null,
            type: cc.Label,
        },

        //分数Label
        ScoreLabel:
        {
            default: null,
            type: cc.Label,
        },
        //金币Label:
        GoldLabel:
        {
            default: null,
            type: cc.Label,
        },

        //Block prefab
        BlockPrefab: cc.Prefab,
        //初始节点
        BlockInitNode: cc.Node,
        //Block的父节点
        BlockNode: cc.Node,
        //数据管理器节点
        DataMgrNode: cc.Node,
        //主角节点
        PlayerNode: cc.Node,
        //游戏开始的提示Sprite
        TipOpSprite: cc.Sprite,

        //block间隔
        BlockOffVec: cc.v2(80, 80),
        //数据管理器
        DataManager: cc.Node,
        //声音管理器
        SoundManager: cc.Node,
        //物品管理器
        ItemManager: Items.ItemManager,
        //Block池
        _BlockPool: cc.NodePool,
        //未使用的blocklist
        _BlockList: [],
        //已使用的blockList
        _BlockListUse: [],
        _BlockTopPos: cc.v2(0, 0),
        //当前
        _CurGameState: -1,
        //当前Block索引
        _CurBlockIndex: 0,
        //驴相对于UIGame节点的偏移
        _OffPlayerUIGame: cc.v2(0, 0),

    },

    // LIFE-CYCLE CALLBACKS:

     onLoad () 
     {
        this.DataManager = cc.find('DataManager');
        this.SoundManager = cc.find('SoundManager');
        this.ItemManager = cc.find('ItemManager').getComponent(Items.ItemManager);

        this._BlockPool = new cc.NodePool();  

        //预创建的Block
        for(var i = 0; i < 30; ++i)
        {
            var block = cc.instantiate(this.BlockPrefab);
            this.pushBlock(block);
        }

     },


    start () 
    {

        cc.director.setDisplayStats(false);
        if(window.wx != undefined)
        {
           wx.showShareMenu({withShareTicket: true});   

           var DataManager = this.DataManager.getComponent('DataManager');
           wx.onShareAppMessage(function()
           {
               return { 
                        title: DataManager.getShareTitle(),
                        imageUrl: DataManager.getShareImage(), 
                     };
           });
        }

        //播放背景音乐
        if(this.SoundManager)
        {
            this.SoundManager.getComponent('SoundManager').playSound(SoundType.SoundType_Bg);
        }

        //开始按钮 
       this.StartBtn.node.on(cc.Node.EventType.TOUCH_START, this.onStartBtnStart, this);
       this.StartBtn.node.on(cc.Node.EventType.TOUCH_END, this.onStartBtn, this);
       this.PauseBtn.node.on(cc.Node.EventType.TOUCH_END, this.onPauseBtn, this);

        this.node.on(cc.Node.EventType.TOUCH_START, this.onScreenTouch, this);
       //初始化场景
       var firstBlock = this.initSceneBlock();
       this._BlockTopPos = firstBlock.getChildByName('BlockTop').position;
       this.initPlayerPos(firstBlock);
       //坐标转换
       var playerWordPos = this.PlayerNode.parent.convertToWorldSpaceAR(this.PlayerNode.position);
       this._OffPlayerUIGame = this.node.convertToNodeSpaceAR(playerWordPos);
        //临时测试
       this.setGameState(GameState.GS_Ready);
       this._CurBlockIndex = 0;

       this.TipOpSprite.node.active = true;
    },

    //开始按钮 
    onStartBtn(event)
    {
        this.setGameState(GameState.GS_WaitOP); 

        if(window.wx != undefined)
        {
            wx.triggerGC()
        }
        
        this.TipOpSprite.node.active = false;

        event.stopPropagation();   
    },

    //暂停按钮 
    onPauseBtn()
    {
        this.setGameState(GameState.GS_Pause);

        event.stopPropagation();     
    },

    //屏幕点击
    onScreenTouch(event)
    {
        event.stopPropagation();

        // //临时测试代码：自动跳跃做测试用
        // var self = this;
        // if(event.getLocationX() < 100 && event.getLocationY() < 100 )
        // {
        //     var jumpCount = 0;
        //     this.callBack1 = function() {
        //         jumpCount++;
        //         //cc.log('auto jump ', jumpCount);
        //         var curBlock = self._BlockListUse[self._CurBlockIndex];
        //         var nextBlock = self._BlockListUse[self._CurBlockIndex + 1];
        //         var touchX = 360 + (nextBlock.x - curBlock.x)
        //         self.onGameTouch(touchX);
        //         if(jumpCount >= 100000)
        //         {
        //             this.unschedule(this.callBack1);
        //         }
        //     };
        //     this.schedule(this.callBack1, 0.2)
        //     return;
        // }

        this.onGameTouch(event.getLocationX());

    },

    onGameTouch(touchX)
    {
        //第一次点击,等同于点击游戏开始
        if(this._CurGameState == GameState.GS_Ready)
        {
            this.setGameState(GameState.GS_WaitOP);  

            if(window.wx != undefined)
            {
                wx.triggerGC()
            }
            
            this.TipOpSprite.node.active = false;  
        }

        if(this._CurGameState != GameState.GS_WaitOP  && this._CurGameState != GameState.GS_PlayerJump)
        {
            return;
        }
        //test 
        if(this._CurGameState == GameState.GS_PlayerJump)
        {
            this.onPlayerJumpEnd();
            if(this._CurGameState == GameState.GS_Over)
            {
                return;
            }
        }


        //cc.log("touch end", touchX, this.node.width);
        var touchPos = this.node.convertToNodeSpaceAR(cc.v2(touchX, 0));
        //cc.log("touch end pos ", touchPos.x, this.node.width);
        var moveDirX = 1;
        //？？这个坐标值需要再确认
        // if(touchX > 360)
        // {
        //     moveDirX = 1;
        // }else 
        // {
        //     moveDirX = -1;
        // }
        if(touchPos.x >= 0)
        {
            moveDirX = 1;
        }else 
        {
            moveDirX = -1;
        }

        //根据当前Block位置，获取跳跃目标位置
        if(this._CurBlockIndex < 0 || this._CurBlockIndex >= this._BlockListUse.length - 1)
        {
            console.log("onScreenTouch invalid _CurBlockIndex ", this._CurBlockIndex);
            return;
        }

        var nextBlock = this._BlockListUse[this._CurBlockIndex + 1];
        if(nextBlock == null)
        {
            console.log("onScreenTouch invalid nextBlock null", this._CurBlockIndex + 1);
            return;    
        }

        this.PlayerNode.stopAllActions();
        var playerDestPos = cc.pAdd(this._BlockTopPos, nextBlock.position);
        var offset = cc.pSub(playerDestPos, this.PlayerNode.position);
        //根据触摸的方向，设置玩家驴跳跃的方向 及 场景移动 
        var offVec = cc.v2(moveDirX *  Math.abs(offset.x), offset.y);
        this.PlayerNode.getComponent('Player').jump(0.15, offVec);
        this.PlayerNode.setTag(moveDirX);
        //场景移动 
        this.BlockNode.stopAllActions();

        var blockNodeDestPos = cc.pSub(this._OffPlayerUIGame, playerDestPos); 
        //offVec = cc.p(moveDirX * this.BlockOffVec.x, this.BlockOffVec.y);   
        //var blockMoveAct = cc.moveBy(0.02, cc.pMult(offVec, -1));
        offVec = cc.pSub(blockNodeDestPos, this.BlockNode.position); 
        //cc.log("blockNode: ", blockNodeDestPos, offVec);
        var blockMoveAct = cc.moveBy(0.15, offVec);
        this.BlockNode.runAction(blockMoveAct);
        
        //游戏状态
        this.setGameState(GameState.GS_PlayerJump);

        var soundMgr = this.SoundManager.getComponent('SoundManager');
        soundMgr.playSound(SoundType.SoundType_Jump);
 
    },

    //玩家驴跳跃结束的处理
    onPlayerJumpEnd()
    {
        if(this._CurGameState == GameState.GS_Over)
        {
            return;
        }

        //-------------跳跃完成后，在上面新添加一个Block-------------
        var len = this._BlockListUse.length;
        var nowPos = this._BlockListUse[len - 1].position;
       
        var curBlock = this.getBlock();
        curBlock.stopAllActions();
        curBlock.parent = this.BlockNode;
        curBlock.scaleY = 1;


        //随机一个物品
        var itemType = this.ItemManager.getRandomItemType();
        //cc.log("itemType", itemType);
        if(itemType != -1)
        {
            if(curBlock.childrenCount > 0)
            {
                var topNode = curBlock.children[0];
                if(topNode)
                {
                    var newItem = this.ItemManager.getItemByType(itemType);
                    newItem.parent = topNode;
                }
            }
        }

        //设置位置
        var dir = cc.randomMinus1To1();
        var dirX = (dir >= 0 ? 1 : -1); 
        var curOffPos = cc.v2(this.BlockOffVec.x * dirX, this.BlockOffVec.y);
        nowPos = cc.pAdd(nowPos, curOffPos);
        curBlock.position = nowPos;

        this._CurBlockIndex += 1;

        //判断跳跃位置是否正确
        if(this._CurBlockIndex < 1)
        {
            cc.log('onPlayerJumpEnd invalid _CurBlockIndex');
            return;
        }

        var moveDirX = this.PlayerNode.getTag();
        curBlock = this._BlockListUse[this._CurBlockIndex];
        var lastBlock = this._BlockListUse[this._CurBlockIndex - 1];

        //
        if( moveDirX > 0 && (curBlock.position.x > lastBlock.position.x) 
            || moveDirX < 0 && (curBlock.position.x < lastBlock.position.x) )
        {
            //跳跃方向正确
            //cc.log("right ");
            this.setGameState(GameState.GS_WaitOP);
            //分数更新
            var DataManager = this.DataManager.getComponent('DataManager');
            
            var itemType = -1;
            if(curBlock.childrenCount > 0)
            {
                var blockTopNode = curBlock.children[0];
                if(blockTopNode.childrenCount > 0)
                {
                    itemType = blockTopNode.children[0].getTag();
                }
            }
            var addScore = 0;
            var addGold = 0;
            switch(itemType)
            {
                case Items.ItemType.IT_None:
                {
                    addScore = this.Score_OneJump;
                }
                break;
                case Items.ItemType.IT_Grass:
                {
                    addScore = 5;
                }
                break;
                case Items.ItemType.IT_Corn:
                {
                    addScore = 20;
                }
                break;
                case Items.ItemType.IT_Radish:
                {
                    addScore = 10;
                }
                break;
                case Items.ItemType.IT_Coin:
                {
                    addGold = 1;
                }
                break;
            };
            if(addScore > this.Score_OneJump)
            {
                this.TipInfoLabel.string = '+ ' + addScore.toString();
                this.TipInfoLabel.node.stopAllActions();
                this.TipInfoLabel.node.color.setA(0);
                var fadeIn = cc.fadeIn(0.1);
                var delay = cc.delayTime(1.5);
                var callFun = cc.callFunc(this.onHideTip, this);
                this.TipInfoLabel.node.runAction(cc.sequence(fadeIn, delay, callFun));
            }
            if(addGold > 0)
            {
                var soundMgr = this.SoundManager.getComponent('SoundManager');
                soundMgr.playSound(SoundType.SoundType_GetGold);
            }
           
            DataManager.setCurScore(DataManager.getCurScore() + addScore); 
            DataManager.setCurGold(DataManager.getCurGold() + addGold);


            this.updateUIData();
        }
        else
        {
            //cc.log("wrong ");
            //跳跃方向错误
            this.setGameState(GameState.GS_Over);
        }

        //将Block下物品还原到物品池
        this.restoreItemToPool(curBlock);

        //如果当前跳跃数 > 5,开始删除最前面的use Block 
        if(this._CurBlockIndex > 5)
        {
            this.delelteUseBlock();
        }

    },

    //隐藏提示信息
    onHideTip()
    {
        this.TipInfoLabel.string = "";      
    },

    //Block下移的处理
    onBlockDownFinish(data)
    {
        //cc.log("onBlockDownFinish", data);
        if(this._CurBlockIndex >= 0 && this._CurBlockIndex < this._BlockListUse.length)
        {   
            if(this._BlockListUse[this._CurBlockIndex] === data)
            {
                if(this._CurGameState == GameState.GS_WaitOP)
                {
                    this.setGameState(GameState.GS_Over);
                }
            }
        }
    },

    //初始化场景Block
    initSceneBlock()
    {
       var posWorld = this.BlockInitNode.parent.convertToWorldSpaceAR(this.BlockInitNode.position);
       var initPos = this.BlockNode.convertToNodeSpaceAR(posWorld);
       
       var nowPos = initPos;
       var firstBlock;
       for(let i = 0; i < 30; ++i)
       {
           var curBlock = this.getBlock();
           //挂接到BlockNode上
           curBlock.stopAllActions();
           curBlock.parent = this.BlockNode;
           curBlock.scaleY = 1;

            //随机一个物品
            var itemType = this.ItemManager.getRandomItemType();
            //cc.log("itemType", itemType);
            if(itemType != -1 && i != 0)
            {
                if(curBlock.childrenCount > 0)
                {
                    var topNode = curBlock.children[0];
                    if(topNode)
                    {
                        var newItem = this.ItemManager.getItemByType(itemType);
                        newItem.parent = topNode;
                    }
                }
            }

           if(i == 0)
           {
              curBlock.position = nowPos;
              firstBlock = curBlock;              
           }
           else
           {
             var dir = cc.randomMinus1To1();
             var dirX = (dir >= 0 ? 1 : -1); 
             var curOffPos = cc.v2(this.BlockOffVec.x * dirX, this.BlockOffVec.y);
             nowPos = cc.pAdd(nowPos, curOffPos);
             curBlock.position = nowPos;
             curBlock.setLocalZOrder(-nowPos.y);
           }
       }
       return firstBlock;
    },

    //初始化玩家位置：小驴位置
    initPlayerPos(firstBlock)
    {
        this.PlayerNode.position =  cc.pAdd(firstBlock.position, this._BlockTopPos);
        this.PlayerNode.setLocalZOrder(100000);
    },

    //------------------------Block操作 begin--------------------------
    //获取Block
    getBlock()
    {
        if(this._BlockList.length > 0)
        {
            var block = this._BlockList.pop();

            this._BlockListUse.push(block);
           return block;   
        }
        else
        {
            var block = cc.instantiate(this.BlockPrefab);
            this.pushBlock(block);

            return this.getBlock();   
        }
    },

    //添加Block
    pushBlock(block)
    {
       // this._BlockPool.put(block);
        this._BlockList.push(block);
    },

    //移除Block(移除一个最下面的，屏幕外的Block) 还原到池里
    delelteUseBlock()
    {
       var firstBlock = this._BlockListUse.shift(); 
       firstBlock.parent = null;
       firstBlock.scaleY = 1;
        
       //将Block下物品还原到物品池
       this.restoreItemToPool(firstBlock);

       this._BlockList.push(firstBlock);
       this._CurBlockIndex -= 1;         

    },

    //还原Block下物品到物品池
    restoreItemToPool(firstBlock)
    {
        if(firstBlock.childrenCount > 0)
        {
             var blockTopNode = firstBlock.children[0];
             if(blockTopNode.childrenCount > 0)
             {
                 var itemNode = blockTopNode.children[0];
                 this.ItemManager.putItemToPool(itemNode);
             } 
        }
    },
    //------------------------Block操作 end--------------------------
    //更新界面中的数据（分数 + 金币）
    updateUIData()
    {
        var DataManager = this.DataManager.getComponent('DataManager');
        this.ScoreLabel.string = DataManager.getCurScore();   
        this.GoldLabel.string = DataManager.getCurGold();

    },

    //游戏状态的处理
    setGameState(state)
    {
        //处理暂停逻辑
        if(this._CurGameState == GameState.GS_Pause && state !=  this._CurGameState)
        {
            cc.director.resume();    
        }

        //新状态的处理
        this._CurGameState = state;   
        //准备状态
        if(this._CurGameState == GameState.GS_Ready)
        {
            this.StartBtn.node.active = true;
            this.PauseBtn.node.active = false;
        }
        //暂停
        else if(this._CurGameState == GameState.GS_Pause)
        {
            cc.director.pause();

            //按钮显示与隐藏
            this.StartBtn.node.active = true;
            this.PauseBtn.node.active = false;
        }
        //等待游戏中的操作
        else if(this._CurGameState == GameState.GS_WaitOP)
        {
            this.StartBtn.node.active = false;
            this.PauseBtn.node.active = true;

            //对当前Block进行下移操作
            if(this._CurBlockIndex < 0 || this._CurBlockIndex >= this._BlockListUse.length)
            {
                cc.log("GS_WaitOP invalid _CurBlockIndex ", this._CurBlockIndex);
                return;
            }

            var curBlock = this._BlockListUse[this._CurBlockIndex];
            if(curBlock == null)
            {
                cc.log("GS_WaitOP invalid curBlock null", this._CurBlockIndex);
                return;    
            }
            //block下移
            var downAct = curBlock.getActionByTag(0);
            if(downAct == null)
            {
                var downActScale = cc.scaleTo(1.5, 1, 0);
                var callFunc = cc.callFunc(this.onBlockDownFinish, this, curBlock); 
                downAct = cc.sequence(downActScale, callFunc);
                curBlock.runAction(downAct);
            }
        }
        //游戏结束
        else if(this._CurGameState == GameState.GS_Over)
        {
            //按钮显示与隐藏
            this.StartBtn.node.active = false;
            this.PauseBtn.node.active = false;

            var UIManager = this.node.parent.getComponent('UIManager');
            UIManager.openUI(UIType.UIType_GameOver);

            //向子域发送，上传数据
            var DataManager = this.DataManager.getComponent('DataManager');
            if(window.wx != undefined)
            {
                window.wx.postMessage(
                    {
                        msgType: 1, 
                        bestScore: DataManager.getCurScore(),
                    }
                );
            }

            //播放背景音乐
            if(this.SoundManager)
            {
                var soundMgr = this.SoundManager.getComponent('SoundManager');
                soundMgr.stopSound(SoundType.SoundType_Bg);
                soundMgr.playSound(SoundType.SoundType_Fall);

            }

        }

    },

    //重置(notResetData 重置数据)
    reset(resetData)
    {

        var DataManager = this.DataManager.getComponent('DataManager'); 
        if(resetData)
        {
            DataManager.setCurScore(0);  
            DataManager.setCurGold(0);
        }
        
        this.updateUIData();

        //将当前Use列表转移到空闲列表
        for(var i = 0; i < this._BlockListUse.length; ++i)
        {
            var block = this._BlockListUse[i];
            this.restoreItemToPool(block);
            this._BlockList.push(block); 
        }
        this._BlockListUse.splice(0, this._BlockListUse.length);
        this._CurBlockIndex = 0;
        //从场景移除Blocks
        this.BlockNode.removeAllChildren();
        //重构场景
        this.PlayerNode.parent = this.BlockNode;

        var firstBlock = this.initSceneBlock();
        this._BlockTopPos = firstBlock.getChildByName('BlockTop').position;
        this.initPlayerPos(firstBlock);
        //游戏状态
        this.setGameState(GameState.GS_Ready);

        //
        this.TipOpSprite.node.active = true;
        
        //播放背景音乐
        if(this.SoundManager)
        {
            this.SoundManager.getComponent('SoundManager').playSound(SoundType.SoundType_Bg);
        }

    },
    //更新
    update (dt) 
    {
        if(this._CurGameState == GameState.GS_WaitOP)
        {
            //更新玩家驴的位置
             if(this._CurBlockIndex < 0 || this._CurBlockIndex >= this._BlockListUse.length)
             {
                 return;
             }
 
             var curBlock = this._BlockListUse[this._CurBlockIndex];
             if(curBlock == null)
             {
                 return;    
             }

             //block下移
             //var blockTopPos = cc.pAdd(curBlock.position , cc.p(0, this._BlockTopPos.y * curBlock.scaleY));
             //this.PlayerNode.position = blockTopPos;

             this.PlayerNode.y = curBlock.y + (this._BlockTopPos.y * curBlock.scaleY);
        }
    },

});
