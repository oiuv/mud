// ZhuangZheng.c
// pal 1997.05.11
#include <ansi.h>
inherit NPC;
inherit F_UNIQUE;

void create()
{
        set_name("庄铮", ({ "zhuang zheng", "zhuang", "zheng", }));
	set("long",
        "他是一位高大魁伟的中年男子，身穿一件白布长袍。\n"
        "他天生神力，手中的两头狼牙棒有万夫不当之勇，真是一条威风凛凛的汉子。\n"
	);

        set("title", HIG "明教" HIW "锐金旗" NOR "掌旗使");
	set("gender", "男性");
	set("attitude", "friendly");
        set("class", "fighter");

        set("age", 42);
	set("shen_type", 1);
	set("str", 25);
	set("int", 25);
	set("con", 25);
	set("dex", 25);
	set("max_qi", 1000);
	set("max_jing", 1000);
	set("neili", 1000);
	set("max_neili", 1000);
	set("jiali", 100);
	set("combat_exp", 100000);
	set("score", 5000);

	set_skill("force", 85);
	set_skill("hunyuan-yiqi", 85);
	set_skill("dodge", 85);
	set_skill("shaolin-shenfa", 85);
	set_skill("cuff", 95);
	set_skill("jingang-quan", 95);
	set_skill("parry", 85);
	set_skill("buddhism", 85);
	set_skill("literate", 85);

	map_skill("force", "hunyuan-yiqi");
	map_skill("dodge", "shaolin-shenfa");
	map_skill("cuff", "jingang-quan");
	map_skill("parry", "jingang-quan");

	prepare_skill("cuff", "jingang-quan");
        create_family("明教", 3, "锐金旗掌旗使");

	setup();

        carry_object("/d/mingjiao/obj/langyabang")->wield();
        carry_object("/d/mingjiao/obj/baipao")->wear();
}

