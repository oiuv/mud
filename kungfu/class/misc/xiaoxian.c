// xiaoxian.c 星宿小仙

#include <ansi.h>

inherit "/inherit/char/punisher";

void create()
{
	set_name("星宿小仙", ({ "xingxiu xiaoxian", "xiaoxian" }));
	set("long",  "她是一个小女孩，看上去年纪不大。\n");
	set("gender", "女性");
	set("age", 24);
	set("attitude", "peaceful");
	set("shen_type", 1);
	set("str", 30);
	set("int", 36);
	set("con", 38);
	set("dex", 33);
	
	set("max_qi", 6000);
	set("max_jing", 3000);
	set("neili", 7500);
	set("max_neili", 7500);
	set("jiali", 150);
	set("combat_exp", 2500000);
	set("score", 10000000);

        set_skill("force", 220);
        set_skill("huagong-dafa", 220);
        set_skill("guixi-gong", 200);
        set_skill("throwing", 210);
        set_skill("feixing-shu", 210);
        set_skill("dodge", 180);
        set_skill("zhaixinggong", 180);
        set_skill("strike", 185);
        set_skill("chousui-zhang", 185);
        set_skill("claw", 180);
        set_skill("sanyin-wugongzhao", 180);
        set_skill("whip", 180);
        set_skill("chanhun-suo", 180);
        set_skill("parry", 185);
        set_skill("staff", 190);
        set_skill("poison", 255);
        set_skill("tianshan-zhang", 190);
        set_skill("literate", 120);

        map_skill("force", "huagong-dafa");
        map_skill("dodge", "zhaixinggong");
        map_skill("strike", "chousui-zhang");
        map_skill("claw", "sanyin-wugongzhao");
        map_skill("whip", "chanhun-suo");
        map_skill("parry", "tianshan-zhang");
        map_skill("staff", "tianshan-zhang");

        prepare_skill("strike", "chousui-zhang");
        prepare_skill("claw", "sanyin-wugongzhao");

	create_family("星宿派", 0, "奇人");

	set("chat_chance_combat", 120);
	set("chat_msg_combat", ({
		(: perform_action, "staff.fugu" :),
		(: perform_action, "staff.xue" :),
		(: perform_action, "claw.zhua" :),
		(: exert_function, "recover" :),
	}));

	setup();
	carry_object("/clone/weapon/gangzhang")->wield();
	carry_object("/clone/misc/cloth")->wear();
}
