inherit ROOM;
void create()
{
        set("short","船上");
        set("long", @LONG
一只大江船，比寻常的船大了许多，此时大船已经靠岸，随时可以从甲板(d
eck)上跳下去。
LONG );
        set("item_desc", ([
                "deck" : "大船的甲板，已经被海水侵蚀得腐烂不堪。\n",
        ]));

        set("no_fight",1);

setup();
}

void init()
{
        add_action("do_jump", "jump");
}

int do_jump(string arg)
{
        object me;
        me = this_player();

        if( !arg || arg=="" )
        return notify_fail("你要往哪里跳？\n");

        if( arg=="deck" ) 
        {
                if (me->is_busy() )
                {
                        return notify_fail("你的动作还没有完成，不能移动。\n");
                        return 1; 
                }

                message("vision",
                        me->name() + "轻轻一跃，从大船的甲板上跳了下来。\n",
                        environment(me), ({me}) );
                me->move("/d/tulong/tulong/shatan");
                message("vision",
                        me->name() + "跳下了船，从远处的海边走了过来。\n",
                        environment(me), ({me}) );
                return 1;
        }
}       

