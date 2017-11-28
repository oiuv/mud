#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "禅室");
        set("long", @LONG
这里是僧人门参禅打坐的地方。侧壁一列禅床让人看了就
想到该想的事。正对门的墙上有个黄铜轮盘(lunpan)，上面刻
着些希奇古怪的花纹，不知是什么意思。
LONG);
        set("no_fight", 1);
        set("sleep_room", 1);
        set("no_steal", 1);

        set("exits", ([
                "east"  : __DIR__"tiantai",
                "south" : __DIR__"houdian",
        ]));

        set("item_desc", ([
                "lunpan": YEL "\n这是一个由黄铜所铸的大轮盘，轮盘上面"
                          "刻着许多希奇古怪的花\n纹，全是和风水有关。"
                          "看样子你可以转(turn)动它。\n" NOR,
        ]));

        setup();
}

void init()
{
        add_action("do_turn", "turn");
}

int do_turn(string arg)
{
        object me = this_player();

        if (! arg || arg != "lunpan")
                return notify_fail("你要转动什么？\n");

        message_vision(HIY "\n$N" HIY "使劲转动轮盘，地面忽然「喀喀喀」现"
                       "出一个洞口。\n\n" NOR, me);
        set("exits/down", __DIR__"midao");
        remove_call_out("close");
        call_out("close", 8, this_object());

        return 1;
}

void close(object room)
{
        message("vision", WHT "地面忽然「喀喀喀」缩回原地，把密道的入口挡"
                          "住了。\n" NOR, room);
        room->delete("exits/down");
}
