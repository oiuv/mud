// tanghua.c

inherit NPC;

void create()
{
        set_name("唐掌柜", ({ "tang hua", "boss" }) );
        set("long",
                "唐掌柜是这家大酒楼的主人，别看他只是一个小小的酒楼老板，在成\n"
                "都除了提督老爷以外，恐怕就属他最财大势大。\n" );
        set("age", 46);
        set("attitude", "peaceful");
	set_skill("unarmed", 60);
	set_skill("dodge", 60);
	set_temp("apply/attack", 30);
	set_temp("apply/attack", 30);
	set_temp("apply/damage", 15);

	set("combat_exp", 50000);
	set("attitude", "friendly");
	
        set("inquiry", ([
                "name": "在下姓唐单名一个桦字。\n",
                "here": "此处便是蓉城酒楼，客倌如要点菜，吩咐店里的小二一声便可。\n",
                "唐桦": "不敢，在下便是唐桦，不知客倌有何吩咐？\n",
                "蓉城酒楼": "这里就是，客倌是第一次来吗？\n"
        ]) );
        setup();
        add_money("silver", 15);
        carry_object("/clone/misc/cloth")->wear();
}
