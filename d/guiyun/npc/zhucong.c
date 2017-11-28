// zhucong.c
#include <ansi.h>;
inherit NPC;
inherit F_MASTER;

void create()
{
	set_name("朱聪", ({ "zhu cong", "zhu" }));
	set("title", "江南七侠");
	set("nickname", HIB"妙手书生"NOR);
	set("long", "
他看起来象一个中年士人，拖着鞋皮，踢踏踢踏的直响，一路打
着哈欠。似笑非笑，挤眉弄眼，一副惫懒神气，全身油腻，衣冠
不整，满脸污垢，看来少说也有十多天没洗脸了，拿着一柄破烂
的油纸黑扇，边摇边行。突听干笑数声，声音甚是刺耳。\n");
	set("gender", "男性");
	set("age", 38);
	set("attitude", "peaceful");
	set("class", "fighter");
	set("shen_type", 1);
	set("per", 19);
	set("str", 28);
	set("int", 28);
	set("con", 28);
	set("dex", 28);
	
	set("max_qi", 1200);
	set("max_jing", 500);
	set("neili", 1200);
	set("max_neili", 1200);
	set("jiali", 20);
	set("combat_exp", 350000);
	set("score", 6000);

	set_skill("force", 75);
	set_skill("taixuan-gong", 75);
	set_skill("dodge", 75);
	set_skill("lingxu-bu", 75);
	set_skill("unarmed", 75);
	set_skill("changquan", 75);
	set_skill("dagger", 75);
	set_skill("shigu-bifa", 75);
	set_skill("parry", 75);
	set_skill("stealing", 75);

	map_skill("force", "taixuan-gong");
	map_skill("dodge", "lingxu-bu");
	map_skill("dagger", "shigu-bifa");
	map_skill("parry", "shigu-bifa");

	set("inquiry", ([
		"郭靖" : "靖儿是我们的乖徒儿！\n",
		"江南七侠" : "七侠可不敢当，我们七兄妹江湖上有个匪号叫江南七怪！\n",
		"江南七怪" : "七怪也是你叫的？！\n",
		"丘处机" : "丘道长豪侠仗义，是条汉子！\n",
		"柯镇恶" : "那是我大哥。\n",
		"朱聪"   : "就是我了。\n",
		"韩宝驹"   : "那是我三弟。\n",
		"南希仁"   : "那是我四弟。\n",
		"张阿生"   : "那是我五弟。\n",
		"全金发"   : "那是我六弟。\n",
		"韩小莹"   : "那是我七妹。\n",
	]));

	setup();
	carry_object(__DIR__"obj/zheshan")->wield();
	carry_object("/clone/misc/cloth")->wear();
}
