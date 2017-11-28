#include <ansi.h>
inherit ITEM;

// GIFT为礼盒中物品的数量
#define GIFT            5
#define VA_DIR          "/clone/fam/etc/"
#define GIFT_DIR        "/clone/fam/pill/"
#define SP_DIR          "/clone/fam/gift/"

// 贵重物品列表
string *VA_LIST = ({ "va1", "va2", "va3", "va4", "va5", "va6", });
string *VA_LIST2 = ({ "lv5a", "lv5b", "lv5c", "lv5d", "lv5e", });

// 普通物品列表
string *NORMAL_LIST = ({ "food1", "full1", "linghui1", "linghui2",
                         "lingzhi1", "lingzhi2", "neili1", "neili2",
                         "puti1", "puti2", "renshen1", "renshen2",
                         "sheli1", "sheli2", "xuelian1", "xuelian2", });

// 特殊物品列表
string *SM_LIST = ({ "dimai", "yulu", "lingzhi3", "lingzhi4",
                     "puti3", "puti4", "renshen3", "renshen4",
                     "sheli3", "sheli4", "xuelian3", "xuelian4", });

// 珍稀物品列表
string *SP_LIST = ({ "con1", "con2", "dex1", "dex2",
                     "int1", "int2", "str1", "str2", });

void create()
{
        set_name(HIY "礼盒" NOR, ({ "li he", "lihe", "he", "box" }));
        set_weight(200);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "个");
                set("long", HIG "这是一个包装精美的礼盒，里面好像有东西，不知装"
                            "了些什么。\n" NOR);
                set("no_drop", 1);
                set("no_sell", 1);
                set("value", 500);
                set("material", "cloth");
        }
        set("gift_count", GIFT);
}

void init()
{
        if (this_player() == environment())
        {
                add_action("do_open", "open");
                add_action("do_open", "unpack");
                add_action("do_open", "dakai");
        }
}

int do_open(string arg)
{
        object me, gift;
        string un;

        if (! arg || ! id(arg))
                return 0;

        if (query("gift_count") < 1)
        {
                write("礼盒里面什么也没有了。\n");
                return 1;
        }

        me = this_player();
        if (query("gift_count") == GIFT)
            message_vision(WHT "\n$N" WHT "拆开礼盒，发现里面留有张"
                           "字条，写着「" HIR "祝游戏快乐"
                           NOR + WHT "」。除此之\n外字条下好象还压"
                           "着一些东西，被裹得很严密，$N" WHT "见状"
                           "连忙取出。\n" NOR, me);

        else
            message_vision(WHT "\n$N" WHT "打开礼盒，发现里面还有"
                           "东西，$N" WHT "乐呵呵的"
                           "取了出来。\n" NOR, me);

        if (random(30) >= me->query_kar())
                gift = new(VA_DIR + VA_LIST[random(sizeof(VA_LIST))]);
        else
        if (random(2) == 1)
                gift = new(GIFT_DIR + NORMAL_LIST[random(sizeof(NORMAL_LIST))]);
        else
        if (random(2) == 1)
                gift = new(GIFT_DIR + SM_LIST[random(sizeof(SM_LIST))]);
        else
        if (random(5) <= 3)
                gift = new(VA_DIR + VA_LIST2[random(sizeof(VA_LIST2))]);
        else
        if (random(5) <= 3)
                gift = new(SP_DIR + SP_LIST[random(sizeof(SP_LIST))]);
        else
                gift = new("/clone/fam/gift/perwan");

        if (gift->query("base_unit"))
                un = gift->query("base_unit");
        else
                un = gift->query("unit");

        tell_object(me, HIC "你获得了一" + un + HIC "「" + gift->name() +
                        HIC "」。\n" NOR);

        gift->move(me, 1);
        add("gift_count", -1);
        if (query("gift_count") < 1)
        {
            set("long", WHT "这是一个已被拆开的礼盒，里面空空的。\n" NOR);
            set("value", 0);
            set("no_drop", 0);
        }
        return 1;
}
