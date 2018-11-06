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
        //复活按钮 
        RelifeBtn:
        {
            default: null,
            type: cc.Button,
        },
        //跳过按钮：
        OkBtn:
        {
            default: null,
            type: cc.Button,
        },
        //转发复活
        ShareRelifeBtn:
        {
            default: null,
            type: cc.Button,   
        },
        //金币不足Label
        GoldNotLabel:
        {
            default: null,
            type: cc.Label,   
        },
        //
        _DataManager: cc.Node,

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad ()
    {
        this._DataManager = cc.find('DataManager');
    },

    start () 
    {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onUIClick, this);
        this.RelifeBtn.node.on(cc.Node.EventType.TOUCH_END, this.onRelifeBtn, this);
        this.OkBtn.node.on(cc.Node.EventType.TOUCH_END, this.onOkBtn, this);
        this.ShareRelifeBtn.node.on(cc.Node.EventType.TOUCH_END, this.onShareRelifeBtn, this);
    },

    onEnable()
    {
        var DataManager = this._DataManager.getComponent('DataManager');
        this.ScoreLabel.string = DataManager.getCurScore().toString();
        this.GoldLabel.string = DataManager.getCurGold().toString();

        this.GoldNotLabel.node.active = false;

        if(this.ShareRelifeBtn)
        {
            if(DataManager.getShareReliveCount() <= 0)
            {
                this.ShareRelifeBtn.node.active = DataManager.getShareRelive(); 
            }else
            {
                this.ShareRelifeBtn.node.active = false;    
            }
        }
    },

    onDisable()
    {
        
    },

    //整个UI 点击
    onUIClick(event)
    {

        event.stopPropagation();
    },

    //复活按钮 
    onRelifeBtn(event)
    {
        var DataManager = this._DataManager.getComponent('DataManager');
        var curGold = DataManager.getCurGold();
        if(curGold < 20)
        {
            this.GoldNotLabel.node.active = true;
            return;
        }
        DataManager.setCurGold(curGold - 20);
        var UIManager = this.node.parent.getComponent('UIManager');
        UIManager.closeUI(UIType.UIType_GameOver);
        var gameUI = UIManager.getUI(UIType.UIType_Game);
        gameUI.reset(false);

        event.stopPropagation();
    },

    //跳过
    onOkBtn(event)
    {
        var UIManager = this.node.parent.getComponent('UIManager');
        UIManager.closeUI(UIType.UIType_GameOver);

        UIManager.openUI(UIType.UIType_Rank);

        event.stopPropagation();
    },

    //微信分享复活
    onShareRelifeBtn(event)
    {
        var self = this;
        var DataManager = this._DataManager.getComponent('DataManager');
        if(window.wx != undefined)
        {
            wx.shareAppMessage(
                {
                    title: DataManager.getShareTitle(),
                    imageUrl: DataManager.getShareImage(),   
                    
                    success: (res) => {
                        console.log('shareAppMessage success');
                        
                        wx.showToast({
                            title: '复活成功',  
                            icon: 'success',  
                            duration: 1500, 
                          })
                        
                          DataManager.setShareReliveCount(DataManager.getShareReliveCount() + 1); 

                        var UIManager = self.node.parent.getComponent('UIManager');
                        UIManager.closeUI(UIType.UIType_GameOver);
                        var gameUI = UIManager.getUI(UIType.UIType_Game);
                        gameUI.reset(false);

                    },
                    fail:(res)=>
                    {
                        console.log("shareAppMessage fail");      
                    }, 
                }
            );
        }

        event.stopPropagation();
    },

    // update (dt) {},
});
