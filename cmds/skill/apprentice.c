// apprentice.c

#include <ansi.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
	object ob, old_app;
	//mapping family, ob_family, skills;
	mapping family, ob_family;
	//int i;
	//string *skname;

        if (me->is_busy())
                return notify_fail("你现在正忙着呢。\n");

	if (! arg)
		return notify_fail("指令格式：apprentice | bai [cancel]|<对象>\n");

	if (arg == "cancel")
	{
		old_app = me->query_temp("pending/apprentice");
		if( !objectp(old_app) )
			return notify_fail("你现在并没有拜任何人为师的意思。\n");
		write("你改变主意不想拜" + old_app->name() + "为师了。\n");
		tell_object(old_app, me->name() + "改变主意不想拜你为师了。\n");
		me->delete_temp("pending/apprentice");
		return 1;
	}

	if (! (ob = present(arg, environment(me))) ||
	    ! ob->is_character())
		return notify_fail("你想拜谁为师？\n");

	if (! living(ob))
		return notify_fail("你必须先把" + ob->name() + "弄醒。\n");

	if (ob == me)
		return notify_fail("拜自己为师？好主意....不过没有用。\n");

	if (me->is_apprentice_of(ob))
	{
		message_vision(CYN "$N" CYN "恭恭敬敬地向$n" CYN "磕头请"
                               "安，叫道：「师父！」\n" NOR, me, ob);
		return 1;
	}

	if (! mapp(ob_family = ob->query("family")))
		return notify_fail(ob->name() + "既不属於任何"
                                   "门派，也没有开山立派，不能拜师。\n");

        if (playerp(ob))
                return notify_fail("对不起，现在不能拜玩家为师。\n");

        family = me->query("family");

        if (mapp(family) && stringp(family["master_name"]) &&
            ob_family["family_name"] == family["family_name"] &&
            ob_family["generation"] > family["generation"])
                return notify_fail(CYN + ob->name() + CYN "吓了一跳，忙"
                                   "道：“前辈怎可开这等玩笑，真是折杀做"
                                   "晚辈的了。”\n" NOR);

        if (mapp(family) && stringp(family["master_name"]) &&
            ob_family["family_name"] == family["family_name"] &&
            ob_family["generation"] == family["generation"])
                return notify_fail(CYN + ob->name() + CYN "微微一楞，说道"
                                   "：“你我辈分相同，相交即可，何谈拜师"
                                   "？”\n" NOR);

        // betrayer ?
        if (mapp(family) && family["family_name"] != ob_family["family_name"] &&
            me->query_temp("pending/betrayer") != ob)
        {
                write(HIR "你这是打算判师吗？判师很可能遭到严厉惩罚。\n" NOR +
                      HIC "如果你下了决心，就再输入一次这条命令。\n" NOR);
                me->set_temp("pending/betrayer", ob);
                return 1;
        }

	// If the target is willing to recruit us already, we do it.
	if ((object)ob->query_temp("pending/recruit") == me)
	{
		if (mapp(family) &&
                    family["family_name"] != ob_family["family_name"])
		{
			message_vision(HIR "$N" HIR "决定背叛师门，改投入$n" HIR
                                       "门下。\n\n" NOR + HIC "$N" HIC "跪了下来"
                                       "向$n" HIC "恭恭敬敬地磕了四个响头，叫道"
                                       "：「师父！」\n\n" NOR, me, ob);
			me->set("weiwang", 0);
			me->set("gongxian", 0);
			me->add("betrayer/times", 1);
                        me->delete("quest");
                        me->delete_temp("quest");
                        if (stringp(family["family_name"]))
                                me->add("betrayer/" + family["family_name"], 1);
		} else
			message_vision("$N决定拜$n为师。\n\n" HIC "$N" HIC "跪了"
                                       "下来向$n" HIC "恭恭敬敬地磕了四个响头，"
                                       "叫道：「师父！」\n\n" NOR, me, ob);
		ob->recruit_apprentice(me);
		ob->delete_temp("pending/recruit");

		tell_object(ob, "恭喜你新收了一名弟子！\n");
		printf("恭喜您成为%s的第%s代弟子。\n", 
			me->query("family/family_name"),
			chinese_number( me->query("family/generation")));
		return 1;
	
	} else
	{
		old_app = me->query_temp("pending/apprentice");
		if (ob == old_app)
			return notify_fail("你想拜" + ob->name() +
				           "为师，但是对方还没有答应。\n");
		else
		if (objectp(old_app))
		{
			write("你改变主意不想拜" + old_app->name() + "为师了。\n");
			tell_object(old_app, me->name() + "改变主意不想拜你为师了。\n");
		}

		message_vision("$N想要拜$n为师。\n", me, ob);
		me->set_temp("pending/apprentice", ob );
		if (userp(ob))
		{
			tell_object(ob, YEL "如果你愿意收" + me->name() +
				    "为弟子，用 recruit 指令。\n" NOR);
		} else 
			ob->attempt_apprentice(me);
		return 1;
	}
}


int help(object me)
{
        write(@HELP
指令格式 : apprentice|bai [cancel]|<对象>
 
这个指令能让你拜某人为师，如果对方也答应要收你为徒的话，就会
立即行拜师之礼， 否则要等到对方用 recruit 指令收你为弟子才能
正式拜师。

请注意你已经有了师父，又背叛师门投入别人门下，则很有可能导致
原有门派的人的追杀，一旦失手，则所有的特殊武功都将被别人废掉，
基本武功减半。

如果对你的师父使用这个指令，会变成向师父请安。

拜同门的师父不能拜比自己辈分低的或是和自己辈分相同的人。
 
请参考相关指令 expell、recruit
HELP );
        return 1;
}
