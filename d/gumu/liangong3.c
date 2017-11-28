inherit ROOM;

void create()
{
        set("short", "小练功室");
        set("long", @LONG
这里是一个小小的石室，地方狭窄，却摆了几个木人，不
知是练功房摆不下还是因别的什么原因。地上有些杂乱，看来
不是经常打扫。
LONG);
        set("exits", ([
                "north" : __DIR__"liangong2",
        ]));
        set("for_family", "古墓派");
        set("objects", ([
                "/kungfu/class/gumu/li"  :  1,
        ]));
        setup();
        replace_program(ROOM);
}

