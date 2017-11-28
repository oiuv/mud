inherit ROOM;

void create()
{
        set("short", "有所不为轩");
        set("long", @LONG
这就是华山掌门岳不群的居所「有所不为轩」，此处乃是
前厅，厅上挂着「正气堂」三字匾额。厅中很宽敞，却没什么
摆设，靠墙放着两把交椅。这里乃是岳不群议事及授徒的地方
后面是寝室。
LONG);
        set("exits", ([
            	"north" : __DIR__"buwei2",
            	"south" : __DIR__"qunxianguan",
            	"west"  : __DIR__"garden",
            	"east"  : __DIR__"buwei3",
        ]));
        set("objects", ([
             	__DIR__"npc/dayou" : 1,
		"/clone/quarry/hou" : 1,
        ]));

        setup();
}

int valid_leave(object me, string dir)
{
        object guard;

        if (dir == "south" ||
            ! objectp(guard = present("lu dayou", this_object())))
                return ::valid_leave(me, dir);

        return guard->permit_pass(me, dir);
}
