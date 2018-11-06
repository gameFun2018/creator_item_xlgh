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
        _DataManager: null,

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () 
    {
        var dataMgrNode = cc.find('DataManager');
        this._DataManager = dataMgrNode.getComponent('DataManager');
    },

    start () 
    {
        var self = this;

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function ()
        {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) 
            {
                var response = xhr.responseText;
                console.log(response);
                if(self._DataManager)
                {
                    var cfgObj = JSON.parse(response);
                    console.log(cfgObj);
                    self._DataManager.setShareRelive(cfgObj.isShareRelive); 
                    self._DataManager.setShareTitle(cfgObj.shareTitle);
                    self._DataManager.setShareImage(cfgObj.shareImage);
                }
            }
        };
        xhr.open("GET", 'https://xiao.zhuceqq.com/config.txt', true);
        xhr.send();
    },

    // update (dt) {},
});
