// pigpart.h

#include <ansi.h>

void setup()
{
        if (clonep()) set("only_do_effect", 1);
        ::setup();
}

int do_effect()
{
        return notify_fail("你想吃生" + name() + "？\n");
}

int broil(object me, object ob)
{
        object fob;

        me = this_player();
	if (me->is_busy())
	{
		write("你现在忙着呢，过会儿再烤吧。\n");
		return 1;
	}

        if (! query("food_remaining"))
        {
                write("这个好像没有什么必要再烤了吧？\n");
                return 1;
        }

        if (! query("only_do_effect"))
        {
                write("算了吧，东西不用烤两遍，太老了。\n");
                return 1;
        }

        message_vision("$N把" + name() + "放在" + ob->name() +
                       "上细细的烤着，只听毕啵毕啵的声音，一"
                       "阵诱人的香味散了出来。\n", me);

        write(HIY "你把" + name() + HIY "烤好了！\n" NOR);
        set("long", "一" + query("unit") + "烤得香喷喷的野猪" + name() + "。\n");
        set_name("烤" + name(), 0);
        delete("only_do_effect");
	me->start_busy(1);
        return 1;
}
