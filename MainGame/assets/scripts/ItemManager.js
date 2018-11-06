// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

//游戏中物品池，管理复用的物品

//物品类型
var ItemType = 
{
    //没有东西
    IT_None: -1,
    //草
    IT_Grass: 0,
    //玉米
    IT_Corn: 1,
    //萝卜
    IT_Radish: 2,
    //金币
    IT_Coin:3,
};

var ItemManager = cc.Class({
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

        //物品Prefab列表
        ItemPrefabList:
        {
            default: [],  
            type: [cc.Prefab],
        },

        //概率列表
        ItemRateList:
        {
            default:[],
            type: [cc.Integer],                    
        },

        //随机的基数
        _RandBaseNum : 100,
        _RandRateList: [],
        //物品池
        _ItemPoolList: [],

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () 
    {
        this._RandBaseNum = 0;

        //概率统计：
        for(var i = 0; i < this.ItemRateList.length; ++i)
        {
            this._RandBaseNum += this.ItemRateList[i];
            if(i == 0)
            {
                this._RandRateList[i] = this.ItemRateList[i];
            }
            else
            {
                this._RandRateList[i] =  this._RandRateList[i - 1] + this.ItemRateList[i];
            }
        }

        //物品池,各个物品先预创建3个
        for(let i = 0; i < 4; ++i)
        {
            this._ItemPoolList[i] = new cc.NodePool();
            
            for(var j = 0; j < 3; ++j)
            {
                var curItem = cc.instantiate(this.ItemPrefabList[i]);
                this._ItemPoolList[i].put(curItem); 
                //设置为物品  
                curItem.group = "item";
                curItem.setTag(i);
            }
        }

    },

    start ()
    {
        
    },

    //获取当前Block挂载的物品
    getRandomItemType()
    {
        //[0, 1)
        var randNum = parseInt(cc.random0To1() * this._RandBaseNum);
        for(var i = 0; i < this._RandRateList.length; ++i)
        {
            if(randNum < this._RandRateList[i] )
            {
                
                break;
            }
        }
        //cc.log("getRandomItemType ",  randNum, );
        return i - 1;
    },

    //获取某类型的Item
    getItemByType( itemType )
    {
        if(itemType == ItemType.IT_None)
        {
            return null;
        }   

        if(itemType > 3 || itemType < 0)
        {
            return null;
        }

        var curItem = this._ItemPoolList[itemType].get();
        if(curItem == null)
        {
            curItem =   cc.instantiate(this.ItemPrefabList[itemType]);
            this._ItemPoolList[itemType].put(curItem);
            //设置为物品  
            curItem.group = "item";
            curItem.setTag(itemType);

            curItem = this._ItemPoolList[itemType].get();
            cc.log("new item ", itemType);
        }
        curItem.scale = 0.7;
        return curItem;
    },

    //将Item重新返回到Pool
    putItemToPool(curItem)
    {
        if(curItem.group != 'item')
        {
            //cc.log("putItemToPool invalid  group");
            return;
        }

        curItem.parent = null;

        var itemType = curItem.getTag();

        if(itemType > 3 || itemType < 0)
        {
            //cc.log("putItemToPool invalid  itemType");
            return;
        }

        this._ItemPoolList[itemType].put(curItem);

    },

    // update (dt) {},
});


module.exports = 
{
    ItemType: ItemType,
    ItemManager: ItemManager,
}