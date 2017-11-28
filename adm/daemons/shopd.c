// 商业系统总控程序
// edit by smallfish 2002.3.17
// Updated by Vin for heros.cn
// Updated by Jjgod.

#include <ansi.h>
#include <config.h>
#include <getconfig.h>

/*
本文件为商业系统中店铺的主干程序
本文件提供以下文件调用：
/cmds/usr/shop.c                        店铺查询管理指令
/inherit/char/waiter.c                  伙计程序接口文件
/inherit/room/shop.c                    店铺程序接口文件

店铺以及伙计的程序存放路径：/clone/shop
店铺伙计继承文件：/inherit/char/waiter.c

店铺继承文件：/inherit/room/shop.c
店铺伙计产用 *.o 格式的文件存储，存储文件存放于：/data/shop
店铺主要变量：
string owner:           主人ID
int shop_type：         店铺状态(0 表示关闭)
mapping vendor_goods:           货物价格，keys 为货物的 base_name
mapping vendor_goods_num:       单个货物数量，keys 为货物的 base_name
int all_vendor_goods:           所有货物数量总和
mapping invite:                 贵宾的折扣，keys 为贵宾的 id
string *ban:                    黑户列表，keys 为黑户 id
*/

public mapping *query_shop();                                           // 返回店铺列表
public int is_inited();                                                 // 返回店铺是否全部初始化
private int check_owner(string arg);                                    // 检查店铺主人和店铺伙计主人是否相同
public int change_owner(object me,string arg,string owner);             // 修改店铺店主(店铺主人和店铺伙计主人)
public int is_owner(string owner);                                      // 查看玩家 owner 是否店铺店主
public int close_all(object me);                                        // 关闭所有店铺
public int close_shop(object me,string arg);                            // 关闭指定店铺
public int open_all(object me);                                         // 开放所有店铺
public int open_shop(object me,string arg);                             // 开放指定店铺
public int reset_all(object me);                                        // 初始化所有店铺
public int reset_shop(object me,string arg);                            // 初始化指定店铺
public int list_shop(object me);                                        // 查询店铺(供 listshop 指令调用)
public string do_modify(object obj, object me, string arg);             // 修改店铺伙计的属性
public string do_stock(object ob, object me, string arg);               // 标价并出售货物
public string do_unstock(object ob, object me, string arg);             // 取下货物
public string do_list(object ob, object me, string arg);                // 查询货物
public int do_buy(object obj, object me, string arg);                   // 购买货物
private int player_pay(object who, object target, int amount);          // 付款，计算商业评价以及税率
public string do_jiezhang(object ob, object me);                        // 结帐(店铺主人不在线时候的店铺收入)
public string list_invite(object ob, object me);                        // 查询贵宾列表
public string do_invite(object ob, object me, string arg);              // 设置|取消 贵宾
public string list_ban(object ob, object me);                           // 查询黑户列表
public string do_ban(object ob, object me, string arg);                 // 设置|取消 黑户
private void destruct_it(object ob);                                    

string *special_props = ({ "short", "long" });

STATIC_VAR_TAG mapping *all_shop = ({
        ([
                "id":             "扬州",
                "name":           "通天阁",
                "start_room":     "yangzhou_shop",
                "type":           "shop",
                "price":          800,
        ]),
        ([
                "id":             "长安",
                "name":           "百宝斋",
                "start_room":     "changan_shop",
                "type":           "shop",
                "price":          500,
        ]),
        ([
                "id":             "洛阳",
                "name":           "天寰阁",
                "start_room":     "luoyang_shop",
                "type":           "shop",
                "price":          500,
        ]),
        ([
                "id":             "北京",
                "name":           "聚宝堂",
                "start_room":     "beijing_shop",
                "type":           "shop",
                "price":          500,
        ]),
        ([
                "id":             "大理",
                "name":           "翡翠园",
                "start_room":     "dali_shop",
                "type":           "shop",
                "price":          500,
        ]),
        ([
                "id":             "开封",
                "name":           "万景庄",
                "start_room":     "kaifeng_shop",
                "type":           "shop",
                "price":          500,
        ]),
        ([
                "id":             "襄阳",
                "name":           "聚义堂",
                "start_room":     "xiangyang_shop",
                "type":           "shop",
                "price":          500,
        ]),
        ([
                "id":             "苏州",
                "name":           "听竹轩",
                "start_room":     "suzhou_shop",
                "type":           "shop",
                "price":          500,
        ]),
        ([
                "id":             "杭州",
                "name":           "玉皇阁",
                "start_room":     "hangzhou_shop",
                "type":           "shop",
                "price":          500,
        ]),
        ([
                "id":             "佛山",
                "name":           "英雄楼",
                "start_room":     "foshan_shop",
                "type":           "shop",
                "price":          300,
        ]),
        ([
                "id":             "衡阳",
                "name":           "祝融居",
                "start_room":     "hengyang_shop",
                "type":           "shop",
                "price":          300,
        ]),
        ([
                "id":             "中州",
                "name":           "百鹤斋",
                "start_room":     "zhongzhou_shop",
                "type":           "shop",
                "price":          300,
        ]),
        ([
                "id":             "福州",
                "name":           "腾龙斋",
                "start_room":     "fuzhou_shop",
                "type":           "shop",
                "price":          300,
        ]),
        ([
                "id":             "成都",
                "name":           "残月楼",
                "start_room":     "chengdu_shop",
                "type":           "shop",
                "price":          300,
        ]),
        ([
                "id":             "荆州",
                "name":           "五华楼",
                "start_room":     "jingzhou_shop",
                "type":           "shop",
                "price":          300,
        ]),
});

