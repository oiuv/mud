// zhangasheng.c
#include <ansi.h>;
inherit NPC;
inherit F_MASTER;

void create()
{
	set_name("张阿生", ({ "zhang asheng", "zhang" }));
	set("title", "江南七侠");
	set("nickname", HIW"笑弥陀"NOR);
	set("long", "一人身材魁梧，少说也有二百五六十斤，围着一条长围裙，全
身油腻，敞开衣襟，露出毛茸茸的胸膛，袖子卷得高高的，手
臂上全是寸许长的黑毛，腰间皮带上别着柄尺来长的尖刀，瞧
模样是个杀猪宰羊的屠夫。\n");
	set("gender", "男性");
	set("age", 28);
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
	set_skill("blade", 65);
	set_skill("hujia-daofa", 65);

	map_skill("force", "taixuan-gong");
	map_skill("dodge", "lingxu-bu");
	map_skill("unarmed", "changquan");
	map_skill("blade", "hujia-daofa");
	map_skill("parry", "hujia-daofa");

	set("inquiry", ([
		"郭靖" : "靖儿是我们的乖徒儿！\n",
		"江南七侠" : "七侠可不敢当，我们七兄妹江湖上有个匪号叫江南七怪！\n",
		"江南七怪" : "七怪也是你叫的？！\n",
		"丘处机" : "丘道长豪侠仗义，是条汉子！\n",
		"柯镇恶" : "那是我大哥。\n",
		"朱聪"   : "那是我二哥。\n",
		"韩宝驹"   : "那是我三哥。\n",
		"南希仁"   : "那是我四哥。\n",
		"张阿生"   : "就是我了。\n",
		"全金发"   : "那是我六弟。\n",
		"韩小莹"   : "那是我七妹。\n",
	]));

	setup();
	carry_object(__DIR__"obj/jiandao")->wield();
	carry_object("/clone/misc/cloth")->wear();
}
