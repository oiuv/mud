inherit ROOM;

void create()
{
        set("short", "客店二楼");
        set("long", @LONG
这里是客店的二楼几张大床一字排开，一些人正在上面睡
的呼噜震天响，门窗紧闭，官衔昏暗，你不由也想睡山个一觉。
LONG);
        set("sleep_room", 1);
        set("no_fight", 1);
        set("exits", ([
                "eastdown" : __DIR__"kedian",
        ]));
        setup();
        
}

int valid_leave(object me, string dir)
{
        if (dir == "eastdown" ) me->delete_temp("rent_paid");

        return ::valid_leave(me, dir);
}