public mapping *query_shop()
{
        return all_shop;
}

public int is_inited()
{
        int i, is_ok;
        object shop;

        is_ok = 1;

        for (i = 0; i < sizeof(all_shop); i++)
        {
                shop = load_object(SHOP_DIR + all_shop[i]["start_room"]);

                if (! shop || shop->query("shop_type"))
                {
                        is_ok = 0;
                        break;
                } else
                {
                        if ((shop->query("vendor_goods") &&
                             sizeof(shop->query("vendor_goods")) > 0) ||
                             shop->query("all_vendor_goods") ||
                             shop->query("owner") != "VOID_SHOP")
                        {
                                is_ok = 0;
                                break;
                        }
                }
        }
        return is_ok;
}

private int check_owner(string arg)
{
        int i, have_it;
        object the_shop;
        string shop_owner;

        have_it = 0;
        for (i = 0; i < sizeof(all_shop); i++)
        {
                if (all_shop[i]["id"] == arg)
                {
                        have_it = 1;
                        break;
                }
        }

        // 没有找到指定的店铺
        if (! have_it)
                return 0;

        the_shop = load_object(SHOP_DIR + all_shop[i]["start_room"]);

        if (! the_shop)
                return 0;

        shop_owner = the_shop->query("owner");
        return 1;
}

public int change_owner(object me, string arg, string owner)
{
        int i, have_it;
        object the_shop;

        have_it = 0;
        for (i = 0; i < sizeof(all_shop); i++)
        {
                if (all_shop[i]["id"] == arg)
                {
                        have_it = 1;
                        break;
                }
        }

        if (! have_it)
        {
                tell_object(me, "对不起，" + arg + "店铺并不存在。\n");
                return 1;
        }

        if (! check_owner(arg))
        {
                tell_object(me, "警告：" + arg + "店铺主人和店铺伙计主"
                                "人数据异常，请仔细检查。\n");

                log_file("static/shop", sprintf("%s店铺数据异常，时"
                         "间：%s。\n", arg, ctime(time())));
                return 1;
        }

        the_shop = load_object(SHOP_DIR + all_shop[i]["start_room"]);

        if (the_shop)
        {
                the_shop->set("owner", owner);
                the_shop->save();
                tell_object(me, arg + "店铺店主修改完毕。\n");
        } else
        {
                tell_object(me, arg + "店铺文件不存在，请仔细查看。\n");
                return 1;
        }

        return 1;
}

public int is_owner(string owner)
{
        int i;
        object shop;

        for (i = 0; i < sizeof(all_shop); i ++)
        {
                shop = load_object(SHOP_DIR + all_shop[i]["start_room"]);

                if (! objectp(shop))
                        return 0;

                if (shop->query("owner") == owner)
                        return 1;
        }
        return 0; 
}

public int close_all(object me)
{
        int i;

        for (i = 0; i < sizeof(all_shop); i++)
                close_shop(me, all_shop[i]["id"]);

        return 1;
}

// 关闭店铺是修改店铺的 shop_type 为 0
public int close_shop(object me, string arg)
{
        int i, have_it;
        object the_shop;

        have_it = 0;

        for (i = 0; i < sizeof(all_shop); i++)
        {
                if (all_shop[i]["id"] == arg)
                {
                        have_it = 1;
                        break;
                }
        }

        if (! have_it)
        {
                tell_object(me, "对不起，" + arg + "店铺并不存在。\n");
                return 1;
        }

        if (! check_owner(arg))
        {
                tell_object(me, "警告：" + arg + "店铺主人和店铺伙计主人数"
                                "据异常，请仔细检查。\n");
                log_file("static/shop",sprintf("%s店铺数据异常，时间："
                         "%s。\n", arg, ctime(time())));
                return 1;
        }

        the_shop = load_object(SHOP_DIR + all_shop[i]["start_room"]);

        if (the_shop)
        {
                the_shop->set("shop_type", 0);
                the_shop->save();
                tell_object(me, arg + "店铺成功关闭。\n");
        } else
        {
                tell_object(me, arg + "店铺文件不存在，请仔细查看。\n");
                return 1;
        }
        return 1;
}

