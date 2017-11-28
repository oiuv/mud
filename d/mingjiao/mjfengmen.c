// Room: /d/mingjiao/mjfengmen.c
// Date: Java 97/05/11

#include <room.h>
inherit ROOM;

void create()
{
    set("short", "竹林");
    set("long", @LONG
这是一条碎石铺成的小道，曲曲折折地通向前方。两边是
密密的竹林。这里人迹罕至，惟闻足底叩击路面，僧敲木鱼声，
道颂道德经，微风吹拂竹叶，如簌簌禅唱。令人尘心为之一涤，
真是绝佳的禅修所在。
LONG );
    set("exits", ([
        "northwest" : __DIR__"mjsimen1",
        "southeast" : __DIR__"mjfengmen1",
    ]));
    set("outdoors", "mingjiao");
    set("no_clean_up", 0);
    setup();
    replace_program(ROOM);
}

