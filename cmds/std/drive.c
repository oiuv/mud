// drive.c

#include <ansi.h>
#include <command.h>

inherit F_CLEAN_UP;

mapping dirs = ([
	"n":	"north",
	"s":	"south",
	"e":	"east",
	"w":	"west",
	"nu":	"northup",
	"su":	"southup",
	"eu":	"eastup",
	"wu":	"westup",
	"nd":	"northdown",
	"sd":	"southdown",
	"ed":	"eastdown",
	"wd":	"westdown",
	"ne":	"northeast",
	"nw":	"northwest",
	"se":	"southeast",
	"sw":	"southwest",
]);

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
	object ob;
        string cdir, rdir;
        string dir;
        object env;
        string msg_leave, msg_arrival;
        int lvl;
        int result;

        if (! arg)
                return notify_fail("你要赶什么？\n");

        if (sscanf(arg, "%s %s", arg, dir) != 2)
                return notify_fail("你要往哪个方向赶？\n");

	if (! objectp(ob = present(arg, environment(me))))
                return notify_fail("这里没有这样东西让你赶啊！\n");

        notify_fail("你看清楚了，这不是能驱使的车辆！\n");
        if (! ob->can_drive_by(me))
                return 0;

        if (! undefinedp(dirs[dir]))
                dir = dirs[dir];
        else
        if (member_array(dir, values(dirs)) == -1)
                return notify_fail("你不能往这个方向赶车。\n");

        if (me->is_fighting())
                return notify_fail("你现在正在和人家动手，没空赶车。\n");

        if (me->is_busy())
                return notify_fail("你上一个动作还没有完成，先等等吧。\n");

        // 查看驾车技术
        lvl = me->query_skill("driving");
        if (random(lvl + 100) < 50)
        {
                message_vision("$N手忙脚乱的折腾了半天，可是" +
                               ob->name() + "一动不动。\n", me);
                me->start_busy(1);
                return 1;
        }

        env = environment(me);

        notify_fail("");
        result = GO_CMD->main(me, dir);
        if (environment(me) == env)
        {
                string fail;

                if (! result)
                {
                        fail = query_fail_msg();
                } else
                        fail = "";
                write(fail + "你现在没法赶着" + ob->name() + "前进。\n");
                return 1;
        }
        ob->move(environment(me));

        if (random(lvl + 100) < 30)
                me->start_busy(1);

        if (me->can_improve_skill("driving"))
                me->improve_skill("driving", 1);

        cdir = GO_CMD->query_chinese_dir(dir);
        dir  = GO_CMD->query_reverse(dir);
        rdir = GO_CMD->query_chinese_dir(dir);
        switch (random(5))
        {
        case 0:
                msg_leave   = "$N一声吆喝，赶着$n向" + cdir + "驶去。\n";
                msg_arrival = "只听一声吆喝，$N赶着$n从" + rdir + "驶来。\n";
                break;
        case 1:
                msg_leave   = "$N一言不发，只是赶着$n向" + cdir + "驶去。\n";
                msg_arrival = "只见$N闷头闷脑的赶着$n从" + rdir + "驶了过来。\n";
                break;
        case 2:
                msg_leave   = "$N喝道：“让开了！让开了”，只见人和$n已经滚滚朝着" +
                              rdir + "去了。\n";
                msg_arrival = "远远的只听一阵喝声，紧接着就见$N赶着$n滚滚的从" +
                              rdir + "驶了过来。\n";
                break;
        case 3:
                msg_leave   = "$N抹了抹汗，继续赶着$n往" + rdir + "去了。\n";
                msg_arrival = "只见$N一边抹汗，一边赶着$n从" +
                              rdir + "驶了过来。\n";
                break;
        default:
                msg_leave   = "只听隆隆声响，就见$N急冲冲的赶着$n奔" +
                              rdir + "去了。\n";
                msg_arrival = "只听隆隆声响，就见$N急冲冲的赶着$n从" +
                              rdir + "驶来。\n";
                break;
        }

        msg_leave = replace_string(msg_leave, "$N", me->name());
        msg_leave = replace_string(msg_leave, "$n", ob->name());
        msg_arrival = replace_string(msg_arrival, "$N", me->name());
        msg_arrival = replace_string(msg_arrival, "$n", ob->name());

        message("vision", msg_leave, env);
        message("vision", msg_arrival, environment(me), ({ me }));
        tell_object(me, "你赶着" + ob->name() +
                        "到了" + environment(me)->short() + "。\n");
        ob->set_owner(me);
	return 1;
}

int help(object me)
{
	write(@HELP
指令格式 : drive <车辆> <方向>
 
这个指令可以让你向某个方向赶车，当然，这得是你的车才行。如果
你的驾车技术不是非常娴熟，那么可能不能自由的驱使，而且有可能
会带来不必要的延迟。怎么锻炼自己的驾车技术？熟能生巧嘛！
 
HELP );
    return 1;
}
