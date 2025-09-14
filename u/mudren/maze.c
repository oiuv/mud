#include <ansi.h>

inherit ROOM;

void setDemon(object me);
void setInventory(int x, int y, int z);

varargs void create(int x, int y, int z)
{
    set("short", "心魔幻境");
    set("long", "这里是你的心魔幻境，无边无际，四周灰蒙蒙的，也不知道这里会有什么危险。\n");
    set("maze", "maze");
    setArea("maze", x, y, z);
    set("valid_startroom", 1);
    set("exits", ([
        "north":__DIR__ "maze/" + x + "," + (y + 1) + "," + z,
        "south":__DIR__ "maze/" + x + "," + (y - 1) + "," + z,
        "west":__DIR__ "maze/" + (x - 1) + "," + y + "," + z,
        "east":__DIR__ "maze/" + (x + 1) + "," + y + "," + z,
    ]));
    if (random(3))
    {
        removeRandomExit();
        // 随机关闭第二个出口
        if (random(2))
        {
            removeRandomExit();
        }
    }

    if (!random(20))
    {
        set("long", "这里是无边无际的幻境，在这单调的幻境中有一个闪闪发光的传送门（door），显得格外醒目。\n");
        set("item_desc", ([
            "door":"离开(out)心魔幻境的传送门！\n",
        ]));
        set("exits/out", "/d/city/wumiao2");
    }

    setInventory(x, y, z);
}

void setInventory(int x, int y, int z)
{
    mapping inv = ([]);

    if (!random(10))
    {
        inv["/clone/misc/yinzongxiang"] = 1;
    }

    if (!random(20))
    {
        inv["/clone/misc/yinzongxiang"] = 2;
    }

    if (!random(30))
    {
        inv["/clone/misc/yinzongxiang"] = 3;
    }

    if (!random(50))
    {
        inv["/clone/misc/yinzongxiang"] = 5;
    }

    if (!random(100))
    {
        inv["/clone/misc/yinzongxiang"] = 10;
    }

    set("objects", inv);
    setup();
}

