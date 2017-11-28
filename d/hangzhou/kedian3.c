// kedian3.c
// Date: Nov.1997 by Venus
inherit ROOM;
void create()
{
        set("short", "天外天客店二楼");
        set("long", @LONG
天外天客店果然名不虚传，好大的一间客房，一张精致的床，窗外
是美丽的西湖，无边的宜人景致。暖暖的风吹得你昏昏欲睡，这里正是
睡觉的好地方。
LONG);
        set("sleep_room", 1);
        set("no_fight", 1);
        set("hotel",1);
        set("no_clean_up", 0);
        set("exits", ([
                "out" : __DIR__"kedian2",
        ]));
        setup();
}

int valid_leave(object me, string dir)
{
        if ( dir == "out" ) me->delete_temp("rent_paid");
        return ::valid_leave(me, dir);
}

