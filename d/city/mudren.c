/*
 * @Author: 雪风@mud.ren
 * @Date: 2021-06-15 21:54:26
 * @LastEditTime: 2021-08-21 15:47:10
 * @LastEditors: 雪风
 * @Description: 特殊区域
 *  https://bbs.mud.ren
 */
#include <ansi.h>
inherit ROOM;

void create()
{
    set("short", HIG "武林外传" NOR);
    set("long", @LONG
武林外传是炎黄群侠传中为大家提供休闲娱乐服务的组织，这里是办公
区，这里由游戏管理员雪风负责，话说在酒楼长租办公区真是够奢侈的，也
不明白他究竟在干些什么。你可以看见在右边有一个奇怪的传送门（door），
左边有一个服务台（serve）。
LONG );
    set("no_fight", 1);
    set("item_desc", ([
                "door"  : HIW "〖武林外传〗"NOR+HIY"这是通向新世界的大门，你可以进去(enter)看看。\n" NOR,
                "serve" : "服务台上写着：\n"
                        "    广大的泥友们，你们好！\n"
                        "    欢迎访问--bbs.mud.ren\n"
                        "                                         秋林拾叶\n\n",
    ]));
    set("objects", ([
        __DIR__"npc/mudren-mm" : 2,
        // "/u/mudren/obj/poem_book.c" : 1,
        // "/u/mudren/obj/idiom_book.c" : 1,
    ]));
    set("exits", ([
        "south" : __DIR__"zuixianlou",
        "enter" : ([ "filename" : _DIR_AREA_"1/wild.c",
                     "x_axis" : 55,
                     "y_axis" : 5,
                ]),
    ]));
    setup();
    "/clone/board/mudren_b"->foo();
    replace_program(ROOM);
}

// int valid_leave(object me, string dir)
// {
//     object ob = this_player();

//     if (dir == "enter" && ob->query("id") != "mudren")
//         return notify_fail(HIW "你感觉前方有一种奇异的力场拦住了你的去路。\n" NOR);

//     return ::valid_leave(me, dir);
// }
