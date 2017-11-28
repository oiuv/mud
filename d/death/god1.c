// Room: god1

#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", HIY"天堂"NOR);
        set("long", HIC @LONG
这里就是天堂。祥云朵朵，色泽洁白无瑕，慢慢从你眼前飘过，那翠绿色一
片的草地上开满了色彩各异的鲜花，香气缭绕不散，闻着看着，你都快要醉了。
远处一栋洁白的宫殿，巍然耸入云霄，从那儿传来阵阵仙乐，音律和祥悦耳，听
着听着，你觉得自己的心灵都已得了到净化，从此脱离了凡尘俗世……。这儿的
一切都令你觉得安然、陶醉、宁静、和祥……
LONG
NOR   );
        setup();
}

void reset()
{
        ::reset();
        set("exits", ([ /* sizeof() == 2 */
            "up" : __DIR__"god2",
            "down": "/d/city/wumiao",
        ]));
}

