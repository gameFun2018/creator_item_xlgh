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

        //炫耀按钮 
        XuanYaoBtn:
        {
            default: null,
            type: cc.Button,       
        },
        //再玩一次
        AgainBtn:
        {
            default: null,
            type: cc.Button,    
        },
        //好友排行
        FriendRankBtn:
        {
            default: null,
            type: cc.Button,     
        },
        //群排行
        GroupRankBtn:
        {
            default: null,
            type: cc.Button,  
        },


        //排行内容Sprite
        RankContentSprite:
        {
            default: null,
            type: cc.Sprite, 
        },

        //
        RankSelectSprite:
        {
            default: null,
            type: cc.Sprite,   
        },
        //数据管理器节点
        DataManager: cc.Node,
        //排行内容显示用Texture2D
        _Texture: cc.Texture2D,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () 
    {
        this.DataManager = cc.find('DataManager');   

        this._Texture = new cc.Texture2D();
    },


    start ()
    {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onUIClick, this);

        this.XuanYaoBtn.node.on(cc.Node.EventType.TOUCH_END, this.onXuanYaoClick, this);
        this.AgainBtn.node.on(cc.Node.EventType.TOUCH_END, this.onAgainClick, this);
        this.FriendRankBtn.node.on(cc.Node.EventType.TOUCH_END, this.onFriendRankClick, this);
        this.GroupRankBtn.node.on(cc.Node.EventType.TOUCH_END, this.onGroupRankClick, this);

        if (window.wx != undefined)
        {
           // window.wx.showShareMenu({withShareTicket: true});//设置分享按钮，方便获取群id展示群排行榜

           //注释掉，发现设置后，微信上滑动有问题
           // window.sharedCanvas.width = 720;
            //window.sharedCanvas.height = 1280;
        }
    },
    
    //
    onEnable()
    {
        var DataManager = this.DataManager.getComponent('DataManager');
        this.ScoreLabel.string = DataManager.getCurScore().toString();

        var DataManager = this.DataManager.getComponent('DataManager');

        if(window.wx != undefined)
        {
            window.wx.postMessage(
                {
                    msgType: 2, 
                }
            );
        }

        this.RankSelectSprite.node.x = this.FriendRankBtn.node.x;
    },

    onDisable()
    {

    },

    //UI 点击
    onUIClick(event)
    {

        event.stopPropagation();
    },

    //炫耀点击
    onXuanYaoClick(event)
    {
        if(window.wx != undefined)
        {
            var DataManager = this.DataManager.getComponent('DataManager');
            wx.shareAppMessage({
                title: DataManager.getShareTitle(),
                imageUrl: DataManager.getShareImage(),   
            });
        }

        event.stopPropagation();
    },

    //再来一次点击
    onAgainClick(event)
    {
        var UIManager = this.node.parent.getComponent('UIManager');
        UIManager.closeUI(UIType.UIType_Rank);

        var gameUI = UIManager.getUI(UIType.UIType_Game);
        gameUI.reset(true);

        var DataManager = this.DataManager.getComponent('DataManager');
        DataManager.setShareReliveCount(0);
        
        event.stopPropagation();
    },

    //好友排行
    onFriendRankClick(event)
    {
        this.RankSelectSprite.node.x = this.FriendRankBtn.node.x;

        if(window.wx == undefined)
        {
            event.stopPropagation();
            return;
        }
        window.wx.postMessage(
            {
                msgType: 2, 
            }
        );
        event.stopPropagation();
    },

    //群排行
    onGroupRankClick(event)
    {
        var self = this;
        this.RankSelectSprite.node.x = this.GroupRankBtn.node.x;

        if(window.wx == undefined)
        {
            event.stopPropagation();
            return;
        }

        var DataManager = this.DataManager.getComponent('DataManager');
        
        window.wx.shareAppMessage({
            title: DataManager.getShareTitle(),
            imageUrl: DataManager.getShareImage(), 
            success: (res) => {
                if (res.shareTickets != undefined && res.shareTickets.length > 0) 
                {
                    console.log('shareAppMessage success', res.shareTickets[0]);

                    window.wx.postMessage(
                        {
                            msgType: 3,
                            shareTicket: res.shareTickets[0],
                        }
                    );
                }
            },
            fail:(res)=>
            {
                self.RankSelectSprite.node.x = self.FriendRankBtn.node.x;       
            },
        });

        event.stopPropagation();
    },


    // 刷新子域的纹理
    _updateSubDomainCanvas ()
     {
        if (!this._Texture)
        {
            return;
        }

        if(!window.sharedCanvas)
        {
            return;
        }

        this._Texture.initWithElement(window.sharedCanvas);
        this._Texture.handleLoadedTexture();
        this.RankContentSprite.spriteFrame = new cc.SpriteFrame(this._Texture);

    },

    update(dt)
    {
        this._updateSubDomainCanvas();
        
    },


});
