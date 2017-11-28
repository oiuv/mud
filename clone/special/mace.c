// mace.c

#include <ansi.h>
#include <weapon.h>

#define ADMIN   "???"
#define PARTY   "发呆帮"

inherit STAFF;

void create()
{
	set_name(HIG + PARTY + "权杖" NOR, ({ "mace" }) );
	set_weight(30);
	if (clonep())
		set_default_object(__FILE__);
        else {
                set("long", HIG "一根晶莹剔透的权杖，好像是丐帮的玉竹杖哦！\n"
                                "你仔细一看，不是，原来是冒牌货，是" + PARTY + "的权杖。\n"
                                "帮主通过它发号司令，邀请(author)他人入帮或是开除(expell)不听话的人。\n" NOR);
                set("value", 1);
                set("no_sell", "这是什么垃圾？\n");
        	set("unit", "根");
                set("wield_msg", HIG "$N" HIG "亮出一个晶莹剔透的小棍棍，神气"
                                 "活现的喝道：“还不拜见...本...帮主？”\n" NOR);
                set("unwield_msg", HIG "$N" HIG "鬼鬼祟祟的把权杖收好。\n" NOR);
        }

        set("admin", ADMIN);
        init_staff(1);
        setup();
}

void init()
{
        if (this_player() == environment())
        {
                add_action("do_author", "author");
                add_action("do_expell", "expell");
        }

        add_action("do_owner", "owner");
}

int do_owner(string arg)
{
        object me;
        object ob;

        me = this_player();
        if (wiz_level(me) < wiz_level("(wizard)"))
                return notify_fail("必须是 (wizard) 以上的巫师才能授权。\n");

        if (! arg || ! objectp(ob = present(arg, environment(me))))
                return notify_fail("你要把这" + name() + "赠给谁？\n");

        if (ob == me)
                return notify_fail("你脑潮啊？\n");

        if (! playerp(ob))
                return notify_fail("你只能把权杖赠给玩家。\n");

        if (ob->query("party/party_name") &&
            ob->query("party/party_name") != PARTY)
                return notify_fail(ob->name(1) + "已经入了其它帮派，不合适接受这" + name() + "。\n");

        message_vision("$N指了指" + name() + "，道：这" + name() +
                       "我就赠给帮主" + ob->name(1) + "了。\n", me);
        ob->set("party/party_name", PARTY);
        set("admin", ob->query("id"));
        message_vision("$N将" + name() + "交给了$n。\n", me, ob);
        move(ob, 1);
        return 1;
}

int do_author(string arg)
{
        object me;
        object ob;

        me = this_player();
        if (me->query("id") != query("admin") && me->query("couple/id") != query("admin"))
                return notify_fail("你不是" + PARTY + "帮主或帮主夫人，没人听你的。\n");

        if (me->query("party/party_name") != PARTY)
                return notify_fail("你自己都不是" + PARTY + "的人，怎么收别人？\n");

        if (! arg || ! objectp(ob = present(arg, environment(me))))
                return notify_fail("你要邀请谁加入" + PARTY + "？\n");

        if (! playerp(ob))
                return notify_fail("你只能邀请玩家加入发呆帮。\n");

        if (ob == me)
                return notify_fail("你脑潮啊？\n");

        if (ob->query("combat_exp") >= 50000)
                return notify_fail("此人经验太高，不宜进入" + PARTY + "。\n");

        if (ob->query("party/party_name"))
        {
                if (ob->query("party/party_name") == PARTY)
                        return notify_fail("人家已经是" + PARTY + "的人了。\n");

                return notify_fail("人家已经入了其他帮会了，不能加入你的" + PARTY + "了。\n");
        }

        if (me->query_temp("author") == ob)
                return notify_fail("你已经邀请人家了，可是别人还没有答应。\n");

        if (! living(ob))
                return notify_fail("看样子人家没法听见你说什么了。\n");

        message_vision("$N高举权杖，问道：“" + ob->name(1) + "，你可愿意入我" +
                       PARTY + "？”\n", me);
	ob->set_temp("pending/answer/" + me->query("id") + "/right",
                     (: call_other, __FILE__, "do_right", ob, me :));
	ob->set_temp("pending/answer/" + me->query("id") + "/refuse",
	             (: call_other, __FILE__, "do_refuse", ob, me :));
	me->set_temp("pending/author", ob);
        tell_object(ob, YEL + me->name(1) + "想收你入" + PARTY + "，你同意不同意(right/refuse)？\n" NOR);
        return 1;
}

int do_expell(string arg)
{
        object me;
        object ob;

        me = this_player();
        if (me->query("id") != query("admin") && me->query("couple/id") != query("admin"))
                return notify_fail("你不是" + PARTY + "帮主或帮主夫人，没人听你的。\n");

        if (! arg || ! objectp(ob = present(arg, environment(me))))
                return notify_fail("你要邀请谁加入" + PARTY + "？\n");

        if (! playerp(ob))
                return notify_fail("你只能邀请玩家加入发呆帮。\n");

        if (ob == me)
                return notify_fail("你脑潮啊？\n");

        if (ob->query("party/party_name") != PARTY)
                return notify_fail("人家不是你" + PARTY + "的人，懒得理你。\n");

        message_vision("$N哼了一声，喝道：“" + ob->name(1) +
                       "！你屡犯帮规，今日革你出帮，滚吧！”\n", me);
        ob->delete("party");

	CHANNEL_D->do_channel(this_object(), "rumor",
                              "听说" + ob->name(1) + "被" + me->name(1) +
                              "开除出" + PARTY + "了。");
        return 1;
}

int do_right(object me, object ob)
{
	if (! ob || environment(ob) != environment(me))
		return notify_fail("可惜啊，人家已经不在这儿了。\n");

	if (! living(ob))
		return notify_fail("人家现在听不到你说的话，还是算了吧。\n");

	if (ob->query_temp("pending/author") != me)
		return notify_fail("人家现在已经不打算收你了。\n");

        ob->delete_temp("pending/author");

        message_vision("$N拼命点头，像小鸡啄米一样，忙道：“好！好！好！”\n", me);

        me->set("party/party_name", PARTY);
	CHANNEL_D->do_channel(this_object(), "rumor",
                              "听说" + ob->name(1) + "收" + me->name(1) +
                              "入了" + PARTY + "。");
	return 1;
}

int do_refuse(object me, object ob)
{
	if (! ob || environment(ob) != environment(me))
		return notify_fail("可惜啊，人家已经不在这儿了。\n");

	if (! living(ob))
		return notify_fail("人家现在听不到你说的话，还是算了吧。\n");

	if (ob->query_temp("pending/author") != me)
		return notify_fail("人家现在已经不打算收你了。\n");

        ob->delete_temp("pending/author");
        message_vision("$N一脚把$n踢开，喝道：“滚！一边玩去！”\n",
                       me, ob);
        tell_object(ob, "看来人家对你的" + PARTY + "没什么兴趣。\n");

        return 1;
}

int query_autoload() { return query("admin"); }

void autoload(string para) { set("admin", para); }
