// expell.c

#include <skill.h>

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
	object ob;
//	string *skname;
//	mapping skills;
//	int i;

	if( !arg || !ob = present(arg, environment(me)) )
		return notify_fail("你要将谁逐出师门？\n");

	if( !ob->is_character() )
		return notify_fail("开清楚了，它不是人，你逐不动他。\n");

	if( !userp(ob) )
		return notify_fail("你只能开除玩家所扮演的人物。\n");

    if( !ob->is_apprentice_of(me) )
		return notify_fail("这个人不是你的弟子。\n");

    if( ob->query_temp("pending/detach"))
    {
        message_vision("\n$N痛心的对$n说：唉！你若能呆在我" +
                       ob->query("family/family_name") +
                       "，何等有前途？罢了！罢了！\n", me, ob);
    } else
    {
		message_vision("\n$N对着$n说道：从今天起，你再也不是我"
			+ me->query("family/family_name") + "的弟子了，你走吧！\n",
			me, ob);
	}

    tell_object(ob, "\n你被师父开革出师门了！\n");

    ob->skill_expell_penalty();
    ob->add("detach/times", 1);
    ob->add("detach/" + ob->query("family/family_name"), 1);
	ob->delete("family");
	ob->set("title", "普通百姓");
    ob->unconcious();

	return 1;
}

int help(object me)
{
	write(@HELP
指令格式 : expell|kaichu <某人>
 
这个指令可以让你开除不成才的弟子，或是请求离开师门的弟子。被开除的
弟子所有本门的秘学都会被追回，而其他除了知识类的以外技能都可能会下
降，这对于一个人物而言是一个「比死还严重」的打击，请你在开除一名弟
子之前务必审慎考虑。
 
HELP
	);
	return 1;
}