public int open_all(object me)
{
        int i;
        for (i = 0; i < sizeof(all_shop); i++)
                open_shop(me, all_shop[i]["id"]);
        return 1;
}

// 开放店铺是修改店铺的 shop_type 为 1
public int open_shop(object me, string arg)
{
        int i, have_it;
        object the_shop;

        have_it = 0;
        for (i = 0; i < sizeof(all_shop); i++)
        {
                if (all_shop[i]["id"] == arg)
                {
                        have_it = 1;
                        break;
                }
        }
        if (! have_it)
        {
                tell_object(me, "对不起，" + arg + "店铺并不存在。\n");
                return 1;
        }

        if (! check_owner(arg))
        {
                tell_object(me,"警告：" + arg + "店铺主人和店铺伙计主人数据异常，请仔细检查！\n");
                log_file("static/shop", sprintf("%s店铺数据异常，时间：%s。\n", arg, ctime(time())));
                return 1;
        }

        the_shop = load_object(SHOP_DIR + all_shop[i]["start_room"]);

        if (the_shop)
        {
                the_shop->set("shop_type", 1);
                me->save();
                tell_object(me, arg + "店铺成功开放！\n");
        } else
        {
                tell_object(me, arg + "店铺文件不存在，请仔细查看！\n");
                return 1;
        }
        return 1;
}

public int reset_all(object me)
{
        int i;
        for (i = 0; i < sizeof(all_shop); i++)
                reset_shop(me, all_shop[i]["id"]);
        return 1;
}

// 初始化店铺包括：
// 关闭店铺
// 设置店铺和伙计的主人为空值
// 清除伙计的货物以及伙计的存款
// 清除伙计的贵宾和黑户
public int reset_shop(object me, string arg)
{
        int i, have_it;
        string *props, prop;
        object the_shop, the_waiter;
        mapping m;

        have_it = 0;
        for (i = 0; i < sizeof(all_shop); i++)
        {
                if (all_shop[i]["id"] == arg)
                {
                        have_it = 1;
                        break;
                }
        }
        if (! have_it)
        {
                tell_object(me,"对不起，" + arg + "店铺并不存在。\n");
                return 1;
        }

        the_shop = load_object(SHOP_DIR + all_shop[i]["start_room"]);

        if (the_shop)
        {
                the_shop->set("shop_type", 0);
                the_shop->set("owner", "VOID_SHOP");
                the_shop->set("balance", 0);
                the_shop->delete("vendor_goods");
                the_shop->delete("vendor_goods_num");
                the_shop->delete("all_vendor_goods");
                the_shop->delete("invite");
                the_shop->delete("ban");

                the_shop->save();

                tell_object(me, arg + "店铺成功初始化！\n");
        } else
        {
                tell_object(me, arg + "店铺文件不存在，请仔细查看！\n");
                return 1;
        }

        the_waiter = present("huo ji", the_shop);
        if (the_waiter)
        {
                if (arrayp(m = the_shop->query("waiter")) && sizeof(props = keys(m)))
                {
                        foreach (prop in props)
                        {
                                if (prop == "name")
                                        the_waiter->set_name("店铺伙计", ({ "huo ji", "huo", "ji" }));
                                if (prop == "long")
                                        the_waiter->set("long", "他就是这家店铺的伙计。\n");
                                the_waiter->delete(prop);
                        }
                        the_shop->delete("waiter");
                }
                tell_object(me, arg + "伙计成功初始化！\n");
        } else
        {
                tell_object(me, arg + "店铺伙计不存在，请仔细查看！\n");
                return 1;
        }
        return 1;
}

