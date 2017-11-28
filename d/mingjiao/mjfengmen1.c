// Room: /d/mingjiao/mjfengmen1.c
// Date: Java 97/05/11

#include <room.h>
inherit ROOM;

void create()
{
    set("short", "竹林");
    set("long", @LONG
这是竹林中的一间小院，竹影依依，经声入耳，其南北各有
一间竹舍，乃是明教中释道和佛家弟子的修炼场所。
LONG );
    set("exits", ([
        "northwest" : __DIR__"mjfengmen",
	"north" : __DIR__"foshe",
	"south" : __DIR__"daoshe",
    ]));
    set("no_clean_up", 0);
    set("outdoors", "mingjiao");
    setup();
    replace_program(ROOM);
}

