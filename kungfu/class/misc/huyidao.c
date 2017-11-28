// laonu.c 老奴

#include <ansi.h>

inherit "/inherit/char/punisher";

void create()
{
	set_name("胡一刀", ({ "hu yidao", "hu" }));
	set("long",  "这是一个剽悍粗犷的北方大汉，双眼炯炯有神。\n");
	set("gender", "男性");
	set("age", 58);
	set("attitude", "peaceful");
	set("shen_type", 1);
	set("str", 38);
	set("int", 31);
	set("con", 32);
	set("dex", 36);
	
	set("max_qi", 6000);
	set("max_jing", 3000);
	set("neili", 7500);
	set("max_neili", 7500);
	set("jiali", 150);
	set("combat_exp", 2500000);
	set("score", 10000000);

        set_skill("force", 210);            // 基本内功
        set_skill("lengyue-shengong", 210); // 冷月神功
        set_skill("blade", 240);            // 基本刀法
        set_skill("hujia-daofa", 240);      // 胡家刀法
        set_skill("dodge", 240);            // 基本躲闪
        set_skill("taxue-wuhen", 240);      // 踏雪无痕
        set_skill("parry", 220);            // 基本招架
        set_skill("throwing", 240);         // 基本暗器
        set_skill("mantian-xing", 240);     // 满天星
        set_skill("strike", 180);           // 基本掌法
        set_skill("tianchang-zhang", 180);  // 天长掌法
        set_skill("cuff", 180);             // 基本拳法
        set_skill("hujia-quan", 180);       // 胡家拳法

        map_skill("force", "lengyue-shengong");
        map_skill("blade", "hujia-daofa");
        map_skill("dodge", "taxue-wuhen");
        map_skill("parry", "hujia-daofa");
        map_skill("throwing", "mantian-xing");
        map_skill("strike", "tianchang-zhang");
        map_skill("cuff", "hujia-quan");

        prepare_skill("strike", "tianchang-zhang");
        prepare_skill("cuff",   "hujia-quan");

	create_family("关外胡家", 0, "老庄主");

	set("chat_chance_combat", 120);
	set("chat_msg_combat", ({
		(: perform_action, "blade.bafang" :),
		(: perform_action, "blade.po" :),
		(: perform_action, "cuff.kuai" :),
		(: exert_function, "recover" :),
	}));

	setup();
	carry_object("/clone/weapon/gangdao")->wield();
	carry_object("/clone/misc/cloth")->wear();
}
