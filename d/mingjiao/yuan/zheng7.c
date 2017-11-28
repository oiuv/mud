// zheng7.c
#include <ansi.h>

inherit NPC;
inherit F_UNIQUE;

void create()
{
        set_name("Ö£ÆßÃğ", ({ "zheng qimie", "qimie", "zheng"}));
        set("title", HIC "Éñ¼ı°ËĞÛ" NOR);
        set("gender", "ÄĞĞÔ");
        set("age", 25);
        set("attitude", "peaceful");
        set("shen_type", -1);
        set("str", 25);
        set("int", 25);
        set("con", 25);
        set("dex", 25);

        set("max_qi", 500);
        set("max_jing", 200);
        set("max_neili", 500);
        set("neili", 500);
        set("jiali", 50);
        set("combat_exp", 30000 + random(10000));

        set_skill("dodge", 80);
        set_skill("unarmed", 80);
        set_skill("throwing", 80);
        set_skill("xuanyuan-arrow", 80);
        set_skill("changquan", 80);
        set_skill("lingxu-bu", 80);
        map_skill("dodge", "lingxu-bu");
        map_skill("parry", "changquan");
        map_skill("throwing", "xuanyuan-arrow");
        map_skill("unarmed", "changquan");

        setup();

        carry_object("/clone/misc/cloth")->wear();
	set_temp("is_riding", BLK "Ñ©ÌãÂí" NOR);
        set_temp("handing", carry_object(__DIR__"obj/arrow"));
        add_money("silver", 10);
}