public int list_shop(object me)
{
        int i;
        string arg, na, msg;
        object ob, the_shop;

        msg = WHT "当前" + LOCAL_MUD_NAME() + "的店铺列表如下：\n" NOR;
        msg += HIC "≡" HIY "───────────────────────────"
               "───────" HIC "≡\n" NOR;
        for (i = 0; i < sizeof(all_shop); i++)
        {
                arg = all_shop[i]["id"];

                if (! check_owner(arg))
                        continue;

                the_shop = load_object(SHOP_DIR + all_shop[i]["start_room"]);

                if (! the_shop)
                        continue;

                if (objectp(ob = find_player(the_shop->query("owner"))))
                        na = HIW + ob->query("name");
                else
                {
                        na = GRN "离线玩家";
                }

                msg += sprintf(WHT " 店铺：" HIG "%s[" HIW "%s" HIG "]\t " NOR +
                               WHT "经营状态：" HIG "%s" NOR +
                               WHT "  店铺主人：" HIG "%s\n" NOR,
                               all_shop[i]["name"], 
                               arg, 
                               (the_shop->query("shop_type") &&
                               the_shop->query("owner") != "VOID_SHOP") ? HIG
                               "营业中  " NOR : NOR + GRN "暂不营业" NOR,
                               the_shop->query("owner") == "VOID_SHOP" ? NOR +
                               GRN "凤天南(系统)" NOR : NOR + na +
                               "(" + the_shop->query("owner") + ")" NOR,);
        }
        msg += HIC "≡" HIY "───────────────────────────"
               "───────" HIC "≡\n" NOR;
        msg += WHT "总共有" + chinese_number(sizeof(all_shop)) + "家店铺。\n" NOR;
        tell_object(me, msg);
        return 1;
}

public string do_modify(object obj, object me, string arg)
{
        string item, msg;
        mapping dbase;
        object room;
        
        room = environment(obj);

        if (! room->query("shop_type"))
                return "对不起，该店铺目前已经被巫师关闭。\n";

        if (! arg || sscanf(arg,"%s %s", item, msg) != 2)
                return "设定格式为：modify <项目> <内容>\n";

        if (CHINESE_D->check_control(msg))
                return "描述不可有控制符。\n";

        if (CHINESE_D->check_space(msg))
                return "描述必需不含空格。\n";

        if (CHINESE_D->check_return(msg))
                return "描述必需不含回车键。\n";

        msg = replace_string(msg, "$BLK$", BLK);
        msg = replace_string(msg, "$RED$", RED);
        msg = replace_string(msg, "$GRN$", GRN);
        msg = replace_string(msg, "$YEL$", YEL);
        msg = replace_string(msg, "$BLU$", BLU);
        msg = replace_string(msg, "$MAG$", MAG);
        msg = replace_string(msg, "$CYN$", CYN);
        msg = replace_string(msg, "$WHT$", WHT);
        msg = replace_string(msg, "$HIR$", HIR);
        msg = replace_string(msg, "$HIG$", HIG);
        msg = replace_string(msg, "$HIY$", HIY);
        msg = replace_string(msg, "$HIB$", HIB);
        msg = replace_string(msg, "$HIM$", HIM);
        msg = replace_string(msg, "$HIC$", HIC);
        msg = replace_string(msg, "$HIW$", HIW);
        msg = replace_string(msg, "$NOR$", NOR);
        msg = replace_string(msg, "$S$", BLINK);

        switch(item)
        {
        case "desc":
                if (CHINESE_D->check_length(msg) > 100)
                        return "你所设定的描述太长了。\n";

                obj->set("long", msg + NOR "\n");
                room->set("waiter/long", msg + NOR "\n");

                room->save();
                return WHT "你为店铺伙计设定好了描述。\n" NOR;

        case "nickname" :
                if (CHINESE_D->check_length(msg) > 20)
                        return "你所设定的描述太长了。\n";

                obj->set("nickname", msg + NOR);
                room->set("waiter/nickname", msg + NOR);

                room->save();
                return WHT "你为店铺伙计设定好了绰号。\n" NOR;

        case "title" :
                if (CHINESE_D->check_length(msg) > 20)
                        return "你所设定的描述太长了。\n";

                obj->set("title", msg + NOR);
                room->set("waiter/title", msg + NOR);

                room->save();
                return WHT "你为店铺伙计设定好了头衔。\n" NOR;

        case "name" :
                if (CHINESE_D->check_length(msg) > 10)
                        return "你所设定的描述太长了。\n";

                if (! is_chinese(msg))
                        return "店铺伙计的姓名只能用中文。\n";

                dbase = obj->query_entire_dbase();
                dbase["name"] = msg;
                
                room->set("waiter/name", msg);

                room->save();
                return WHT "你为店铺伙计设定好了名字。\n" NOR;
        }
        return "你要修改什么？\n";
}

