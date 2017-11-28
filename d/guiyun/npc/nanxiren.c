// nanxiren.c
#include <ansi.h>;
inherit NPC;
inherit F_MASTER;

void create()
{
	set_name("南希仁", ({ "nan xiren", "nan" }));
	set("title", "江南七侠");
	set("nickname", HIG"南山樵子"NOR);
	set("long", "
他是个挑柴模样的汉子，三十岁上下年纪，一身青布衣裤，腰里
束了根粗草绳，足穿草鞋，粗手大脚，神请木讷。\n");
	set("gender", "男性");
	set("age", 30);
	set("attitude", "peaceful");
	set("class", "fighter");
	set("shen_type", 1);
	set("per", 15);
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
	set_skill("staff", 70);
	set_skill("juemen-gun", 70);
	set_skill("axe", 70);
	set_skill("duanyun-fu", 70);

	map_skill("force", "taixuan-gong");
	map_skill("dodge", "lingxu-bu");
	map_skill("unarmed", "changquan");
	map_skill("staff", "juemen-gun");
	map_skill("parry", "juemen-gun");
	map_skill("axe", "duanyun-fu");

	set("inquiry", ([
		"郭靖" : "靖儿是我们的乖徒儿！\n",
		"江南七侠" : "七侠可不敢当，我们七兄妹江湖上有个匪号叫江南七怪！\n",
		"江南七怪" : "七怪也是你叫的？！\n",
		"丘处机" : "丘道长豪侠仗义，是条汉子！\n",
		"柯镇恶" : "那是我大哥。\n",
		"朱聪"   : "那是我二哥。\n",
		"韩宝驹"   : "那是我三哥。\n",
		"南希仁"   : "就是我了。\n",
		"张阿生"   : "那是我五弟。\n",
		"全金发"   : "那是我六弟。\n",
		"韩小莹"   : "那是我七妹。\n",
	]));

	setup();
	carry_object(__DIR__"obj/biandan");
	carry_object(__DIR__"obj/axe")->wield();
	carry_object(__DIR__"obj/green_cloth")->wear();
}