void setDemon(object me)
{
    int exp, level;
    object ob;
    // 十分之一机率
    string *ob1_list = ({
        "/d/beijing/npc/dan/danA_5.c",
        "/d/beijing/npc/dan/danB_6.c",
        "/d/beijing/npc/dan/danC_5.c",
        "/d/beijing/npc/dan/danD_6.c",
        "/d/beijing/npc/dan/danM_9.c",
        "/d/beijing/npc/dan/danS_1.c",
        "/d/beijing/npc/dan/danS_2.c",
        "/d/beijing/npc/dan/danS_4.c",
        "/d/beijing/npc/dan/danS_4.c",
        "/d/beijing/npc/dan/danS_5.c",

        "/clone/fam/pill/full1",
        "/clone/fam/pill/linghui1",
        "/clone/fam/pill/linghui2",
        "/clone/fam/pill/puti1",
        "/clone/fam/pill/sheli1",
        "/clone/fam/pill/neili1",
        "/clone/fam/etc/va1",
        "/clone/fam/etc/va2",
        "/clone/fam/etc/va3",
        "/clone/fam/etc/va4",
        "/clone/fam/etc/va5",
        "/clone/fam/etc/va6",

        "/clone/misc/yinzongxiang",
    });

    // 三十分之一机率
    string *ob2_list = ({
        "/clone/fam/pill/puti2",
        "/clone/fam/pill/sheli2",
        "/clone/fam/pill/linghui2",
        "/clone/fam/pill/food1",
        "/clone/fam/pill/neili2",

        "/clone/misc/yinzongxiang",
    });

    // 五十分之一机率
    string *ob3_list = ({
        "/clone/fam/pill/puti3",
        "/clone/fam/pill/sheli3",
        "/clone/gift/cdiamond",
        "/clone/gift/cagate",
        "/clone/gift/ccrystal",
        "/clone/gift/cjade",

        "/clone/misc/yinzongxiang",
    });

    // 一百分之一机率
    string *ob4_list = ({
        "/clone/fam/pill/puti4",
        "/clone/fam/pill/sheli4",
        "/clone/fam/gift/str1",
        "/clone/fam/gift/int1",
        "/clone/fam/gift/con1",
        "/clone/fam/gift/dex1",
        "/clone/fam/item/handan",
        "/clone/fam/item/bixue",
        "/clone/fam/item/zijin",
        "/clone/fam/item/wujin",
        "/clone/fam/item/taijin",
        "/clone/fam/pill/renshen1",
        "/clone/fam/pill/lingzhi1",
        "/clone/fam/pill/xuelian1",

        "/clone/misc/yinzongxiang",
    });

    // 两百分之一机率
    string *ob5_list = ({
        "/clone/fam/etc/lv5a",
        "/clone/fam/etc/lv5b",
        "/clone/fam/etc/lv5c",
        "/clone/fam/etc/lv5d",
        "/clone/fam/etc/lv5e",
        "/clone/fam/pill/renshen2",
        "/clone/fam/pill/lingzhi2",
        "/clone/fam/pill/xuelian2",

        "/clone/misc/yinzongxiang",
    });

    // 三百分之一机率
    string *ob6_list = ({
        "/clone/fam/gift/str2",
        "/clone/fam/gift/int2",
        "/clone/fam/gift/con2",
        "/clone/fam/gift/dex2",
        "/clone/fam/pill/renshen3",
        "/clone/fam/pill/lingzhi3",
        "/clone/fam/pill/xuelian3",
        "/clone/fam/item/zhenlong",
        "/clone/fam/item/jiulei",

        "/clone/misc/yinzongxiang",
    });

    // 四百分之一机率
    string *ob7_list = ({
        "/clone/tattoo/buttock1",
        "/clone/tattoo/buttock2",
        "/clone/tattoo/buttock3",
        "/clone/tattoo/buttock4",
        "/clone/tattoo/buttock5",
        "/clone/tattoo/buttock6",
        "/clone/tattoo/buttock7",
        "/clone/tattoo/buttock8",

        "/clone/misc/yinzongxiang",
    });

    // 五百分之一机率
    string *ob8_list = ({
        "/clone/fam/gift/str2",
        "/clone/fam/gift/int2",
        "/clone/fam/gift/con2",
        "/clone/fam/gift/dex2",
        "/clone/fam/pill/renshen3",
        "/clone/fam/pill/lingzhi3",
        "/clone/fam/pill/xuelian3",
        "/clone/fam/etc/lv7a",
        "/clone/fam/etc/lv7b",
        "/clone/fam/etc/lv7c",
        "/clone/fam/etc/lv7d",

        "/clone/misc/yinzongxiang",
    });

    // 六百分之一机率
    string *ob9_list = ({
        "/clone/tattoo/body1",
        "/clone/tattoo/body2",
        "/clone/tattoo/body3",
        "/clone/tattoo/body4",
        "/clone/tattoo/body5",
        "/clone/tattoo/body6",
        "/clone/tattoo/body7",
        "/clone/tattoo/body8",
        "/clone/tattoo/body9",
        "/clone/tattoo/body10",

        "/clone/misc/yinzongxiang",
    });

    // 七百分之一机率
    string *ob10_list = ({
        "/clone/fam/pill/yulu",
        "/clone/fam/pill/dimai",
        "/clone/fam/pill/renshen4",
        "/clone/fam/pill/lingzhi4",
        "/clone/fam/pill/xuelian4",
        "/clone/fam/item/baxian",
        "/clone/fam/item/kunlun",
        "/clone/fam/item/haoyue",
        "/clone/fam/item/leihuo",
        "/clone/fam/item/yinzhu",

        "/clone/misc/yinzongxiang",
    });

    // 八百分之一机率
    string *ob11_list = ({
        "/clone/tattoo/spcs1",
        "/clone/tattoo/spcs2",
        "/clone/tattoo/spcs3",
        "/clone/tattoo/spcs4",
        "/clone/tattoo/spcs5",
        "/clone/tattoo/spcs6",
        "/clone/tattoo/spcs7",
        "/clone/tattoo/spcs8",
        "/clone/tattoo/spcs9",
        "/clone/tattoo/spcs10",

        "/clone/misc/yinzongxiang",
    });

    // 九百分之一机率
    string *ob12_list = ({
        "/clone/fam/skpaper/blade1",
        "/clone/fam/skpaper/claw1",
        "/clone/fam/skpaper/club1",
        "/clone/fam/skpaper/cuff1",
        "/clone/fam/skpaper/dagger1",
        "/clone/fam/skpaper/finger1",
        "/clone/fam/skpaper/hammer1",
        "/clone/fam/skpaper/hand1",
        "/clone/fam/skpaper/parry1",
        "/clone/fam/skpaper/staff1",
        "/clone/fam/skpaper/strike1",
        "/clone/fam/skpaper/sword1",
        "/clone/fam/skpaper/throwing1",
        "/clone/fam/skpaper/unarmed1",
        "/clone/fam/skpaper/whip1",

        "/clone/misc/yinzongxiang",
    });

    // 千分之一机率
    string *ob13_list = ({
        "/clone/fam/gift/str3",
        "/clone/fam/gift/int3",
        "/clone/fam/gift/con3",
        "/clone/fam/gift/dex3",
        "/clone/fam/item/yanluo",
        "/clone/fam/item/lihuo",
        "/clone/fam/item/qiankun_stone",

        "/clone/misc/yinzongxiang",
    });

    exp = me->query("combat_exp") * 10;
    level = to_int(pow(to_float(exp), 1.0 / 3)) / 10 + 1;

    ob = new (CLASS_D("generate") + "/demon.c");
    NPC_D->set_from_me(ob, me, 120);
    ob->set_temp("level", level);
    ob->add_temp("apply/attack", ob->query_skill("force", 1) * (level - 1) / 15);
    ob->add_temp("apply/dodge", ob->query_skill("force", 1) * (level - 1) / 15);
    ob->add_temp("apply/parry", ob->query_skill("force", 1) * (level - 1) / 15);
    ob->add_temp("apply/damage", 5 + level * 7);
    ob->add_temp("apply/unarmed_damage", 5 + level * 7);
    ob->add_temp("apply/armor", 10 + level * 15);

    if (!random(10))
    {
        ob->carry_object(element_of(ob1_list));
    }
    if (!random(30))
    {
        ob->carry_object(element_of(ob2_list));
    }
    if (!random(50))
    {
        ob->carry_object(element_of(ob3_list));
    }
    if (!random(100))
    {
        ob->carry_object(element_of(ob4_list));
    }
    if (!random(200))
    {
        ob->carry_object(element_of(ob5_list));
    }
    if (!random(300))
    {
        ob->carry_object(element_of(ob6_list));
    }
    if (!random(400))
    {
        ob->carry_object(element_of(ob7_list));
    }
    if (!random(500))
    {
        ob->carry_object(element_of(ob8_list));
    }
    if (!random(600))
    {
        ob->carry_object(element_of(ob9_list));
    }
    if (!random(700))
    {
        ob->carry_object(element_of(ob10_list));
    }
    if (!random(800))
    {
        ob->carry_object(element_of(ob11_list));
    }
    if (!random(900))
    {
        ob->carry_object(element_of(ob12_list));
    }
    if (!random(1000))
    {
        ob->carry_object(element_of(ob13_list));
    }
    ob->move(environment(me));
}

void init()
{
    object me = this_player();
    object ob = next_inventory(me);
    if (interactive(me) && (!objectp(ob) || !living(ob)) && !random(5))
    {
        setDemon(me);
    }
}
