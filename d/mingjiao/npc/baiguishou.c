// BaiGuiShou.c
// pal 1997.05.11

#include <ansi.h>

inherit NPC;

void create()
{
	set_name("白龟寿", ({ "bai guishou", "bai", "guishou", }));
	set("long",
        "他是一位两鬓斑白的老者，身穿一件白布长袍。\n"
        "他脸上总是浮现出可亲的微笑，但有时又透出一丝狡谲。\n"
	);

    	set("title",HIG "明教" BLU "玄武坛" NOR "坛主");

	set("gender", "男性");
	set("attitude", "friendly");
        set("class", "fighter");

        set("age", 56);
	set("shen_type", 1);
	set("str", 20);
	set("int", 20);
	set("con", 20);
	set("dex", 20);
	set("max_qi", 450);
	set("max_jing", 300);
	set("neili", 600);
	set("max_neili", 600);
	set("jiali", 50);
	set("combat_exp", 50000);
	set("score", 100);

	set_skill("force", 70);
	set_skill("hunyuan-yiqi", 70);
	set_skill("dodge", 70);
	set_skill("shaolin-shenfa", 70);
	set_skill("finger", 68);
	set_skill("nianhua-zhi", 68);
	set_skill("parry", 70);
	set_skill("sword", 80);
	set_skill("damo-jian", 80);
	set_skill("buddhism", 70);
	set_skill("literate", 70);

	map_skill("force", "hunyuan-yiqi");
	map_skill("dodge", "shaolin-shenfa");
	map_skill("finger", "nianhua-zhi");
	map_skill("parry", "damo-jian");
	map_skill("sword", "damo-jian");

	prepare_skill("finger", "nianhua-zhi");
        create_family("明教", 4, "玄武坛坛主");

	setup();

        carry_object("/d/mingjiao/obj/baipao")->wear();
}
