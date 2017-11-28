#include <ansi.h>;
inherit NPC;

void create()
{
	set_name("Ì«ºþºÀ½Ü", ({ "hao jie", "hao", "jie" }));
	set("gender", "ÄÐÐÔ");
	set("age", 25);
	set("long", "ÕâÊÇ¹éÔÆ×¯ÊôÏÂµÄÔÚÌ«ºþ½Ù¸»¼ÃÆ¶µÄÌ«ºþºÀ½Ü¡£\n");
	set("combat_exp", 100000);
        set_skill("dodge", 50);
        set_skill("lingxu-bu", 50);
        set_skill("unarmed", 50);
        set_skill("parry", 50);
        set_skill("changquan", 50);
        map_skill("unarmed", "changquan");
        map_skill("parry", "changquan");
        map_skill("dodge", "lingxu-bu");
	setup();

	carry_object("/clone/misc/cloth")->wear();
}