#include <room.h>
inherit ROOM;

void create()
{
       set("short","大沙漠");
       set("long", @LONG
这是一片一望无际的大沙漠。你一进来就迷失了方向。看
来要走出这块沙漠并非易事。
LONG);
	set("exits", ([
		"east" : __FILE__,
		"west" : __FILE__,
		"south" : __FILE__,
		"north" : __FILE__,
	]));

	set("outdoors", "xiyu");
        set("no_map", "这里的地形令人困惑，你无从下手绘制地图。\n");

	setup();
}

int valid_leave(object me, string dir)
{
        int water, food;
        int qi, jing;
        string dest;

        if (interactive(me))
        {
                water = me->query("water");
                food = me->query("food");
                water -= (random(2) + 1) * water / 20 + 5;
                food -= (random(2) + 1) * food / 20 + 5;
                if (water < 0) water = 0;
                if (food < 0) food = 0;
                me->set("water", water);
                me->set("food", food);

                qi = me->query("max_qi") * 5 / 100 + random(10);
                jing = me->query("max_jing") * 5 / 100 + random(10);

                if (me->query("qi") < qi || me->query("jing") < jing)
        	{
                  	write("你已经感到不行了，冥冥中你觉得有人把你抬到天山脚下。\n");
                  	me->move(__DIR__"shanjiao");
                  	me->unconcious();
        		return -1;
                }

                me->receive_damage("qi", qi);
                me->receive_damage("jing", jing);
        }

        dest = sprintf("/d/xingxiu/shamo%d", random(10) + 1);
        me->move(dest);
        switch (random(3))
        {
        case 0:
                write("你顶着风沙走啊走，还是没有走出沙漠。\n");
                break;

        case 1:
                write("你望着漫天遍野的黄沙，叹了口气，无精打采的走着。\n");
                break;

        case 2:
                write("你一步步的往前挪着，早已分不出方向。\n");
                break;
        }
        return -1;
}
