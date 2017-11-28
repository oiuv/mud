#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "神峰");
        set("long", @LONG
这里是神峰的山腰，四周均有斧凿痕迹，察看峰壁发现洞
口的痕迹很是明显，只是年深月久，洞门(gate)的四周都已被
沙子(sand)牢牢堵塞住了。
LONG);
        set("outdoors", "shenfeng");
        set("item_desc", ([
		"gate" : WHT "嵌在神峰山腰的巨大厚重的石门，看起来很难"
                         "推动。\n" NOR,
		"sand" : HIY "巨大的石门由于时间过长，已被沙子堵得严严"
                         "实实。\n如果要想打开石门，看来非得将这些沙子"
                         "移开才行。\n" NOR,
        ]));
        setup();
}

void init()
{
        add_action("do_climb", "climb");
        add_action("do_push", "push");
        add_action("do_move", "move");
}

int do_climb(string arg)
{
        object me = this_player();

        if (! arg || arg != "down")
                return notify_fail("你要往哪个方向爬？\n");

        message("vision", HIW "只见" + me->name() + HIW "战战兢兢地往神"
                          "峰下爬去。\n" NOR, environment(me), ({me}));

        me->move(__DIR__"shanjiao");

        tell_object(me, HIW "\n你顺着神峰山腰的斧凿痕迹慢慢地爬了下来。"
                          "\n\n" NOR);
        message("vision", HIW "只见" + me->name() + HIW "战战兢兢地从神"
                          "峰上爬了下来。\n", environment(me), ({me}));
        return 1;
}

int do_move(string arg)
{
        object me = this_player();

        if (! arg || arg != "sand")
	        return notify_fail("你要干什么？\n");

        if (this_object()->query("mark/sand") > 5)
	        return notify_fail("石门上现在已经没有沙子了。\n");

        if (me->is_busy())
	        return notify_fail("你正忙着呢。\n");

        if (this_object()->query("mark/sand") < 5)
	        message_vision(HIC "$N" HIC "仔细地清除着覆盖在石门周围"
                               "的沙子。\n" NOR, me);
	else
	        message_vision(HIC "$N" HIC "终于将覆盖在石门周围的沙子"
                               "除得干干净净。\n" NOR, me);
        add("mark/sand", 1);
        me->start_busy(2);
        return 1;
}

int do_push(string arg)
{
        object room, me = this_player();

        if (! arg || arg != "gate")
                return notify_fail("你要推什么？\n");

        if (query("exits/enter"))
                return notify_fail("石门已经是开着的了，还推什么？\n");

        message_vision(HIY "\n$N" HIY "凝神聚气，双臂陡然向石门猛击而去"
                       "。\n" NOR, me);

        if ((int)me->query_skill("force") < 300
	   || this_object()->query("mark/sand") < 5
	   || me->query("neili") < 1500)
	{
	        write(HIR "结果「轰」的一声闷响，你被石壁的反弹力震得飞"
                      "了出去。\n\n" NOR);

        	message("vision", HIR "却见" + me->name() + HIR "身体猛"
                                  "然一晃，被震得飞了出去，坠到了山脚下"
                                  "。\n\n" NOR, environment(me), ({me}));

                me->move(__DIR__"shanjiao");
                me->receive_wound("qi", 200);
                me->unconcious();
                message("vision", HIR "\n突然听得「砰」的一声，只见一个"
                                  "人从上面的山峰上坠了下来，真是壮观。"
                                  "\n" NOR, environment(me));
                return 1;
        }

        if (! (room = find_object(__DIR__"yongdao1")))
        	room = load_object(__DIR__"yongdao1");

        if (! query("exits/enter"))
	{
                message_vision(HIY "$N" HIY "将石门震到一边，露出一个洞"
                               "口，可是洞内一片漆黑，甚么也瞧不见。\n"
                               NOR, me);

        	set("exits/enter", __DIR__"yongdao1");
            	room->set("exits/out", __FILE__);
                me->add("neili", -1000);

            	message("vision", HIY "\n只听外面传来一阵移动石门的隆隆"
                                  "的响声。\n" NOR, room);
            	return 1;
    	}
        return 1;
}
