// tianwangdian.c
// Date: Nov.1997 by Venus
#include <room.h>
inherit ROOM;
void create()
{
        set("short", "天王殿");
        set("long", @LONG
走进大殿，只见正面坐着袒胸露腹的弭勒佛，两旁是四大天王，
後面是神态威严的韦驮菩萨。天王殿後面便是大雄宝殿。
LONG);
        set("exits", ([
                "out"       : __DIR__"lingyinsi",
                "north"     : __DIR__"dxbaodian1",
        ]));
        set("outdoors", "hangzhou");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
