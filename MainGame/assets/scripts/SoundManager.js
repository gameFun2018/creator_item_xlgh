// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var SoundType = require('SoundType');

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

        SoundList:
        {
            default: [],   
            type: [cc.AudioClip],
        },

        //play ID list
        _PlayList: [],
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
       this.playSound(SoundType.SoundType_Bg);
    },

    //播放声音 resIndex：声音索引
    playSound(soundInfo)
    {
        
        if(soundInfo.ID >= this.SoundList.length)
        {
            cc.log("playSound resIndex invalid ");
            return;
        }
        if(soundInfo.IsLoop)
        {
            if(this._PlayList[soundInfo.ID] == undefined 
                || this._PlayList[soundInfo.ID] == null
                || this._PlayList[soundInfo.ID] == -1 )
            {
                var retID =  cc.audioEngine.play(this.SoundList[soundInfo.ID], soundInfo.IsLoop);
                this._PlayList[soundInfo.ID] = retID;
            }
        }else
        {
            var retID =  cc.audioEngine.play(this.SoundList[soundInfo.ID], soundInfo.IsLoop);
            this._PlayList[soundInfo.ID] = retID;   
        }

    },

    //停止声音
    stopSound(soundInfo)
    {
       

        //cc.log('stopSound', soundInfo, this._PlayList);
        if(soundInfo.ID >= this.SoundList.length)
        {
            cc.log("stopSound resIndex invalid ");
            return;
        }
        if( this._PlayList[soundInfo.ID] == -1 || this._PlayList[soundInfo.ID]  == undefined )
        {
            cc.log("stopSound not play");
           return;
        }
        cc.audioEngine.stop(this._PlayList[soundInfo.ID]); 
        this._PlayList[soundInfo.ID] = -1;
    }
    

    // update (dt) {},
});
