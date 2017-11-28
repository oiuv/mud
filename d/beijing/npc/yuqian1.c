#include <ansi.h>
#define INVASIOND "/u/ivy/invasion/invasiond"

inherit NPC;
mixed ask_reward();

void create()
{
	set_name("御前侍卫", ({ "shi wei", "shi", "wei" }));
	set("age", 32);
	set("gender", "男性");
	set("long", "御前侍卫个个都是是紫禁城中的好手，千万别去招惹。\n");
	set("attitude", "peaceful");

	set("str", 30);
	set("dex", 30);
	set("combat_exp", 100000);
	set("shen_type", 1);

	set_skill("unarmed", 100);
	set_skill("dodge", 100);
	set_skill("parry", 100);
	set_skill("sword", 100);
	set_skill("force", 100);
	set_temp("apply/attack", 100);
	set_temp("apply/defense", 100);
	set_temp("apply/damage", 60);
	set_temp("apply/armor", 60);

    set("chat_chance_combat", 10);
	set("chat_msg_combat", ({
		"御前侍卫喝道：亡命狂徒，京城之中，岂得由你猖狂？\n",
	}));
    set("inquiry", ([
           	"赏赐" : (: ask_reward :),
           	"请赏" : (: ask_reward :),
           	"领赏" : (: ask_reward :),
            "reward" : (: ask_reward :),
        ]));
	setup();
	carry_object("/d/beijing/npc/obj/sword4")->wield();
    carry_object("/d/beijing/npc/obj/guanfu1")->wear();
}

void init()
{
	object ob;
	::init();
	if (interactive(ob = this_player()) && 
		(int)ob->query_condition("killer")) {
		remove_call_out("kill_ob");
		call_out("kill_ob", 1, ob);
	}
}

int accept_fight(object me)
{
	command("say 这可是你活腻了自找的，休得怪我无情。\n");
	me->apply_condition("killer", 500);
	kill_ob(me);
	return 1;
}

mixed ask_reward()

{
        object me;
        me = this_player();

        if (me->query_condition("killer")) return 1;

        if ( ! find_object(INVASIOND) || ! INVASIOND->query("record") )
           return command("say 如今并无八国联军入侵呀！");
        if ( ! INVASIOND->query("record/all_killed") )
           return command("say 圣上并未恩准赏赐，尔等速速离去！");
        if ( me->query("waidi/born_time") != INVASIOND->query("record/born_time"))
           return command("say 你的赏赐已经过期了！");
        if ( environment(me) == find_object("/d/beijing/hg") )
           return command("say 你快快向皇上领赏吧！");

        command("say 啊，原来是抗击八国联军的义士，快请快请！");
        command("say 在下这便带你入宫面见圣上！");
        message_vision(HIW "\n$N" HIW "大步地走进皇宫大殿，$n"
                       HIW "紧随其后。\n\n" NOR, this_object(), me);
        me->move("/d/beijing/hg");
        this_object()->move("/d/beijing/hg");
        command("say 好了，我带你到大殿了，你可以面见圣上领赏了。");
        message_vision("$N头也不回地离去了。\n", this_object());

        this_object()->move(query("startroom"));
        message_vision("$N急匆匆的走了过来。\n", this_object());
        return 1;

}

void unconcious()
{
        die();
}

/*
inherit NPC;

void create()
{
	set_name("御前侍卫", ({ "shi wei", "shi", "wei" }));
	set("age", 32);
	set("gender", "男性");
	set("long", "御前侍卫个个都是是紫禁城中的好手，千万别去招惹。\n");
	set("attitude", "peaceful");

	set("str", 30);
	set("dex", 30);
	set("combat_exp", 100000);
	set("shen_type", 1);

	set_skill("unarmed", 100);
	set_skill("dodge", 100);
	set_skill("parry", 100);
	set_skill("sword", 100);
	set_skill("force", 100);
	set_temp("apply/attack", 100);
	set_temp("apply/defense", 100);
	set_temp("apply/damage", 60);
	set_temp("apply/armor", 60);

       set("chat_chance_combat", 10);
	set("chat_msg_combat", ({
		"御前侍卫喝道：亡命狂徒，京城之中，岂得由你猖狂？\n",
	}));
	setup();
	carry_object("/d/beijing/npc/obj/sword4")->wield();
       carry_object("/d/beijing/npc/obj/guanfu1")->wear();
}

void init()
{
	object ob;
	::init();
	if (interactive(ob = this_player()) && 
		(int)ob->query_condition("killer")) {
		remove_call_out("kill_ob");
		call_out("kill_ob", 1, ob);
	}
}

int accept_fight(object me)
{
	command("say 这可是你活腻了自找的，休得怪我无情。\n");
	me->apply_condition("killer", 500);
	kill_ob(me);
	return 1;
}
*/