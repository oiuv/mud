inherit ROOM;

void create()
{
        set("short", "小屋");
        set("long", @LONG
这是专供仆人休息的小屋。屋里放着五六张床，挤挤地占
掉了屋子的一大半地方。屋角很散乱地放了一些日常生活用具。
中央放着一张桌子，上面摆一茶壶和几个杯子。
LONG);
        set("exits", ([
                "east"  : __DIR__"houyuan",
        ]));
        set("objects", ([
                __DIR__"npc/puren" : 3,
        ]));    

        set("sleep_room", 1);
        setup();
        replace_program(ROOM);
}
