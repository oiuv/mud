inherit ROOM;

void create()
{
        set("short", "南疆沙漠");
        set("long", @LONG
这就是浩瀚的塔克拉马干大沙漠，一走进来，你仿佛迷失
了方向。你感到口内十分焦渴，还是快些离开吧。
LONG );
        set("exits", ([
                "northeast" : __DIR__"nanjiang",
                "southeast" : __DIR__"nanjiang3",
                "southwest" : __FILE__,
                "northwest" : __FILE__,
                "north" : "/d/shenfeng/caoyuan5",
                "south" : __FILE__,
                "east" : __FILE__,
                "west" : __FILE__,
        ]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
        set("outdoors", "xiyu");
        set("no_map", "这里的地形令人迷惑，无法绘制地图。\n");

        setup();
}

int valid_leave(object me, string dir)
{
        int current_water;

        if (! interactive(me))
                return ::valid_leave(me, dir);

        current_water = me->query("water");
        if (current_water == 0)
	{
          	write("你已经感到不行了，冥冥中你觉得有人把你抬到天山脚下。\n");
          	me->move(__DIR__"shanjiao");
          	me->unconcious();
		return -1;
        }

        if (current_water <= 20)
	{
            	write("你过于缺水，眼冒金星。\n");
            	me->set("water", 0);
        } else
            	me->add("water", -20);

        if (random(2))
        {
                me->move(sprintf(__DIR__"nanjiang%d", random(3) + 1));
                return -1;
        }

        return ::valid_leave(me, dir);
}