public string do_stock(object ob, object me, string arg)
{
        object goods, obj2;
        int value;
        mapping all_goods, all_goods_num;
        object room;
        
        room = environment(ob);
        
        if (! room->query("shop_type"))
                return "对不起，该店铺目前已经被巫师关闭。\n";

        if (! arg || ! sscanf(arg, "%s value %d", arg, value) == 2) 
                return "指令格式：stock <货物> value * (其中 * 是以铜板作单位的价格)\n";

        if (! value)
                return "指令格式：stock <货物> value * (其中 * 是以铜板作单位的价格)\n";

        if (value > 50000000)
                return "店铺最多标价五千两黄金，你就别那么心黑了吧。\n";

        if (! (goods = present(arg, me)) || ! objectp(goods)) 
                return "你身上并没有这个货物啊！\n";

        if (goods->query("no_sell"))
                return "这个东西太招摇了，还是别拿出来贩卖。\n";

        if (goods->is_character()) 
                return "你不能贩卖活物。\n";

        if (goods->query("money_id")) 
                return "你把钱也拿来出售？\n";

        if (room->query("all_vendor_goods") >= 80) 
                return "你店铺上的东西太多了，先收几种货物再摆吧。\n";

        all_goods = room->query("vendor_goods");

        if (! all_goods)
                all_goods = ([ ]);
 
        all_goods_num = room->query("vendor_goods_num");
 
        if (! all_goods_num)
                all_goods_num = ([ ]);

        all_goods[base_name(goods)] = value;
        all_goods_num[base_name(goods)] += 1;

        room->set("vendor_goods", all_goods);
        room->set("vendor_goods_num", all_goods_num);
        room->add("all_vendor_goods", 1);

        message_vision(HIW "$N" HIW "将『" HIG + goods->name(1) +
                       HIW "』标上" HIY + MONEY_D->price_str(value) +
                       HIW "的价格开始出售。\n" NOR, me);
        room->save();
        if (goods->query_amount() && goods->query_amount() > 1) 
        {
                goods->set_amount((int)goods->query_amount() - 1);
                obj2 = new(base_name(goods));
                obj2->set_amount(1);
                destruct(obj2);
        }
        else destruct(goods);
        return "你摆置好了货物。\n";
}

public string do_unstock(object ob, object me, string arg)
{
        object goods, room;
        int i;
        mapping all_goods, all_goods_num;
        string *goods_key, ob_file;

        room = environment(ob);
        if (! room->query("shop_type"))
                return "对不起，该店铺目前已经被巫师关闭。\n";

        if (! arg)
                return "指令格式：unstock <货物>\n";

        if (! room->query("all_vendor_goods")) 
                return "你现在还没有摆上任何货物。\n";

        all_goods = room->query("vendor_goods");
        all_goods_num = room->query("vendor_goods_num");

        if (sizeof(all_inventory(me)) >= MAX_ITEM_CARRIED)
                return "你身上的东西太多了，没法从货架上取东西。\n";

        all_goods = room->query("vendor_goods");

        if (! all_goods)
                all_goods = ([ ]);

        all_goods_num = room->query("vendor_goods_num");

        if (! all_goods_num)
                all_goods_num = ([ ]);

        goods_key = keys(all_goods);

        if (arrayp(goods_key))
        {
                for (i = 0; i < sizeof(goods_key); i++) 
                {
                        if (goods_key[i]->id(arg)) 
                                ob_file = goods_key[i];
                        else

                        if (filter_color(goods_key[i]->name(1)) == arg) 
                                ob_file = goods_key[i];
                }
        }

        if (! ob_file)
                return "现在" + environment(ob)->short() + "的货架上"
                       "并没有这样货物。\n";

        goods = new(ob_file);

        room->add("all_vendor_goods", -1);
        all_goods_num[base_name(goods)] -= 1;

        if (all_goods_num[base_name(goods)] == 0)
        {
                map_delete(all_goods, base_name(goods));
                map_delete(all_goods_num, base_name(goods));
        }

        message_vision(HIW "$N" HIW "将『" HIG + goods->name(1) +
                       HIW "』从货架上取下来不卖了。\n" NOR, me);
   
        room->set("vendor_goods", all_goods);
        room->set("vendor_goods_num", all_goods_num);
        room->save();

        if (! goods->move(me))
        {
                goods->move(environment(me));
                tell_object(me, "可是你已经拿不动了，只好把" +
                                goods->name(1) + NOR "放在地上。\n");
        }
        return "你取好了货物。\n";
}

