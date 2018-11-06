// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var UIType = require("UIType");

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

        //
        UIList:
        {
            default: [],
            type: [cc.Node],        
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    //获取UI对应的脚本
    getUIScriptName(uiType)
    {
        var scriptList = ['UIGame', 'UIGameOver', 'UIGame'];
        return scriptList[uiType];
    },

    //打开UI
    openUI(uiType)
    {
        if(uiType >= this.UIList.length)
        {
            cc.log("openUI invalid uiType, please check UIList");
            return;
        } 

        if(this.UIList[uiType] == null || this.UIList[uiType] == undefined)
        {
            cc.log("openUI invalid uiType, object null");
            return;   
        }
        this.UIList[uiType].active = true;
    },
    
    //关闭UI
    closeUI(uiType)
    {
        if(uiType >= this.UIList.length)
        {
            cc.log("closeUI invalid uiType, please check UIList");
            return;
        } 
        
        this.UIList[uiType].active = false;
    },

    //获取某个UI 
    getUI(uiType)
    {
        if(uiType >= this.UIList.length)
        {
            cc.log("closeUI invalid uiType, please check UIList");
            return;
        } 
       
       return this.UIList[uiType].getComponent(this.getUIScriptName(uiType)); 
    }

    // update (dt) {},
});
