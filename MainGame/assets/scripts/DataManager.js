// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

//数据管理器

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

        //当前分数:
        CurScore:
        {
            default: 0,
            type: cc.Integer,
        },
        //当前金币数：
        CurGold: 
        {
            default: 0,
            type: cc.Integer,
        },
        //是否分享复活
        IsShareRelive:
        {
            default: false,  
        },
        //分享复活次数
        _ShareReliveCount: 0,
        //分享标题 
        _ShareTitle: '',
        _ShareImageUrl: '',

    },
    

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    //
    start () {
        cc.log("DataManager start");
       
    },
    
    //获取当前分数
    getCurScore()
    {
        return this.CurScore;   
    },

    //设置当前分数
    setCurScore(curScore)
    {
        this.CurScore = curScore; 
    },
    

    //获取当前金币
    getCurGold()
    {
        return this.CurGold;   
    },

    //设置当前金币
    setCurGold(curGold)
    {
        this.CurGold = curGold;
        
    },

    //设置是否分享复活
    setShareRelive(isShareRelive)
    {
        if(isShareRelive == undefined)
        {
            return;
        }
        this.IsShareRelive = isShareRelive;
    },

    getShareRelive()
    {
        return this.IsShareRelive;
    },

    setShareTitle(shareTitle)
    {
        this._ShareTitle = shareTitle;
    },

    getShareTitle()
    {
        return this._ShareTitle;
    },

    setShareImage(shareImage)
    {
        this._ShareImageUrl = shareImage;
    },

    getShareImage()
    {
        return this._ShareImageUrl;
    },

    setShareReliveCount(reliveCount)
    {
        this._ShareReliveCount = reliveCount;
    },

    getShareReliveCount()
    {
        return   this._ShareReliveCount;  
    }
    // update (dt) {},
});