public string do_list(object ob, object me, string arg)
{
        mapping goods, goods_num;
        string *gks;
        object room;
        string msg;
        int i;

        mapping price;
        mapping unit;
        mapping count;
        string  short_name;
        string  prefix;
        string  *dk;

        room = environment(ob);
        if (! room->query("shop_type"))
                return "对不起，该店铺目前已经被巫师关闭。\n";

        if (room->query("ban") &&
            member_array(me->query("id"), room->query("ban")) != -1)
                return "你是这家店铺不受欢迎的人物，无法购买东西。\n";

        if (! room->query("all_vendor_goods")) 
                return "现在" + room->short() + "目前并没"
                       "有出售任何货物。\n";

        goods = room->query("vendor_goods");

        if (! goods)
                goods = ([]);

        goods_num = room->query("vendor_goods_num");

        if (! goods_num)
                goods_num = ([]);

        count   = ([]);
        unit    = ([]);
        price   = ([]);
       
        gks = keys(goods);
        for (i = 0; i < sizeof(gks); i++)
        {
                object gob;
                call_other(gks[i], "???");

                if (! objectp(find_object(gks[i])))
                {
                        log_file("user_vendor", sprintf("No found vendo"
                                 "r good:%s\n", gks[i]));
                        continue;
                }

                gob = find_object(gks[i]);
                short_name = gob->name(1) + "(" + gob->query("id") + ")";

                if (gob->query("base_unit"))
                        prefix = "base_";
                else
                        prefix = "";

                unit  += ([ short_name : gob->query(prefix + "unit") ]);
                price += ([ short_name : goods[gks[i]] ]);
                count += ([ short_name : goods_num[gks[i]] ]);
        }

        msg = "该店铺目前出售以下物品：\n";
        msg += "-------------------------------------------------------\n";
        dk = sort_array(keys(unit), 1);

        for (i = 0; i < sizeof(dk); i++)
        {
                int p;
                p = price[dk[i]];
                //msg += sprintf("%" + sprintf("%d", (30 + color_len(dk[i]))) +
                msg += sprintf("%" + sprintf("%d", (30)) +
                               "-s：每%s%s" CYN "(现货%s)\n" NOR, 
                               dk[i], unit[dk[i]], MONEY_D->price_str(p),
                               chinese_number(count[dk[i]]) + unit[dk[i]]);
        }

        msg += "-------------------------------------------------------\n";

        if (me->query("id") == room->query("owner")) 
                msg += "总共" + chinese_number(room->query("all_vendor_goods")) +
                       "件货物。\n";

        if (room->query("invite/" + me->query("id")))
                msg += WHT "您是本店贵宾，购买所有货物均享受"
                       HIW + chinese_number(room->query("invite/" + me->query("id"))) +
                       HIW "折" NOR + WHT "的优惠。\n" NOR;

        return msg;
}       

public int do_buy(object obj, object me, string arg)
{
        mapping goods,goods_num;
        //int amount;
        int value;
        string ob_file, *goods_key;
        object ob;
        //string my_id;
        int i;
        object room;

        room = environment(obj);
        if (! room->query("shop_type"))
        {
               tell_object(me, "对不起，该店铺目前已经被巫师关闭。\n");
               return 1;
        }

        if (room->query("ban") && member_array(me->query("id"), room->query("ban")) != -1)
        {

               tell_object(me, "你是这家店铺不受欢迎的人物，无法购买东西。\n");
               return 1;
        }

        if(me->is_busy())
        {
                tell_object(me, "什么事都得等你忙完再说吧！\n");
                return 1;
        }

        if (! arg)
        {
                tell_object(me, "你要买什么东西？\n");
                return 1;
        }

        if (sizeof(all_inventory(me)) >= MAX_ITEM_CARRIED)
        {
                tell_object(me, "你身上的东西太多了，先处理一下再买东西吧。\n");
                return 1;
        }

        goods = room->query("vendor_goods");

        if (! goods)
                goods = ([ ]);

        goods_num = room->query("vendor_goods_num");

        if (!goods_num)
                goods_num = ([]);

        goods_key = keys(goods);

        if (arrayp(goods_key))
        {
                for (i = 0; i < sizeof(goods_key); i++) 
                {
                        if (goods_key[i]->id(arg)) 
                                ob_file = goods_key[i];
                        else

                        if (filter_color(goods_key[i]->name(1)) == arg) 
                                ob_file = goods_key[i];
                }
        }

        if (! ob_file)
        {
                tell_object(me, "该店铺并没有出售这样货物。\n");
                return 1;
        }

        value = goods[ob_file];

        // 如果是贵宾，则有优惠
        if (room->query("invite/" + me->query("id")))
                value = value * room->query("invite/" + me->query("id")) / 10;

        ob = new(ob_file);
        call_out("destruct_it", 0, ob);
 
        switch (player_pay(me, obj, value))
        {
        case 0:
                tell_object(me, CYN + obj->name(1) + NOR +
                                CYN "冷笑道：穷光蛋，一边呆着去。\n" NOR);
                return 1;

        case 2:
                tell_object(me, CYN + obj->name(1) + NOR +
                                CYN "皱眉道：您还有没有零钱啊？银票我可"
                                "找不开。\n" NOR);
                return 1;

        default:
                if (ob->query_amount())
                {
                        message_vision("$N从$n那里买下了" + ob->short() + "。\n",
                                        me, obj);
                } else
                {
                        message_vision("$N从$n那里买下了一" + ob->query("unit") + 
                                       ob->query("name") + "。\n", me, obj);
                }
 
                ob->move(me, 1);
                goods_num[ob_file] -= 1;

                if (goods_num[ob_file] == 0) 
                {
                        map_delete(goods, ob_file);
                        map_delete(goods_num, ob_file);
                }

                room->set("vendor_goods", goods);
                room->set("vendor_goods_num", goods_num);
                room->add("all_vendor_goods", -1);
        }
        me->start_busy(1);
        room->save();
        return 1;
}

