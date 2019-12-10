#include <ansi.h>
inherit ITEM;

#define VA_DIR          "/clone/fam/etc/"
#define GIFT_DIR        "/clone/fam/pill/"

// 贵重物品列表
string *VA_LIST = ({ "va1", "va2", "va3", "va4", "va5", "va6", });

// 普通物品列表
string *NORMAL_LIST = ({ "food1", "full1", "linghui1", "linghui2",
                         "lingzhi1", "lingzhi2", "neili1", "neili2",
                         "puti1", "puti2", "renshen1", "renshen2",
                         "sheli1", "sheli2", "xuelian1", "xuelian2", });

// 特殊物品列表
string *SM_LIST = ({ "dimai", "yulu", "lingzhi3", "lingzhi4",
                     "puti3", "puti4", "renshen3", "renshen4",
                     "sheli3", "sheli4", "xuelian3", "xuelian4",});

void create()
{
        set_name(WHT "包裹" NOR, ({ "bag", "baoguo", "bao", "guo" }));
        set_weight(200);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "个");
                set("long", WHT "这是一个灰布包裹，里面胀鼓鼓的，不知装"
                            "了些什么。\n" NOR);
                set("no_sell", 1);
                set("value", 500);
                set("material", "cloth");
        }
        set("gift_count", 1);
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
                write("包裹里面什么也没有了。\n");
                return 1;
        }

        me = this_player();
        message_vision(WHT "\n$N" WHT "拆开包裹，发现里面留有张"
                       "字条，写着「" HIR "师门急事，请火速赶回"
                       NOR + WHT "」。\n除此之外字条下好象还压"
                       "着什么东西，被裹得很严密，$N" WHT "见状"
                       "连忙取出。\n" NOR, me);

        if (random(5) <= 3)
                gift = new(VA_DIR + VA_LIST[random(sizeof(VA_LIST))]);
        else
        if (random(50) == 1)
                gift = new(GIFT_DIR + SM_LIST[random(sizeof(SM_LIST))]);
        else
                gift = new(GIFT_DIR + NORMAL_LIST[random(sizeof(NORMAL_LIST))]);

        if (gift->query("base_unit"))
                un = gift->query("base_unit");
        else
                un = gift->query("unit");

        tell_object(me, HIC "你获得了一" + un + HIC "「" + gift->name() +
                        HIC "」。\n" NOR);

        gift->move(me, 1);
        add("gift_count", -1);
        set("long", WHT "这是一个灰布包裹，里面的东西已经被取出来了。\n" NOR);
        set("value", 0);
        return 1;
}
