#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "极高明台");
        set("long", 
"这里是福严寺最高处。唐邺侯李泌手书「" HIW "极高明" NOR "」"
"三个大\n字于此，意即佛相极高(高无见顶相)，佛光极明(明不借"
"他光)\n，佛是至高无上的，故曰极高明台。\n"
);
        set("exits", ([ 
               "northdown"  : __DIR__"sansheng",
        ]));

        set("objects", ([
                __DIR__"npc/youke" : 4,
        ]));    

        set("outdoors", "henshan");

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

