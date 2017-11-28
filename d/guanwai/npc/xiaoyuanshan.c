// xiaoyuanshan.c

#include <ansi.h>

inherit NPC;

void create()
{
	set_name("萧远山", ({"xiao yuanshan", "xiao", "yuanshan"}));
	set("gender", "男性");
	set("nickname",HIB"黑衣僧"NOR);
	set("age", 28);
	set("long", 
		"他就是丐帮前任帮主萧峰的父亲，潜伏少林数十年了。\n"
		"他身穿一件普通的黑僧袍，腰间用一条麻绳随便一系。\n"
		"他身高六尺有余，体格十分魁梧，长有一张线条粗旷、十\n"
		"分男性化的脸庞，双目如电，炯炯有神。\n");
	set("attitude", "peaceful");
	
	set("str", 45);
	set("int", 30);
	set("con", 30);
	set("dex", 30);

	set("qi", 4000);
	set("max_qi", 4000);
	set("jing", 1500);
	set("max_jing", 1500);
	set("neili", 4000);
	set("max_neili", 4000);
	set("jiali", 100);
	
	set("combat_exp", 180000);
	set("score", 20000);
	 
	set_skill("force", 120);             // 基本内功
	set_skill("hunyuan-yiqi", 120);      // 混天气功
	set_skill("unarmed", 120);           // 基本拳脚
	set_skill("jingang-quan", 120);      // 降龙十八掌
	set_skill("dodge", 120);      	     // 基本躲闪
	set_skill("shaolin-shenfa", 120);    // 逍遥游
	set_skill("parry", 120);             // 基本招架
	
	map_skill("force", "hunyuan-yiqi");
	map_skill("unarmed", "jingang-quan");
	map_skill("dodge", "shaolin-shenfa");
	map_skill("parry", "jingang-quan");
	
	setup();
	
	carry_object("/clone/misc/cloth")->wear();
}

