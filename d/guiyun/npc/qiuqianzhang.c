// jiading.c 家丁

inherit NPC;

void create()
{
	set_name("裘千丈", ({ "qiu qianzhang", "qiu" }));
	set("nickname", "肉掌水底钻");
	set("gender", "男性");
	set("age", 65);
	set("long", "他有个弟弟叫裘千仞，他还有个妹妹叫裘千尺。他自己，虽然比弟弟
多了三千尺，比妹妹更是多了九千尺，手上的功夫呢却比他们稀松至
少九万尺。\n"); 
	set("per",14);
	set("combat_exp", 50000);
	set_skill("dodge", 50);
	set_skill("lingxu-bu", 50);
	set_skill("unarmed", 50);
	set_skill("parry", 50);
	set_skill("changquan", 50);
	map_skill("dodge", "lingxu-bu");
	map_skill("parry", "changquan");
	map_skill("unarmed", "changquan");
	set("shen_type", -1);
	setup();

	add_money("silver",3);
	carry_object("/clone/misc/cloth")->wear();
}

