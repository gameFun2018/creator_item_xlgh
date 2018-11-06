// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html


const  BEST_SCORE = "test";

var self;

cc.Class({
    extends: cc.Component,

    properties: 
    {
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

        //排行榜Item
        RankPrefab: 
        {
            default: null, 
            type: cc.Prefab,
        },

        //scroll content节点
        ScrollviewContent: 
        {
            default: null, 
            type: cc.Node,
        },


    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () 
    {
        self = this;

        if (window.wx != undefined) 
        {
            window.wx.onMessage(this.onWXMessage);
        }
    },


    //处理主域传递过来的信息
    onWXMessage(data)
    {
        console.log("onWXMessage ", data);
        //
        if(data.msgType == 1)
        {
            self.onCommitScore(data.bestScore);              
        }
        //好友
        else if(data.msgType == 2)
        {
            self.onGetFriendData();     
        }
        //群
        else if(data.msgType == 3)
        {
            self.onGroupRank(data.shareTicket);
        }
    },


     //提交分数:
     onCommitScore(bestScore)
     {
         if (window.wx == undefined) 
         {
             cc.log("提交得分 fail:" + BEST_SCORE + " : " + bestScore)
             return;
         }
 
         window.wx.getUserCloudStorage(
         {
             // 以key/value形式存储
             keyList: [BEST_SCORE],
             success: function (getres) {
                 
                 console.log('getUserCloudStorage', 'success', getres)
                 if (getres.KVDataList.length != 0) 
                 {
                     var valueStr = getres.KVDataList[0].value;
                     var valueObj = JSON.parse(valueStr);
                     if (valueObj.wxgame)
                     {
                         if(valueObj.wxgame.score >= bestScore)
                         {
                            return;
                         }
                     }
                 }
                 var wxGameInfo = 
                 {
                    wxgame:
                    {
                        score: bestScore,
                        update_time: parseInt(new Date().getTime() / 1000),
                    }
                 }
                 var valueStr = JSON.stringify(wxGameInfo);
                 console.log("valueStr ", valueStr);
                 // 对用户托管数据进行写数据操作
                 window.wx.setUserCloudStorage(
                 {

                     KVDataList: [{ key: BEST_SCORE, value: valueStr}],
                     success: function (res)
                     {
                         console.log('setUserCloudStorage', 'success', res)
                     },
                     fail: function (res)
                     {
                         console.log('setUserCloudStorage', 'fail', res)
                     },
                     complete: function (res) 
                     {
                         console.log('setUserCloudStorage', 'ok')
                     }
                 });
             },
             fail: function (res) {
                 console.log('getUserCloudStorage', 'fail', res)
             },
             complete: function (res) {
                 console.log('getUserCloudStorage', 'ok', res)
             }
         });
     },
 
     //请求好友排行数据
     onGetFriendData() 
     {
         var self = this;
 
         console.log("onGetFriendData ");
         if(window.wx != undefined)
         {
             wx.getFriendCloudStorage(
                 {
                     keyList:[BEST_SCORE],     
                     success(res)
                     {
                         //清理排行
                         self.ScrollviewContent.removeAllChildren();
 
                         //数据刷新显示
                         console.log("getFriendCloudStorage  success", res, self.RankPrefab);  
                         let data = res.data;
                        
                         data.sort((a, b) => {
                             if (a.KVDataList.length == 0 && b.KVDataList.length == 0) {
                                 return 0;
                             }
                             if (a.KVDataList.length == 0) {
                                 return 1;
                             }
                             if (b.KVDataList.length == 0) {
                                 return -1;
                             }
                             //string
                             var valueObjA = JSON.parse(a.KVDataList[0].value);
                             var valueObjB = JSON.parse(b.KVDataList[0].value);
                             if(valueObjA.wxgame == undefined)
                             {
                                return 1;
                             }
                             if(valueObjB.wxgame == undefined)
                             {
                                return -1;
                             }
                             return valueObjB.wxgame.score - valueObjA.wxgame.score;
                         });
 
                         for(let i = 0; i < data.length; ++i)
                         {
                             var info = data[i];
                             //此处做测试用
                             //for(let j = 0; j < 6; ++j)
                             //{
                                var itemIns = cc.instantiate(self.RankPrefab);
                                var item = itemIns.getComponent("UIRankItem");
                                if(info.KVDataList.length == 0)
                                {
                                    item.init(i, info, 0);
                                }else
                                {
                                    for(let k = 0; k < info.KVDataList.length; ++k)
                                    {
                                        var kvData = info.KVDataList[k];
                                        var jsonObj = JSON.parse(kvData.value);
   
                                        if(kvData.key == BEST_SCORE)
                                        {
                                            if(jsonObj.wxgame != undefined)
                                            {
                                               item.init(i, info, jsonObj.wxgame.score); 
                                            }
                                        }
                                    }
                                }
                                
                                self.ScrollviewContent.addChild(itemIns);
                             //}
                         } 
                     },
                     fail()
                     {
                         console.log("getFriendCloudStorage  fail"); 
                     },
                 }
             )        
         }           
     },

     //请求群排行数据
     onGroupRank(shareTicket)
     {
        var self = this;
 
        console.log("onGroupRank -----");
        if(window.wx != undefined)
        {
            wx.getGroupCloudStorage(
                {
                    shareTicket: shareTicket,
                    keyList:[BEST_SCORE],     
                    success(res)
                    {
                        //清理排行
                        self.ScrollviewContent.removeAllChildren();

                        //数据刷新显示
                        console.log("getGroupCloudStorage  success", res, self.RankPrefab);  
                        let data = res.data;
                       
                        data.sort((a, b) => {
                            if (a.KVDataList.length == 0 && b.KVDataList.length == 0) {
                                return 0;
                            }
                            if (a.KVDataList.length == 0) {
                                return 1;
                            }
                            if (b.KVDataList.length == 0) {
                                return -1;
                            }
                            //string
                            var valueObjA = JSON.parse(a.KVDataList[0].value);
                            var valueObjB = JSON.parse(b.KVDataList[0].value);
                            if(valueObjA.wxgame == undefined)
                            {
                               return 1;
                            }
                            if(valueObjB.wxgame == undefined)
                            {
                               return -1;
                            }
                            return valueObjB.wxgame.score - valueObjA.wxgame.score;
                        });

                        for(let i = 0; i < data.length; ++i)
                        {
                            var info = data[i];

                            var itemIns = cc.instantiate(self.RankPrefab);
                            var item = itemIns.getComponent("UIRankItem");
                            if(info.KVDataList.length == 0)
                            {
                                item.init(i, info, 0);
                            }else
                            {
                                for(let k = 0; k < info.KVDataList.length; ++k)
                                {
                                    var kvData = info.KVDataList[k];
                                    var jsonObj = JSON.parse(kvData.value);

                                    if(kvData.key == BEST_SCORE)
                                    {
                                        if(jsonObj.wxgame != undefined)
                                        {
                                           item.init(i, info, jsonObj.wxgame.score); 
                                        }
                                    }
                                }
                            }
                            
                            self.ScrollviewContent.addChild(itemIns);

                        } 
                    },
                    fail()
                    {
                        console.log("getGroupCloudStorage  fail"); 
                    },
                }
            )        
        }                  
     }

    // update (dt) {},
});
