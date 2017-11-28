// laonu.c 老奴

#include <ansi.h>

inherit "/inherit/char/punisher";

void create()
{
	set_name("老奴", ({ "lao nu", "laonu" }));
	set("long",  "他看上去白发苍苍，一副仆人打扮，弱不经风的样子。\n");
	set("gender", "男性");
	set("age", 72);
	set("attitude", "peaceful");
	set("shen_type", 1);
	set("str", 32);
	set("int", 33);
	set("con", 38);
	set("dex", 32);
	
	set("max_qi", 6000);
	set("max_jing", 3000);
	set("neili", 7500);
	set("max_neili", 7500);
	set("jiali", 150);
	set("combat_exp", 2500000);
	set("score", 10000000);

	set_skill("force", 270);
	set_skill("unarmed", 250);
	set_skill("dodge", 250);
	set_skill("parry", 270);
	set_skill("cuff", 250);
        set_skill("finger", 240);
	set_skill("staff", 270);
	set_skill("training", 270);
        set_skill("poison", 270);
        set_skill("shedu-qiqiao", 270);
	set_skill("hamagong", 270);
	set_skill("chanchu-bufa", 250);
	set_skill("lingshe-quan", 250);
	set_skill("lingshe-zhangfa", 270);
	set_skill("baibian-daxue", 260);
        set_skill("guzheng-jifa", 300);
        set_skill("xiyu-tiezheng", 300);
	set_skill("medical", 280);
	set_skill("baituo-michuan", 280);

	map_skill("force", "hamagong");
	map_skill("dodge", "chanchu-bufa");
	map_skill("cuff",  "lingshe-quan");
	map_skill("parry", "lingshe-zhangfa");
	map_skill("staff", "lingshe-zhangfa");
        map_skill("finger", "shedu-qiqiao");
        map_skill("poison", "shedu-qiqiao");
        map_skill("guzheng-jifa", "xiyu-tiezheng");

        prepare_skill("finger", "shedu-qiqiao");
        prepare_skill("cuff", "lingshe-quan");

	create_family("欧阳世家", 0, "老奴");

	set("chat_chance_combat", 120);
	set("chat_msg_combat", ({
		(: perform_action, "staff.chan" :),
		(: perform_action, "staff.qianshe" :),
		(: perform_action, "staff.wuji" :),
		(: perform_action, "cuff.rou" :),
		(: exert_function, "recover" :),
	}));

	setup();
	carry_object("/d/baituo/obj/shezhang")->wield();
	carry_object("/clone/misc/cloth")->wear();
}
