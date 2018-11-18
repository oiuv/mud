#include <ansi.h>
inherit ROOM;

int is_chat_room()
{
	return 1;
}

void create()
{
        set("short", "客店茶房");
        set("long", @LONG
这里是扬州客栈的茶园，有许多无所事事的人都爱呆在这
里，店小二穿梭在客人中间，忙个不停。许多商人小贩也喜欢
在这里向大家兜售货物。
LONG);
        set("no_fight", 1);
        set("can_trade", 1);
        set("no_sleep_room", 1);
        set("objects",([
                "/clone/food/peanut":5,
                "/clone/game/fruit":1,
                "/clone/game/mint":1,
                //"/adm/npc/horseboss":1,
                //__DIR__"npc/yanruyu":1,
							  __DIR__"npc/qichangfa":1,
        ]));
        set("exits", ([
                "north" : __DIR__"kedian",
                "east" : __DIR__"qiyuan/qiyuan1",
        ]));

        setup();
        replace_program(ROOM);
}
