#include <ansi.h>
inherit ITEM;

#define ZHUJIAN    "/clone/lonely/book/zhujian2"

void create()
{
	set_name("枯乾的骸骨", ({ "Skeleton", "skeleton", "骸骨" }));
        set_weight(500);
        if (clonep())
        	set_default_object(__FILE__);
    	else {
        	set("unit", "具");
                set("long", "这副骸骨已经躺在这里很久了。\n");
        	set("value", 1);
        	set("no_get", "这东西一碰就散，还是别拣吧！\n");
    	}
}

void init()
{
        add_action("do_move", "move");
}

int do_move(string arg)
{
        object me, ob;
        me = this_player();

        if (! arg || ! id(arg))
                return 0;

        ob = find_object(ZHUJIAN);
        if (! ob) ob = load_object(ZHUJIAN);

        if (! environment(ob))
        {
        	ob->move(environment(me));
                message_vision(HIC "\n$N" HIC "小心翼翼地将骸骨移开，发现下"
                               "面豁然藏有一卷竹简。\n" NOR, me);
                return 1;
        } else
                message_vision(HIY "$N" HIY "小心翼翼地将骸骨移开，可是什么"
                               "也没发现。\n" NOR, me);
        return 1;
}
