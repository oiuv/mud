// suicide.c

#include <ansi.h>

inherit F_CLEAN_UP;

private int slow_suicide(object me);
private int halt_suicide(object me);

int main(object me, string arg)
{
	object *inv;
	int i;
	if (me->is_busy())
		return notify_fail("你上一个动作还没完成。\n");

        inv = deep_inventory(me);
        for (i = 0; i < sizeof(inv); i++)
	{
                if (! userp(inv[i]) && ! playerp(inv[i])) continue;
		return notify_fail("你身上还有个大活人呢，想不开也别急呀？\n");
        }

	if (! arg || arg != "-f") 
		return notify_fail(HIC "您选择永远死掉的自杀方式，这个人物的资"
                                   "料将永远删除，请务必\n考虑清楚，确定的话请"
                                   "输入完整的自杀(" HIY "suicide -f" HIC ")指"
                                   "令。\n\n" NOR);

	write(HIR "您选择永远死掉的自杀方式，这个人物的资料将永远删除，请务必\n"
	      "考虑清楚，确定的话请输入您的管理密码：\n" NOR);
	input_to("check_password", 1, me, 1);
	return 1;
}

private void check_password(string passwd, object me, int forever)
{
	object link_ob;
	string old_pass;

	link_ob = me->query_temp("link_ob");
	old_pass = link_ob->query("ad_password");

	if (! stringp(old_pass) || crypt(passwd, old_pass) != old_pass)
	{
		write(HIW "\n密码错误！请注意，自杀必须输入管理密码。\n\n");
		return;
	}

	if (forever)
        {
		tell_object(me, HIR "\n你决定要自杀了，如果十五秒"
                            "内不后悔(" HIC "halt停止" HIR ")，就"
                            "真的永别了。\n\n" NOR);
		me->set_temp("suicide/time", time());
		me->set_temp("suicide/last", 0);
		me->set_temp("suicide/from", query_ip_number(me));
		me->start_busy((: slow_suicide, me :),
			       (: halt_suicide, me :));
	}
}

private int slow_suicide(object me)
{
	object link_ob;
	int t;

        if (! objectp(me))
                return 0;

        t = time() - me->query_temp("suicide/time");
        if (t < me->query_temp("suicide/last"))
        {
                me->delete_temp("suicide/");
                return 0;
        }

        if (t < 15)
	{
                if (t - me->query_temp("suicide/last") < 5)
                        return 1;

                tell_object(me, HIR "\n你还有" + chinese_number(15 - t) +
                            "秒钟仔细考虑(" HIC "halt停止" HIR ")。\n" NOR);
                me->set_temp("suicide/last", t / 5 * 5);
		return 1;
	}

	link_ob = me->query_temp("link_ob");
	if (! link_ob || ! interactive(me)) return 0;

	seteuid(getuid());
	write(HIW "\n既然如此…那就……永别了，" + me->name() + "。\n"
              HIC "欢迎您能够以新的身份再次光临「" HIY "武林群侠传"
              HIC "」。\n\n" NOR);

        if (me->query("combat_exp") >= 1000)
        {
                CHANNEL_D->do_channel(this_object(), "rumor",
                                      sprintf("%s自杀了，以后你再也看"
                                      "不到这个人了。", me->name()));

                log_file("static/suicide",
                                      sprintf("%s 用户（%s）自杀档案来"
                                      "自联线 %s。\n", log_time(),
                                      log_id(me), me->query_temp("suicide/from")));
        }

	tell_room(environment(me), me->name() +
		"在你的面前化作轻烟，渐渐消失了……\n", ({me}));

        UPDATE_D->remove_user(me->query("id"));
	return 0;
}

private int halt_suicide(object me)
{
	tell_object(me, HIG "你打消了寻死的念头。\n" NOR);
	me->delete_temp("suicide");
	return 1;
}

int help (object me)
{
        write(@HELP
指令格式: suicide [-f]
 
如果因为某种原因你不想活了，你可以选择自杀。
suicide -f : 永远的除去玩家资料，系统会要求你
             输入密码以确认身份。
 
请慎重选择。
 
HELP);
        return 1;
}