private int player_pay(object who, object target, int amount)
{
        object t_ob, g_ob, s_ob, c_ob, owner;
        int tc, gc, sc, cc, left;
        int v;
        int pay_amount;

        seteuid(getuid());

        if (amount >= 100000 && t_ob = present("cash_money", who))
                tc = t_ob->query_amount();
        else
        {
                tc = 0;
                t_ob = 0;
        }

        if (g_ob = present("gold_money", who))
                gc = g_ob->query_amount();
        else
                gc = 0;

        if (s_ob = present("silver_money", who))
                sc = s_ob->query_amount();
        else
                sc = 0;

        if (c_ob = present("coin_money", who))
                cc = c_ob->query_amount();
        else
                cc = 0;
        
        v = cc + sc * 100 + gc * 10000;

        if (amount < 100000 && v < amount)
        {
                if (present("cash_money", who))
                        return 2;
                else
                        return 0;
        }

        v += tc * 100000;

        if (v < amount) 
                return 0;
        else {
                left = v - amount;
                if (tc)
                {
                        tc = left / 100000;
                        left %= 100000;
                }
                gc = left / 10000;
                left = left % 10000;
                sc = left / 100;
                cc = left % 100;

                if (t_ob && ! g_ob && gc)
                {
                        g_ob = new(GOLD_OB);
                        g_ob->move(who, 1);
                }

                if (t_ob)
                        t_ob->set_amount(tc);

                if (g_ob)
                        g_ob->set_amount(gc);
                else
                        sc += (gc * 100);

                if (s_ob)
                {
                        s_ob->set_amount(sc);
                } else
                if (sc)
                {
                        s_ob = new(SILVER_OB);
                        s_ob->set_amount(sc);
                        s_ob->move(who, 1);
                }

                if (c_ob)
                {
                        c_ob->set_amount(cc);
                } else
                if (cc)
                {
                        c_ob = new(COIN_OB);
                        c_ob->set_amount(cc);
                        c_ob->move(who, 1);
                }

                pay_amount = amount * 99 / 100;

                if (owner = find_player(environment(target)->query("owner")))
                {
                        owner->add("balance", pay_amount);

                        if (query_ip_number(owner) != query_ip_number(who))
                                owner->add("vendor_score", pay_amount / 10000);
                } else
                        environment(target)->add("balance", pay_amount);
                return 1;
        }
}

public string do_jiezhang(object ob, object me)
{
       int amount;
       object room;
        
       room = environment(ob);
       if (! room->query("shop_type"))
               return "对不起，该店铺目前已经被巫师关闭。\n";

       amount = room->query("balance");

       if (amount < 1)
              return "您不在的时候还没有任何的收入。\n";

       me->add("balance", amount);
       me->add("vendor_score", amount / 10000);

       tell_object(me, HIY "您不在线时共有" + MONEY_D->price_str(amount) +
                       HIY "的收入，现已全部转入您的银号。\n");
       room->set("balance", 0);
       room->save();
       return "结帐完毕，请即时核对数目。\n";
}

