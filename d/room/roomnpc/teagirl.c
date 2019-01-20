// teagirl.c 茶女

#include "roomnpc.h"

inherit NPC;

void greeting(object ob);
void init();
int  accept_object(object who, object ob);

void create()
{
	set_name("伺茶丫鬟", ({"girl", "ya huan"}) );
	set("gender", "女性" );
	set("age", 12 + random(6));
	set("long", "这是个年龄不大的小姑娘，一脸聪明乖巧，正在准备为客人上茶。");
	set("attitude", "friendly");

        setup();
}

void init()
{
        object ob;

	::init();

	if (interactive(ob = this_player()) && !is_fighting())
        {
		remove_call_out("greeting");
		call_out("greeting", 1, ob);
	}

        add_action("do_tea", "tea");
}


int do_tea(string arg)
{
        object ob;

        if (is_busy())
                return notify_fail("你没看见人家正忙呢吗？\n");

        ob = new("/d/wudang/obj/xiangcha");
        ob->move(this_object());
        command("say 这是您的茶。");
        command("give " + ob->query("id") + " to " + this_player()->query("id"));
        if (environment(ob) == this_object())
                destruct(ob);
        start_busy(5 + random(4));
        return 1;
}

void greeting(object ob)
{
	if (! ob || (environment(ob) != environment())) return;

        if (is_owner(ob))
        {
                message_vision(name() + "对$N盈盈道了一个万福。\n", ob);
                command("say 有什么吩咐吗？");
                return;
        }
        message_vision(name() + "对$N道：“这位" + RANK_D->query_respect(ob) +
                "好。”\n", ob);
}

int accept_object(object who, object ob)
{
//	object obn;

        if (! ob->query("money_id"))
                return 0;

        if (is_owner(who))
        {
                message_vision(name() + "对$N施了一礼。\n", who);
                destruct(ob);
                return 1;
        }

        if (ob->value() < 1000)
        {
                if (owner_is_present())
                {
                        say(name() + "不情愿的接下了" + ob->name() + "。\n");
                        destruct(ob);
                        return 1;
                }
                message_vision(name() + "杏目园睁，喝道：“你以为是打"
                               "发叫花子啊？”\n", who);
                return 0;
        }

        destruct(ob);
        message_vision(name() + "对$N微微一笑，道：“多谢这位" +
                       RANK_D->query_respect(who) + "啦！”\n", who);
	return 1;
}