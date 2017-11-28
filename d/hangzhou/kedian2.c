// kedian2.c
// Date: Nov.1997 by Venus
inherit ROOM;

void create()
{
        set("short", "天外天客店二楼");
        set("long", @LONG
你正走在天外天客店二楼的走廊上，可以听到从客房里不时地呼呼
的打酣声，一阵高过一阵。不时有睡意朦胧的旅客进进出出，到楼下的
掌柜处付了钱再上来睡觉。
LONG );
        set("exits", ([
                "down"  : __DIR__"kedian",
                "enter" : __DIR__"kedian3",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