public string list_invite(object ob, object me)
{
        int i;
        string msg, *invite_key;
        mapping invite;
        object room;
        
        room = environment(ob);
        if (! room->query("shop_type"))
                return "对不起，该店铺目前已经被巫师关闭。\n";

        invite = room->query("invite");

        if (! invite || sizeof(invite) < 1)
                return "您并没有设定任何的贵宾。\n";

        msg = HIC "您所定义的贵宾有以下几位：\n" NOR;
        msg += HIC "≡" HIY "────────────" HIC "≡\n" NOR;
        invite_key = sort_array(keys(invite), 1);

        for (i = 0; i < sizeof(invite_key); i++)
        {
                msg += sprintf(CYN "%-20s  " WHT "%s折\n" NOR,
                               invite_key[i], chinese_number(invite[invite_key[i]]));
        }

        msg += HIC "≡" HIY "────────────" HIC "≡\n" NOR;
        msg += HIC "总共有 " HIY + sizeof(invite) + HIC " 个贵宾。\n" NOR;
        return msg;
}

public string do_invite(object ob, object me, string arg)
{
        int num;
        object room;

        room = environment(ob);

        if (! room->query("shop_type"))
                return "对不起，该店铺目前已经被巫师关闭。\n";

        if (! sscanf(arg, "%s %d", arg, num) == 2)
                return "指令格式：invite <id> <折数>\n";

        if (num < 1 || num > 10)
                return "指令格式：invite <id> <折数>\n";

        if (num == 10)
        {
                if (! room->query("invite/" + arg))
                        return CYN + ob->name(1) + NOR + CYN "对你说道：老"
                               "板，那 " + arg + " 本来就不是我们店的贵宾啊。"
                               "\n" NOR;

                room->delete("invite/" + arg);
                room->save();
                return CYN + ob->name(1) + NOR + CYN "翻开帐簿划了划，奸"
                       "笑道：老板，已经按照你的吩咐取消掉 " + arg + " 的贵"
                       "宾资格了。\n" NOR;
        }

        if (sizeof(room->query("invite")) >= 30)
                return "您已经设定了三十个贵宾，把不常来的先划掉吧。\n";

        room->set("invite/" + arg, num);
        room->save();

        return CYN + ob->name(1) + NOR + CYN "翻开帐簿边写边说道：老板，已"
               "经按照你的吩咐对 " WHT + arg + CYN " 实行" + HIY + chinese_number(num) +
               "折" + NOR + CYN "优惠。\n" NOR;
}

public string list_ban(object ob, object me)
{
        int i;
        string msg, *ban;
        object room;
        
        room = environment(ob);

        if (! room->query("shop_type"))
               return "对不起，该店铺目前已经被巫师关闭。\n";

        ban = room->query("ban");

        if (! ban || sizeof(ban) < 1)
        {
                msg = "您并没有设定任何的黑户。\n";
                return msg;
        }
        msg = HIC "您所定义的黑户有如下玩家：\n" NOR;
        msg += HIC "≡" HIY "────────────" HIC "≡\n" NOR;
        for (i = 0;i < sizeof(ban);i++)
        {
                msg += sprintf(CYN "  %s\n" NOR, ban[i]);
        }
        msg += HIC "≡" HIY "────────────" HIC "≡\n" NOR;
        msg += HIC "总共有 " HIY + sizeof(ban) + HIC " 个黑户。\n" NOR;        
        return msg;
}

public string do_ban(object ob, object me, string arg)
{
        string the_id, type, *ban;
        object room;
        
        room = environment(ob);

        if (! room->query("shop_type"))
               return "对不起，该店铺目前已经被巫师关闭。\n";
        
        ban = room->query("ban");

        if (! ban)
                ban = ({ });

        if (sscanf(arg, "%s %s", type, the_id) == 2 && type == "-")
        {
                if (member_array(the_id, ban) == -1)
                        return CYN + ob->name(1) + NOR + CYN "对你说道：老"
                               "板，那 " + arg + " 本来就不是我们店的黑户啊。"
                               "\n" NOR;

                ban -= ({ the_id });
                room->set("ban", ban);
                room->save();
                return CYN + ob->name(1) + NOR + CYN "翻开帐簿划了划，对你"
                       "赔笑道：老板，已经取消了 " + the_id + " 黑户身份。\n";
        }
        
        if (member_array(arg, ban) != -1)
                return CYN + ob->name(1) + NOR + CYN "奸笑着道：老板，您忘"
                       "记了？那" + arg + "早已被列为黑户啦。\n" NOR;

        if (sizeof(ob->query("ban")) >= 30)
                return "您已经设定了三十个黑户，还是先划掉一些吧。\n";

        ban += ({ arg });
        room->set("ban", ban);
        room->save();
        return CYN + ob->name(1) + NOR + CYN "翻开帐簿边写边说道：老板，已"
               "经按照你的吩咐将 " WHT + arg + CYN " 列为了黑户。\n";
}

private void destruct_it(object ob)
{
        if (! ob || environment(ob))
                return;

        destruct(ob);
}
