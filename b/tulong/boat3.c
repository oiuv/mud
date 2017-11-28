inherit ROOM;

void create()
{
        set("short", "船上");
        set("long", @LONG
这是一只大江船，比寻常的船大了许多，此时大船已经靠
岸，你随时可以从甲板上跳下去。
LONG);
        set("no_fight", 1);
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

        if (me->is_busy())
                return notify_fail("你的动作还没有完成，不能移动。\n");

        message("vision", me->name() + "轻轻一跃，从大船的甲板上跳了"
                          "下去。\n", environment(me), ({me}));

        me->move(__DIR__"shatan");
        message("vision", me->name() + "跳下了船，从远处的海边走了过"
                          "来。\n", environment(me), ({me}));
        return 1;
}       
