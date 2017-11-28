#include <ansi.h>
inherit NPC;

int ask_supu();
int ask_parent();
int ask_gaochang();

void create()
{
        set_name("李文秀", ({ "li wenxiu", "li", "wenxiu" }));
        set("gender", "女性");
        set("age", 18);
        set("long", "她长得清纯脱秀，嫣然一笑，不禁让人怦然心动。\n");
        set("combat_exp", 300000);
        set("shen_type", 1);

        set("max_qi", 1500);
        set("max_neili", 1000);
        set("neili", 1000);
        set("jiali", 100);
        set_skill("force", 150);
        set_skill("whip", 150);
        set_skill("unarmed", 150);
        set_skill("dodge", 150);
        set_skill("parry", 150);

        set("chat_chance", 3);
        set("chat_msg", ({
                CYN "李文秀忧郁地看着远方，轻叹道：也不知何时才能再见到苏普……\n" NOR,
                CYN "李文秀恨恨地道：父母之仇，我一定要血债血还。\n" NOR,
        }) );

        set("inquiry", ([
                "苏普"     : (: ask_supu :),
                "父母"     : (: ask_parent :),
                "父母之仇" : (: ask_parent :),
                "高昌迷宫" : (: ask_gaochang:),
                "高昌地图" : (: ask_gaochang:),
                "白马李三" : "他是我父亲，可是在我懂事之前，父母便都已去世了。",
        ]) );
        set_temp("apply/attack", 150);
        set_temp("apply/defense", 150);
        set_temp("apply/damage", 200);

        setup();
        carry_object(__DIR__"obj/liuxingchui")->wield();
        carry_object("/d/city/npc/cloth/hat")->wear();
        carry_object("/d/city/npc/cloth/boots")->wear();
        carry_object("/d/city/npc/cloth/xian-cloth")->wear();
}

void init()
{
        object me;

        ::init();

        if (interactive(me = this_player()) && ! is_fighting()) 
        {
                remove_call_out("greeting");
                call_out("greeting", 1, me);
        }
}

void greeting(object me)
{
        if (! me || environment(me) != environment()) return;

        if ((string)me->query("gender") == "男性")
		command("sigh " + me->query("id"));
        else
		command("look " + me->query("id"));
        return;
}

int ask_supu()
{
	say(CYN "李文秀黯然道：我自幼父母双亡，苏普是我儿时的伙伴。\n" NOR);
	this_player()->set_temp("marks/李1", 1);
	return 1;
}

int ask_parent()
{
	if ((int)this_player()->query_temp("marks/李1"))
	{
		say(CYN "李文秀哽咽道：我父母是被觊觎我家高昌地图的奸人所害。\n"
                    "李文秀接着道：我一定要手刃仇人，为我父母报仇！\n" NOR);
		this_player()->set_temp("marks/李2", 1);
		return 1;
	} else
	{
		say(CYN "李文秀说道：父母之仇，不共戴天。\n" NOR);
		return 1;
	}
}

int ask_gaochang()
{
	object map, me = this_player();
        int exp, pot, sc;

        exp = 300 + random(200);
        pot = 50 + random(200);
        sc = 5 + random(20);

	if (me->query_temp("marks/李3"))
	{
                command("hmm " + me->query("id"));
                command("say 我不是已经把地图给过你了吗？");
                return 1;
        } else
	if (me->query_temp("marks/李2") && me->query("combat_exp") < 10000)
	{
                command("shake " + me->query("id"));
                command("say 你的江湖经验太浅，何必去惹事上身？");
                return 1;
        } else
	if (me->query_temp("marks/李2"))
	{
		say(CYN "李文秀叹道：高昌迷宫里其实什么都没有，这地图你要就拿去好了。\n" NOR);
		map = new("/d/gaochang/obj/map");
		map->move(me, 1);
        	message_vision ("李文秀拿出" YEL "高昌迷宫地图" NOR "(map)给$N。\n", me);
		if (! (int)me->query("skybook/baima/map"))
		{
               		me->add("combat_exp", exp);
               		me->add("potential", pot);
               		me->add("score", sc);
               		tell_object(me, HIW "\n你成功的得到了高昌迷宫地图！\n" NOR + HIC "通"
                                        "过这次的历练，你获得了" + chinese_number(exp) + "点"
                                        "经验、" + chinese_number(pot) + "点潜能以及" +
                                        chinese_number(sc) + "点江湖阅历。\n\n" NOR);
                        me->set("skybook/baima/map", 1);
		}
		me->set_temp("marks/李3", 1);
        } else
	{
   		message("vision", HIR "李文秀勃然大怒，喝道：你也窥视我父母的高昌地"
                                  "图，我跟你拼了！\n" NOR, environment());
		kill_ob(me);
	}
	return 1;
}
