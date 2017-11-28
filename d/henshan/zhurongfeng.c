#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "祝融峰");
        set("long",
"祝融峰之高为衡山大四绝之首。在此俯瞰群峰，尽收眼底。\n"
"东望湘江，南及五岭，北瞰洞庭，西视雪山。唐朝杜甫望岳诗"
"\n中有「" HIW "祝融五峰尊，峰峰次低昂" NOR "」。著名诗人韩"
"愈亦以「" HIW "祝融\n万丈拔地起，欲见不见轻烟里" NOR "」"
"极言其高。\n");
        set("exits", ([
                "eastdown"   : __DIR__"shanlu004",
        ]));

        set("objects", ([
                CLASS_D("henshan") + "/mo" : 1,
        ]));    

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

