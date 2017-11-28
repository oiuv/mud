#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "望月台");
        set("long", 
"望月台是祝融殿后一高耸巨石。每当夜籁，皓月当空，犹\n如玉盘冰"
"轮，漫洒万里清辉，清冷月色，辉映低昂的群峰。此\n时浩然万里，举"
"七十二峰，峰峰贮冰壶中，始信下方无此月也。\n前人因此有诗「" HIW ""
"人间朗魄已皆尽，此地清光犹未低。" NOR "」\n"
);
        set("exits", ([
               "southup"    : __DIR__"zhurongdian",
        ]));

        set("objects", ([
                __DIR__"npc/youke"    : 3,
        ]));    

        set("outdoors", "henshan");

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

