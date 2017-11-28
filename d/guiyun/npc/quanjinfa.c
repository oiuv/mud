// quanjinfa.c
#include <ansi.h>;
inherit NPC;
inherit F_MASTER;

void create()
{
	set_name("全金发", ({ "quan jinfa", "quan" }));
	set("title", "江南七侠");
	set("nickname", HIC"闹市侠隐"NOR);
	set("long", "那人五短身材，头戴小毡帽，白净面皮，手里提了一杆秤，一
个竹篓，似是个小商贩。\n");
	set("gender", "男性");
	set("age", 25);
	set("attitude", "peaceful");
	set("class", "fighter");
	set("shen_type", 1);
	set("per", 18);
	set("str", 28);
	set("int", 28);
	set("con", 28);
	set("dex", 28);
	
	set("max_qi", 1200);
	set("max_jing", 500);
	set("neili", 1200);
	set("max_neili", 1200);
	set("jiali", 20);
	set("combat_exp", 250000);
	set("score", 6000);

	set_skill("force", 65);
	set_skill("taixuan-gong", 65);
	set_skill("dodge", 65);
	set_skill("lingxu-bu", 65);
	set_skill("unarmed", 65);
	set_skill("changquan", 65);
	set_skill("club", 65);
	set_skill("zhongping-qiang", 65);

	map_skill("force", "taixuan-gong");
	map_skill("dodge", "lingxu-bu");
	map_skill("unarmed", "changquan");
	map_skill("club", "zhongping-qiang");
	map_skill("parry", "zhongping-qiang");

	set("inquiry", ([
		"郭靖" : "靖儿是我们的乖徒儿！\n",
		"江南七侠" : "七侠可不敢当，我们七兄妹江湖上有个匪号叫江南七怪！\n",
		"江南七怪" : "七怪也是你叫的？！\n",
		"丘处机" : "丘道长豪侠仗义，是条汉子！\n",
		"柯镇恶" : "那是我大哥。\n",
		"朱聪"   : "那是我二哥。\n",
		"韩宝驹"   : "那是我三哥。\n",
		"南希仁"   : "那是我四哥。\n",
		"张阿生"   : "那是我五哥。\n",
		"全金发"   : "就是我了。\n",
		"韩小莹"   : "那是我七妹。\n",
	]));

	setup();
	carry_object(__DIR__"obj/gancheng")->wield();
	carry_object("/clone/misc/cloth")->wear();
}
