// hanbaoju.c
#include <ansi.h>;
inherit NPC;
inherit F_MASTER;

void create()
{
	set_name("韩宝驹", ({ "han baoju", "han" }));
	set("title", "江南七侠");
	set("nickname", HIY"马王神"NOR);
	set("long", "他是个又矮又胖的猥琐汉子，犹如一个大肉团一般。他手短足短，
没有脖子，一个头大的出奇，却又缩在双肩之中。一个酒糟鼻又
大又圆，就如一只红柿子旒在脸上。\n");
	set("gender", "男性");
	set("age", 35);
	set("attitude", "peaceful");
	set("class", "fighter");
	set("shen_type", 1);
	set("per", 10);
	set("str", 28);
	set("int", 28);
	set("con", 28);
	set("dex", 28);
	
	set("max_qi", 1200);
	set("max_jing", 500);
	set("neili", 1200);
	set("max_neili", 1200);
	set("jiali", 20);
	set("combat_exp", 300000);
	set("score", 6000);

	set_skill("force", 70);
	set_skill("taixuan-gong", 70);
	set_skill("dodge", 70);
	set_skill("lingxu-bu", 70);
	set_skill("unarmed", 70);
	set_skill("changquan", 70);
	set_skill("whip", 70);
	set_skill("riyue-bian", 70);

	map_skill("force", "taixuan-gong");
	map_skill("dodge", "lingxu-bu");
	map_skill("unarmed", "changquan");
	map_skill("whip", "riyue-bian");
	map_skill("parry", "riyue-bian");

	set("inquiry", ([
		"郭靖" : "靖儿是我们的乖徒儿！\n",
		"江南七侠" : "七侠可不敢当，我们七兄妹江湖上有个匪号叫江南七怪！\n",
		"江南七怪" : "七怪也是你叫的？！\n",
		"丘处机" : "丘道长豪侠仗义，是条汉子！\n",
		"柯镇恶" : "那是我大哥。\n",
		"朱聪"   : "那是我二哥。\n",
		"韩宝驹"   : "就是我了。\n",
		"南希仁"   : "那是我四弟。\n",
		"张阿生"   : "那是我五弟。\n",
		"全金发"   : "那是我六弟。\n",
		"韩小莹"   : "那是我七妹。\n",
	]));

	setup();
	carry_object("/clone/weapon/changbian")->wield();
	carry_object("/clone/misc/cloth")->wear();
}
