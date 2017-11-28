inherit ROOM;

void create()
{
        set("short", "登高台");
        set("long", @LONG
这里是南天门登高望远的好去处。你站在这里，俯视诸峰，
丘垤如泥丸。遥看湘江北去，九向九背，时隐时现。周围烟霞，
碧罗，紫盖，天柱诸峰环抱，气象万千。
LONG);
        set("exits", ([
               "northwest"  : __DIR__"nantian",
        ]));

        set("objects", ([
                __DIR__"npc/youke" : 4,
        ]));

        set("outdoors", "henshan");

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

