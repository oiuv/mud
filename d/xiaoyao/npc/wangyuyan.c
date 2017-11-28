// wangyuyan.c

inherit NPC;

void create()
{
	set_name("王语嫣", ({ "wang yuyan", "wang" }));
	set("gender", "女性");
	set("age", 20);
	set("attitude", "peaceful");

        set("per", 35);

	set("str", 16);
	set("int", 42);
	set("con", 22);
	set("dex", 20);
	
	set("max_qi", 500);
	set("max_jing", 500);
	set("neili", 150);
	set("max_neili", 150);
	set("combat_exp", 2000);

	set_skill("force", 30);

	setup();
	
	carry_object(__DIR__"obj/cloth")->wear();
}

string long()
{
	if (! this_player())
		return "这是一个貌若天仙的女子，美丽的让你无法想象。\n";

        switch (this_player()->query("gender"))
        {
        case "男性":
                return "眼前是如此一位美貌女子，无法用言辞形容。便是天"
                       "上仙女，只怕也不过如此。\n";
        case "女性":
                return "你心前如遭痛击，眼前女子如此美貌，大概自己再长"
                       "一百年也比不上了。\n";
        default:
                return "一位仙女般的女子里在面前，不带一丝人间烟火气，"
                       "你真后悔当初一刀爽快了。\n";
        }
}

int accept_hit(object me)
{
        tell_object(me, "这么美丽的女子你也下得了手？\n");
        return 0;
}

int accept_fight(object me)
{
        command("say 小女子不会武功，这位" + RANK_D->query_respect(me) +
                "放过我吧！");
        return 0;
}

int accept_kill(object me)
{
        object duan;

        if (me->is_killing(this_object()))
                return 1;

        if (living(this_object()))
        {
                command("chat 不好啦！这位" +  RANK_D->query_respect(me) +
                        "要行凶杀人啊！");
        }

        if (duan = present("duan yu", environment(me)))
                duan->help_girl(me);

        return 1;
}
