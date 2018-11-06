// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

//驴
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
        _UIGameNode: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () 
    {
        this._UIGameNode = cc.find('Canvas/UIManager/UIGame');
    },

    //跳跃，相对位置
    jump(duration, destPos)
    {

        var rotAct = cc.jumpBy(duration, destPos, 80, 1);
        var callFunc = cc.callFunc(this.onJumpEnd, this);
        var seq = cc.sequence(rotAct, callFunc);
        if(destPos.x > 0)
        {
            this.node.setScaleX(1);      
        }
        else
        {
            this.node.setScaleX(-1);   
        }

        this.node.runAction(seq);
    },

    //跳跃到目标点, 绝对位置
    jumpTo(duration, destPos)
    {
        var rotAct = cc.jumpTo(duration, destPos, 80, 1);
        var callFunc = cc.callFunc(this.onJumpEnd, this);
        var seq = cc.sequence(rotAct, callFunc);
        if(destPos.x > 0)
        {
            this.node.setScaleX(1);      
        }
        else
        {
            this.node.setScaleX(-1);   
        }

        this.node.runAction(seq);   
    },

    //跳跃结束
    onJumpEnd()
    {
        this._UIGameNode.getComponent('UIGame').onPlayerJumpEnd();   
    },

    // update (dt) {},
});
