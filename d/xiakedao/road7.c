// Room: /d/xiakedao/road7.c
  
#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "夹鳖石");
        set("long", @LONG
这里便是夹鳖石。此处山势陡峭，行人到此无不心惊胆颤，不敢
大声说话，只求平安过去。登山的人一个不小心，很容易便会跌堕到
崖谷之中。
LONG );
        set("outdoors", "xiakedao");
        set("exits", ([
                "southup"   : __DIR__"road8",
                "northdown" : __DIR__"road6",
        ]));
        set("outdoors", "xiakedao");
        setup();
        replace_program(ROOM);
}
