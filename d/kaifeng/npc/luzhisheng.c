#include <ansi.h>
inherit NPC;

void create()
{
	set_name("鲁智深", ({"lu zhisheng", "lu", "zhisheng"}));
	set("long", "这个胖大和尚露出好一身花绣，正是五台山来的僧人。\n");
        set("gender", "男性");
	set("nickname", HIM "花和尚" NOR);
	set("title", "梁山好汉");
	set("age", 42);
	set("shen_type", 1);
	set("str", 35);
	set("int", 20);
	set("con", 20);
        set("qi", 3000);
        set("max_qi", 3000);
        set("jing", 3000);
        set("max_jing", 3000);
        set("neili", 2500);
        set("max_neili", 2500);
        set("jiali", 200);
	set("combat_exp", 1500000);
	set("score", 20000);
        set("apply/attack",  100);
        set("apply/defense", 100);

        set_skill("cuff", 180);
        set_skill("force", 180);
        set_skill("dodge", 180);
        set_skill("parry", 180);
        set_skill("strike", 180);
        set_skill("zixia-shengong", 180);
        set_skill("poyu-quan", 180);
        set_skill("hunyuan-zhang", 180);
        set_skill("feiyan-huixiang",180);

        map_skill("cuff", "poyu-quan");
        map_skill("force", "zixia-shengong");
        map_skill("dodge", "feiyan-huixiang");
        map_skill("parry", "poyu-quan");
        map_skill("strike", "hunyuan-zhang");

        prepare_skill("strike", "hunyuan-zhang");
        prepare_skill("cuff", "poyu-quan");

	set("chat_chance", 5);
	set("chat_msg", ({
		CYN "鲁智深喝道：你这厮，贼眉贼眼的看老爷作什么？\n" NOR,
		CYN "鲁智深愤愤的道：几个破落户敢打洒家菜园子的主意，哼，哼！\n" NOR,
		CYN "鲁智深说道：方丈说过上一年就让我当个阁主，院主什么的。\n" NOR,
	}));
        setup();

	carry_object(__DIR__"obj/dao-cloth")->wear();
	add_money("silver", 50);
}
