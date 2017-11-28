#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "石廪峰");
        set("long",  @LONG
芙蓉峰是衡山五峰之一，每逢下雨的时候，雨水打在峰中
的岩石上，发出巨大的回声，声音洪亮，犹如书院中的读书声，
是以该峰由此而来，衡山派的石廪剑法也由此而悟。
LONG);

        set("exits", ([
                "westdown"   : __DIR__"liuyunping",
        ]));

        set("objects", ([
		__DIR__"npc/dizi1" : 2,
        ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

