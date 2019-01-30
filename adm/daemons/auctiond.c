// auctiond.c
// 拍卖系统
// Written by jjgod for hell. 01/10/01.

// #pragma optimize
// #pragma save_binary

#include <ansi.h>

inherit F_DBASE;

int clean_up() { return 1; }

#define auction_info    my["auction_info"]
#define lot_percent     4 / 100

public  void   add_auction(object me, object ob, int money);
public  void   cancel_auction(object me);
public  string check_auction_info();
private void   message_auction(string msg);
private string check_auction(object ob);

void create()
{
        mapping my;
        
        seteuid(getuid());
        
        set("channel_id", "拍卖师[Auctioneer]");
        CHANNEL_D->do_channel(this_object(), "sys", "拍卖精灵已经启动。");

        my = query_entire_dbase();
        auction_info = ([ ]);
        set_heart_beat(1);
}

void heart_beat()
{
        mapping my;
        string *id;
        int i, money;
        object me;
        object ob;
        object obj;

        my = query_entire_dbase();
        
        if (! mapp(auction_info) || ! sizeof(auction_info))
                return;

        id = keys(auction_info);
        
        for (i = 0; i < sizeof(id); i++)
        {
                if (! objectp(me = find_player(id[i])))
                {
                        map_delete(auction_info, id[i]);
                        continue;
                }
                if (! objectp(obj = auction_info[id[i]]["goods"]))
                {
                        map_delete(auction_info, id[i]);
                        continue;
                }
                if (stringp(auction_info[id[i]]["now"]) &&
                    ! objectp(ob = find_player(auction_info[id[i]]["now"])))
                {
                        map_delete(auction_info[id[i]], "now");
                }

                if (time() - auction_info[id[i]]["time"] >= 10)
                {
                        if (auction_info[id[i]]["state"] >= 3)
                        {
                                if (! objectp(ob))
                                {
                                        message_auction(sprintf("%s(%s)的%s无人竞价，取消拍卖。",
                                                                me->name(), id[i],
                                                                filter_color(obj->short())));
                                        map_delete(auction_info, id[i]);
                                        continue;
                                }
                                else
                                {
                                        money = auction_info[id[i]]["value"];
                                        message_auction(sprintf("%s(%s)的%s与%s成交了。",
                                                                me->name(), id[i],
                                                                filter_color(obj->short()),
                                                                ob->name()));

                                        switch (MONEY_D->player_pay(ob, money))
                                        {
                                        case 0:
                                        case 2:
                                                tell_object(me, "但是" + ob->name() + "付不起钱"
                                                                "，只好作罢。\n");
                                                tell_object(ob, "但是你付不起钱，只好作罢。\n");
                                                map_delete(auction_info, id[i]);
                                                continue;
                                        default:
                                                switch (MONEY_D->player_pay(me, money * lot_percent))
                                                {
                                                case 0:
                                                case 2:
                                                        tell_object(ob, "但是" + me->name() + "付不起佣金"
                                                                        "，只好作罢。\n");
                                                        tell_object(me, "但是你付不起佣金，只好作罢。\n");
                                                        map_delete(auction_info, id[i]);
                                                        continue;
                                                default:
                                                        // 交易完成
                                                        tell_object(ob, "你收到了" + me->name() + "送来的" +
                                                                        obj->short() + "。\n");
                                                        tell_object(me, "你把" + obj->short() + "交人带给"
                                                                        "了" + ob->name() + "。\n");
                                                        MONEY_D->pay_player(me, money);
                                                        map_delete(auction_info, id[i]);
                                                        obj->move(ob);
                                                        continue;
                                                }
                                        }
                                }
                        }
                        auction_info[id[i]]["state"] += 1;
                        auction_info[id[i]]["time"] = time();
                        message_auction(sprintf("%s(%s)的%s，%s第%s次。",
                                                me->name(), id[i],
                                                filter_color(obj->short()),
                                                MONEY_D->money_str(auction_info[id[i]]["value"]),
                                                chinese_number(auction_info[id[i]]["state"])));
                }
        }
}

// 添加一个拍卖品
public void add_auction(object me, object ob, int money)
{
        mapping my;
        string id;
        string msg;

        my = query_entire_dbase();
        id = me->query("id");

        if (mapp(auction_info[id]))
        {
                tell_object(me, "你正在拍卖别的东西，不能添加新的拍卖品"
                                "。\n");
                return;
        }
        if (stringp(msg = check_auction(ob)))
        {
                tell_object(me, msg);
                return;
        }
        if (! me->can_afford(money * lot_percent))
        {
                tell_object(me, "你付不起佣金呀。\n");
                return;
        }
        
        auction_info[id] = ([ "goods" : ob,
                              "time"  : time(),
                              "value" : money,
                              "lot"   : money * lot_percent,
                              "state" : 1, ]);
        tell_object(me, "你开始拍卖" + ob->short() + NOR "，目前" + 
                        (strlen(msg = MONEY_D->money_str(money * lot_percent)) ?
                        "你需要付出" + msg : "不需要付出") + "佣金。\n");
        message_auction(sprintf("%s(%s)拍卖%s，%s第一次。", me->name(),
                                id, filter_color(ob->short()),
                                MONEY_D->money_str(money), ));
        return;
}

