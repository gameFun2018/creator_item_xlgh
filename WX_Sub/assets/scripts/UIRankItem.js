// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

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
        //名次
        IndexLabel:
        {
            default: null,   
            type: cc.Label,
        },
        //头像精灵
        HeadImageSprite:
        {
            default: null,
            type: cc.Sprite,
        },
        //昵称
        NickNameLabel:
        {
            default: null,   
            type: cc.Label,
        },
        //分数
        ScoreLabel:
        {
            default: null,   
            type: cc.Label,   
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    //初始化UIt， data:微信好友请求下来的数据(index:从0开始)
    init(index, data, score)
    {
        //console.log("RankItem ", index + 1);
        this.IndexLabel.string = (index + 1).toString();
        this.createImage(data.avatarUrl);
        this.NickNameLabel.string = data.nickname;
        this.ScoreLabel.string = score;    
    },

    //创建头像
    createImage(avatarUrl)
    {
        if (window.wx == undefined) 
        {
            console.log("createImage wx undefined");
            return;
        } 

        try {
            let image = wx.createImage();
            image.onload = () => {
                try {
                    let texture = new cc.Texture2D();
                    texture.initWithElement(image);
                    texture.handleLoadedTexture();
                    this.HeadImageSprite.spriteFrame = new cc.SpriteFrame(texture);
                } catch (e) {
                    console.log(e);
                    this.HeadImageSprite.node.active = false;
                }
            };
            image.src = avatarUrl;
        }catch (e) {
            console.log(e);
            this.HeadImageSprite.node.active = false;
        }
    }
    
    
    // update (dt) {},
});
