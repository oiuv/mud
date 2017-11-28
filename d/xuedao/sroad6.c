inherit ROOM;

void create()
{
        set("short", "大雪山口");
        set("long", @LONG
这里冰天雪地，寒风刺骨。如果不是内力高深的人，已然
经受不住冻了。
LONG);
        set("exits", ([
                "northdown" : __DIR__"sroad5",
                "south"     : __DIR__"sroad7",
        ]));
        set("outdoors", "xuedao");
        setup();
	replace_program(ROOM);
}
