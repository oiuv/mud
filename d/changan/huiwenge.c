//Room: huiwenge.c

#include <ansi.h>

inherit ROOM;

void create ()
{
        set ("short", "汇文阁");
        set ("long", 
"这是一家书局。大堂里摆了一排排的书柜，书架上整整齐齐地放着\n"
"一些卷轴，堂内还悬挂着几盆花花草草，红绿相间，疏密有致，令人赏\n"
"心悦目。进来就可以看到一额横匾:\n"
HIB"         书山有径勤为路\n"NOR
HIB"         学海无涯苦做舟\n\n"NOR
        );
        set("exits", 
        ([ //sizeof() == 1
                "west" : __DIR__"yongtai-dadao3",
        ]));
        set("objects", 
        ([ //sizeof() == 1
        	__DIR__"npc/shuchi" : 1,
        ]));

        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
