// zhao.c
#include <ansi.h>
inherit NPC;

void create()
{
	set_name("赵半山", ({"zhao banshan", "zhao", "banshan"}));
	set("title", HIR"红花会"HIG"三当家"NOR);
	set("nickname", HIY "千臂如来" NOR );
	set("gender", "男性");
	set("age", 48);
	set("long", 
"他一张胖胖的脸，笑起来给人一副很慈祥的感觉。他
原是温州王氏太极门掌门大弟子。豪迈豁达，行侠江
湖，一手暗器功夫和太极剑少有能匹敌。屠龙帮风流
云散之后，投入红花会。很得被红花会老当家于万亭
赏识。\n");
	set("attitude", "peaceful");
	set("class", "fighter");
	set("per", 21);
	set("str", 21);
	set("int", 30);
	set("con", 26);
	set("dex", 30);

	set("qi", 2500);
	set("max_qi", 2500);
	set("jing", 1000);
	set("max_jing", 1000);
	set("neili", 2500);
	set("max_neili", 2500);
	set("jiali", 100);
	set("combat_exp", 800000);

	set_skill("force", 150);
	set_skill("taiji-shengong", 150);
	set_skill("unarmed", 150);
	set_skill("taiji-quan", 150);
	set_skill("throwing", 200);
	set_skill("hanxing-bada", 150);
	set_skill("dodge", 150);
	set_skill("tiyunzong", 150);
	set_skill("mantian-xing", 200);
	set_skill("parry", 150);
	set_skill("sword", 150);
	set_skill("taiji-jian", 150);

	map_skill("force"  , "taiji-shengong");
	map_skill("unarmed", "taiji-quan");
	map_skill("dodge"  , "tiyunzong");
	map_skill("parry"  , "taiji-jian");
	map_skill("sword"  , "taiji-jian");
	map_skill("throwing"  , "hanxing-bada");
	set("chat_chance_combat", 70);  
	set("chat_msg_combat", ({
		(: command("wield changjian") :),
		(: command("haha") :),
		(: command("unwield changjian") :),
		(: command("wield jili") :),
		(: command("unwield jili") :),
	}));
	setup();
	
	carry_object("/clone/weapon/changjian")->wield();
	carry_object("/clone/weapon/jili")->wield();
	carry_object("/clone/cloth/cloth")->wear();
}
