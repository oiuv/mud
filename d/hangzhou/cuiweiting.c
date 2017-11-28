#include <room.h>
inherit ROOM;

void create()
{
        set("short", "翠微亭");
        set("long", @LONG
翠微亭建在飞来峰的半山腰间，乃是名将韩世忠为纪念岳飞而建
的。岳飞有“经年尘土满征衣，特特寻芳上翠微”的诗句，故此亭名
为“翠微”。西边是下山的路。
LONG);
        set("exits", ([
                "west"  : __DIR__"qinglindong",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "hangzhou");
        setup();
        replace_program(ROOM);
}
