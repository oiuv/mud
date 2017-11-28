#include <room.h>
#include <ansi.h>
#include <getconfig.h>
inherit ROOM;

int do_look(string arg);

void create()
{
        set("short", "英雄会馆");
        set("long", @LONG
英雄会馆也是凤老爷的家业。常来这里的人，都是有能耐
有来头的。英雄会馆里围着黑压压的一群人，南方有一扇紧紧
关闭的小门。只有在每月一次的店铺拍卖时「南霸天」凤天南
才会将它打开，在那里会见各处的商贾。小门旁挂着的一块红
木牌子(paizi)上标写着各家店铺拍卖的底价。
LONG);

        set("no_fight", 1);
        set("no_beg", 1);
        set("no_steal", 1);

        set("exits", ([
               "north" : __DIR__"street2",
        ]));

        set("objects", ([
                __DIR__"npc/fengyiming" : 1,
        ]));

        set("no_clean_up", 0);
        setup();
}

void init()
{
        add_action("do_look", "look");

        if (wiz_level(this_player()) >= 3)
        {
                add_action("do_open", "open");
                add_action("do_close", "close");
        }
}

int valid_leave(object me, string dir)
{
        if (query("exits/south"))
        {
                if ((me->query("balance") < 5000000
                   || me->query("weiwang") < 3000)
                   && dir == "south" && ! wizardp(me))
                        return notify_fail(CYN "凤一鸣拦住你，冷笑道：以阁下的财"
                                           "产和地位，尚不足以进去。\n" NOR);
        }
        return ::valid_leave(me);
}

int do_open()
{
        object me = this_player();

        if (query("exits/south"))
                return notify_fail("门已经是开着的了。\n");

        set("exits/south", __DIR__"pmc");

        message_vision(HIY "$N" HIY "轻轻一推，将通向英雄会馆的"
                       "小门开启了。\n" NOR, me);

        shout(HIY "【商界传闻】" NOR + WHT + me->name() + WHT "[" +
              me->query("id") + WHT "]开启了佛山英雄会馆的店铺拍"
              "卖会的大门。\n" NOR);

        write("你开通了店铺拍卖会的路径。\n");
        return 1;
}

int do_close()
{
        object me = this_player();

        if (! query("exits/south"))
                return notify_fail("门已经是关着的了。\n");

        delete("exits/south");
        message_vision(WHT "$N" WHT "顺手一带，将通向拍卖后厅的"
                       "小门关上了。\n" NOR, me);
        return 1;
}

int do_look(string arg)
{
        int i, g;
        string msg;
        mapping *shop_record;

        if (arg != "paizi")
                return 0;

        if (! query("exits/south"))
        {
                write("现在尚未到拍卖店铺的时间。\n");
                return 1;
        }

        shop_record = SHOP_D->query_shop();

        msg = LOCAL_MUD_NAME() + "店铺拍卖底价表：\n"NOR;
        msg += HIY "┌─────────────────────────┐\n" NOR;

        msg += sprintf(HIY "│" NOR + WHT " %-18s%-18s%-13s" HIY "│\n" NOR,
                       "店铺位置",
                       "店铺名称",
                       "拍卖底价");

        msg += HIY "├─────────────────────────┤\n" NOR;

        for (i = 0; i < sizeof(shop_record); i++)
        {
                g = shop_record[i]["price"];
                msg += sprintf(HIY "│" HIC " %s店铺           "
                               HIG "%-16s" NOR +
                               YEL "黄金" + chinese_number(g) +
                               "两    " HIY "│\n" NOR,
                               shop_record[i]["id"],
                               shop_record[i]["name"]);
        }
        msg += HIY "└─────────────────────────┘\n" NOR;
        msg += WHT "总共有" + chinese_number(sizeof(shop_record)) +
               WHT "家店铺等待拍卖。\n";
        write(msg);
        return 1;
}