// 检测拍卖物品
private string check_auction(object ob)
{
        string msg;

        if (! ob->query("value") && ! ob->query("base_value"))
                return "这玩意儿可不值钱哪。\n";

        if (ob->query("no_sell") || ob->query("no_drop"))
        {
                if (stringp(msg = ob->query("no_sell")))
                        return msg;
                return "这个东西可不能卖了。\n";
        }

        if (ob->is_character())
                return "这你也拿来拍卖？\n";

        if (ob->query("money_id"))
                return "你没用过钱啊？\n";

        if (ob->query("food_supply"))
                return "吃的喝的等卖出去都馊了。\n";
}

// 取消拍卖物品
public void cancel_auction(object me)
{
        mapping my;
        string id;
        string name;
        object ob;

        id = me->query("id");
        my = query_entire_dbase();

        if (! mapp(auction_info[id]))
        {
                tell_object(me, "你没有在拍卖任何东西。\n");
                return;
        }

        if (objectp(ob = auction_info[id]["goods"]))
                name = filter_color(ob->short());
        else name = "拍卖品";

        tell_object(me, "你取消了拍卖。\n");        
        message_auction(sprintf("%s(%s)取消了拍卖%s的%s。", me->name(), id,
                                gender_pronoun(me->query("gender")), name, ));
        map_delete(auction_info, id);
        return;
}

// 查看拍卖物品
public string check_auction_info()
{
        mapping my;
        string msg, name;
        string *id;
        object ob;
        int i;

        my = query_entire_dbase();
        
        if (! mapp(auction_info) || ! sizeof(auction_info))
                msg = "目前没有任何正在拍卖的物品。\n";

        else
        {
                msg = "目前正在拍卖的物品有以下这些：\n";
                msg += HIC "≡" HIY "─玩家──────────物品─────────"
                       "───竞价者───────价格──────" HIC "≡\n" NOR;
                
                id = keys(auction_info);
                for (i = 0; i < sizeof(id); i++)
                {
                        if (! find_player(id[i]))
                        {
                                map_delete(auction_info, id[i]);
                                continue;
                        }
                        if (! objectp(ob = auction_info[id[i]]["goods"]))
                        {
                                map_delete(auction_info, id[i]);
                                continue;
                        }
                        
                        if (! stringp(auction_info[id[i]]["now"]) || 
                            ! objectp(find_player(auction_info[id[i]]["now"])))
                                name = "无";
                        else name = find_player(auction_info[id[i]]["now"])->name() +
                                    "(" + find_player(auction_info[id[i]]["now"])->query("id") +
                                    ")";

                        msg += sprintf(HIC "  %-20s %-30s %-20s %-20s\n" NOR,
                                       find_player(id[i])->name() + "(" +
                                       find_player(id[i])->query("id") + ")",
                                       filter_color(ob->short()),
                                       name, 
                                       MONEY_D->money_str(auction_info[id[i]]["value"]));
                }
                msg += HIC "≡" HIY "──────────────────────────"
                       "───────────────────" HIC "≡\n" NOR;
                msg += sprintf("目前共有%s件拍卖品。\n", chinese_number(sizeof(auction_info)));
                if (! sizeof(auction_info)) msg = "目前没有任何正在拍卖的物品。\n";
        }
        return msg;
}

// 参与竞价
public void join_auction(object me, string name, int money)
{
        mapping my;
        object ob;
        object obj;

        my = query_entire_dbase();

        if (! mapp(auction_info[name]))
        {
                tell_object(me, "这个人没有在拍卖什么东西。\n");
                return;
        }
        if (! objectp(ob = find_player(name)))
        {
                tell_object(me, "这个人已经不在线了耶。\n");
                map_delete(auction_info, name);
                return;
        }
        if (! objectp(obj = auction_info[name]["goods"]))
        {
                tell_object(me, "这个人现在已经没有这个东西了耶。\n");
                map_delete(auction_info, name);
                return;
        }
        if (money <= auction_info[name]["value"])
        {
                tell_object(me, "这个价人家恐怕不会要。\n");
                return;
        }
        if (stringp(auction_info[name]["now"]) &&
            auction_info[name]["now"] == me->query("id"))
        {
                tell_object(me, "好像上次出价的就是你吧。\n");
                return;
        }

        message_auction(sprintf("%s(%s)购买%s(%s)的%s，%s第一次。",
                                me->name(), me->query("id"), ob->name(),
                                name, filter_color(obj->short()), 
                                MONEY_D->money_str(money)));
        auction_info[name]["now"] = me->query("id");
        auction_info[name]["value"] = money;
        auction_info[name]["time"] = time();
        auction_info[name]["lot"] = money * lot_percent;
        auction_info[name]["state"] = 1;

        return;
}

// 发送拍卖信息
private void message_auction(string msg)
{
        CHANNEL_D->do_channel(this_object(), "bill", msg);
}
