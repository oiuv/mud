#include <ansi.h>

inherit NPC;

string ask_me(object who);

void create()
{
	set_name("王五", ({ "wang wu", "wang", "wu" }));
	set("title", "醉仙楼酒客");
	set("gender", "男性" );
	set("long", "这是个喝得醉醺醺的酒鬼，正盯着手中的酒杯喃喃地念叨着什麽。\n" );
	set("shen_type", -1);
	set("age", 40);
	set("str", 25);
	set("con", 25);
	set("dex", 25);
	set("int", 25);
        set("max_qi", 800);
        set("max_jing", 500);
        set("neili", 500);
        set("max_neili", 500);
        set("jiali", 10);
	set("combat_exp", 100000);
	set("attitude", "heroism");
	set("chat_chance_combat", 15);
	set("chat_msg_combat", ({
		CYN "王五说道：你当真吃了豹子胆，敢跟大爷较量！\n" NOR,
		CYN "王五忽然挥出一刀，招数精奇，但刀到中途却又急忙收招。\n" NOR,
		CYN "王五说道：快滚！算我输了还不行……\n" NOR
	}) );

	set("inquiry", ([
		"王老五" : "哈哈哈！有趣有趣，可惜你认错人了。" ,
		"鬼刀"   : (: ask_me :),
	]) );
	set_skill("blade", 100);
	set_skill("dodge", 80);
	set_skill("unarmed", 80);
	set_skill("parry", 80);
        set_skill("literate", 60);
        set_skill("lamaism", 80);
        set_skill("martial-cognize", 80);

	setup();	
	carry_object("/clone/weapon/gangdao")->wield();
	carry_object("/clone/cloth/cloth")->wear();
}

string ask_me(object who)
{
	int i;
	object *ob;

	if (query("revealed"))
	{
		if (is_killing(who))
			return "你既然知道了我的身分，今日休想活命！\n";
		else {
			kill_ob(who);
			who->fight_ob(this_object());
			return "老子就是鬼刀王五，鬼刀王五就是你老子！纳命来吧！\n";
		}
	}

	if( (random(10) < 5) || is_fighting() )
		return "我……我不知道。\n";

	set_temp("apply/attack",  80);
	set_temp("apply/defense", 80);
	set_temp("apply/damage",  50);

	set("title", HIR "鬼刀" NOR);

	message("vision", HIY "王五眼中突然放出异样的光芒，颤声说道，看…看来…你都知道了？\n"
		          "王五大喝一声，叫道，既然如此，老子今天反正豁出去，跟你拼了。\n" 
		          "王五使开单刀，招数精奇，沉猛狠辣，和刚才的醉鬼简直判若两人。\n" NOR,
		          environment(), this_object() );

	set("pursuer", 1);
	set("attitude", "aggressive");
	set("vendetta/authority", 1);
	set("chat_msg_combat", ({(: random_move :)}) );
	set("chat_chance", 15);
	set("chat_msg", ({(: random_move :)}) );
	set("bellicosity", 10000);
	set("combat_exp", 300000);
        set("neili", 1000);
        set("max_neili", 1000);
        set("jiali", 50);

	set_skill("xuedao-dafa", 100);
        set_skill("shenkong-xing", 80);
        set_skill("hand", 80);
        set_skill("dashou-yin", 80);
        set_skill("cuff", 80);
        set_skill("yujiamu-quan", 80);

        map_skill("force", "xuedao-dafa");
        map_skill("dodge", "shenkong-xing");
        map_skill("hand", "dashou-yin");
        map_skill("cuff", "yujiamu-quan");
        map_skill("parry", "xuedao-dafa");
        map_skill("blade", "xuedao-dafa");

        prepare_skill("cuff", "yujiamu-quan");
        prepare_skill("hand", "dashou-yin");

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "hand.yin" :),
                (: perform_action, "cuff.jiang" :),
                (: exert_function, "powerup" :),
                (: exert_function, "resurrect" :),
        }) );

	ob = all_inventory(environment());
	for(i = sizeof(ob)-1; i >= 0; i--)
	{
		if (! userp(ob[i])) continue;
		kill_ob(ob[i]);
		ob[i]->fight(this_object());
	}
        add_money("silver", 50);
        carry_object("/clone/book/tianmo_book");
	set("revealed", 1);
	return "老子就是鬼刀王五，鬼刀王五就是你老子！纳命来吧！\n";
}
