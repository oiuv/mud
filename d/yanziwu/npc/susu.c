// d/yanziwu/npc/susu.c

inherit NPC;

void greeting(object);
void init();
void serve_tea(object);

void create()
{
        set_name("素素", ({"su su", "su"}) );
        set("nickname", "伺茶丫鬟");
        set("gender", "女性" );
        set("age", 14 + random(3));
        set("long",
          "这是个年年龄不大的小丫鬟，但宽松的衣服也遮不住她过早发育的身体。\n"
          "一脸聪明乖巧，满口伶牙俐齿。见有人稍微示意，便过去加茶倒水。\n");
        set("attitude", "friendly");
        set("shen_type", 1);

        set("str", 20);
        set("int", 28);
        set("con", 24);
        set("dex", 20);

        set("max_qi", 150);
        set("max_jing", 100);
        set("neili", 150);
        set("max_neili", 150);

        set("combat_exp", 1000+random(800));
        set("score", 1000);

        set_skill("force", 30);
        set_skill("dodge", 20);
        set_skill("unarmed", 15+random(10));
        set_skill("parry", 20);
        set_temp("apply/attack", 10);
        set_temp("apply/defense", 15);
        set_temp("apply/cdamage", 3);

        setup();

	set("can_supply", 15);
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
}

void greeting(object ob)
{
        if (! ob || environment(ob) != environment()) return;

        say("素素笑吟吟地说道：这位" + RANK_D->query_respect(ob)
             + "请先入座，" + "我这就给您上茶。\n");
}


void serve_tea(object who)
{
        object obt, obc, obn;
        object room;

        if (! who || environment(who) != environment()) return;

        if (! who->query_temp("marks/sit")) return;

        if (! objectp(room = environment())) return;

	if (query("can_supply") < 1)
	{
		message_vision("素素抱歉的对$N道：现在暂时没有了，过会"
			       "儿再来吧。\n", who);
		return;
	}
	add("can_supply", -1);
        obn = new("/d/yanziwu/obj/cha");
        obn->move(room);
        message_vision("素素拿出一个小茶壶，沏上一杯香浓的碧螺春．\n",who);

        obn = new("/d/yanziwu/obj/gao");
        obn->move(room);
        message_vision("素素拿出一碟精致的四色点心，放在桌上．\n", who);

        return;
}

void reset()
{
	set("can_supply", 15);
}

