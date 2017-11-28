// brush.c
//
// This is the basic equip for players just login.

#include <armor.h>

//inherit CLOTH;
inherit ITEM;

void create()
{
        set_name("刷子", ({ "brush", "shua zi" }) );
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else
        {
                set("unit", "把");
                set("long", "一把刷子，是专门用来刷鞋用的。\n");
		set("value", 200);
        }
        setup();
}

void init()
{
        add_action("do_swab", "swab");
        add_action("do_swab", "caxie");
}

int do_swab(string arg)
{
        int exp;
        object ob;      
        object me;
        object money;
        object shoeshine;

        me = this_player();
        if (! arg || ! objectp(ob = present(arg, environment(me))))
                return notify_fail("你要为谁擦鞋？\n");

        if (! ob->is_character() || ob->query("not_living"))
                return notify_fail("看清楚了，那不是活人！\n");

        if (! ob->query("can_speak"))
                return notify_fail("自古以来没有听说过给" +
                                   ob->name() + "擦鞋的！\n");

        if (! living(ob))
                return notify_fail("你还是等别人醒了再说吧！\n");

        if (ob == me)
        {
                message_vision("$N举着手中的刷子，看着自己，想起"
                               "自己真是好命苦，一时忍不住就要落泪！\n",
                               this_player());
                return 1;
        }

        if (! objectp(shoeshine = present("xie you", me)))
        {
                write("你现在没有鞋油了。\n");
                return 1;
        }

        if (me->is_busy())
                return notify_fail("你现在正忙着呢，还是等一会儿再说吧！\n");

        me->start_busy(2);

        if (playerp(ob))
        {
        	shoeshine->cost();

		if (me->query("couple/id") == ob->query("id"))
		{
			message_vision("$N跪下来一脸谄媚的把$n的鞋擦得亮晶晶"
				       "的。$n拍了拍$N的头说道：“" +
				       (me->query("gender") == "男性" ?
				        "老公，你的鞋擦得好好哦。" :
					"老婆，你的鞋擦的真漂亮！") +
				       "”\n", me, ob);
			return 1;
		}

                message_vision("$N一脸谄媚的替$n把鞋擦得油亮，只见$n"
			       "笑眯眯看着$P，道：“好，好！”\n",
                               me, ob);
		if (ob->is_fighting(me))
		{
        		if (me->query("weiwang") > 1000)
                		me->add("weiwang", -100);
        		else
			{
				message_vision("$N笑道：你的道行还浅，再怎么"
					       "给我擦鞋也没有用！看招！\n",
					       ob);
				write("你心中大骂不止！\n");
				return 1;
			}
			ob->remove_enemy(me);
			ob->remove_killer(me);
			me->remove_enemy(ob);
			me->remove_killer(ob);
			write(ob->name() + "停止了对你的攻击。\n");
			return 1;
		}
                write("你心中暗骂：这个衰鬼，一分钱都没有！\n");
                return 1;
        }

	if (me->is_fighting())
	{
		write("你还是等打完架再擦鞋吧！\n");
		return 1;
	}

        if (time() - ob->query_temp("last_swab") < 240)
        {
                message_vision("$n一脚踢开了$N，道：今天我已"
                               "经擦过了，你还是改天再来吧！\n",
                               me, ob);
                return 1;
        }

        message_vision("$N弯下腰来，殷勤的把$n的鞋擦了一遍又一遍。\n",
                       me, ob);
        shoeshine->cost();
        if (me->query("weiwang") > 10)
                me->add("weiwang", -10);
        else
                me->set("weiwang", 0);

        ob->set_temp("last_swab", time());

        //exp = 4 + random(5);
        exp = 40 + random(5);
        if (me->query("combat_exp") < 50000)
                me->add("combat_exp", exp);

        if (me->query("potential") < me->query_potential_limit())
                //me->add("potential", random(3) / 2);
                me->add("potential", random(50));

        money = new("/clone/money/coin");
        money->set_amount(30 + random(30));

        message_vision("$n看看鞋，哼哼道：好！不错，这点钱是赏给你的！\n"
                       "$N连忙点头哈腰，笑眯眯的接了过来。\n", me, ob);
        money->move(me, 1);
        return 1;
}

