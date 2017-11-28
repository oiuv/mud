// laodao.c 老道

#include <ansi.h>

inherit "/inherit/char/punisher";

void create()
{
	set_name("老道", ({ "lao dao", "dao" }));
	set("long",  "他看上去仙风道骨，相貌不俗。\n");
	set("gender", "男性");
	set("age", 64);
	set("attitude", "peaceful");
	set("shen_type", 1);
	set("str", 33);
	set("int", 33);
	set("con", 36);
	set("dex", 32);
	
	set("max_qi", 6000);
	set("max_jing", 3000);
	set("neili", 7500);
	set("max_neili", 7500);
	set("jiali", 150);
	set("combat_exp", 2500000);
	set("score", 10000000);

        set_skill("force", 280);
        set_skill("quanzhen-xinfa", 280);
        set_skill("xiantian-gong", 280);
        set_skill("sword", 260);
        set_skill("quanzhen-jian",260);
        set_skill("dodge", 260);
        set_skill("jinyan-gong", 260);
        set_skill("parry", 270);
        set_skill("strike", 270);
        set_skill("chongyang-shenzhang", 270);
        set_skill("haotian-zhang", 270);
        set_skill("literate", 160);
        set_skill("finger", 250);
        set_skill("taoism", 300);
        set_skill("finger", 260);
        set_skill("zhongnan-zhi", 270);
        set_skill("medical", 270);
        set_skill("liandan-shu", 270);

        map_skill("force", "xiantian-gong");
        map_skill("sword", "quanzhen-jian");
        map_skill("dodge", "jinyan-gong");
        map_skill("parry", "quanzhen-jian");
        map_skill("finger", "zhoangnan-zhi");
        map_skill("strike", "haotian-zhang");

        prepare_skill("finger","sun-finger");
        prepare_skill("strike","haotian-zhang");

	create_family("全真教", 0, "前辈");

	set("chat_chance_combat", 120);
	set("chat_msg_combat", ({
		(: perform_action, "sword.ding" :),
		(: perform_action, "sword.hua" :),
		(: perform_action, "strike.ju" :),
		(: exert_function, "recover" :),
	}));

	setup();
	carry_object("/clone/weapon/changjian")->wield();
	carry_object("/clone/misc/cloth")->wear();
}
