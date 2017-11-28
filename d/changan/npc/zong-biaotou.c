//zong-biaotou.c

inherit NPC;
#include <ansi.h>

void create()
{
	set_name("万青山", ({ "wan", "qingshan" }) );
	set("title", HIR "龙行天下" NOR);
	set("gender", "男性" );
	set("age", 45);
	set("int", 30);
        set("skill_public",1);
	set("long",
		"河洛镖局总镖头，为人豪爽，不少走江湖的人物都是向他求教的武功。\n"
	);
        set("chat_chance", 10);
        set("chat_msg", ({
        	"万青山说道：镖局的人手越来越少了！\n",
        	"万青山说道：护镖真是一件很危险的事！\n",
        }) );
	set("attitude", "peaceful");
	set_skill("unarmed", 40);
	set_skill("literate", 40);
	set_skill("force", 40);
	set_skill("dodge",40);
	set_skill("parry",40);
	set("combat_exp", 100000);
	setup();
	carry_object(__DIR__"obj/jinzhuang")->wear();
}

int recognize_apprentice(object ob)
{
        return 1;
}
