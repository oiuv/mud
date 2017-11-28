// baizhen.c

#include <ansi.h>

inherit NPC;

void create()
{
        set_name("白振", ({ "bai zhen", "bai", "zhen"}) );
        set("title", "御前侍卫");
        set("nickname", HIY"金爪"HIB"铁钩"NOR);
        set("gender", "男性");
        set("age", 64);
        set("long",
                "白振是嵩阳派高手，三十年前就驰名武林了。\n");
        set("combat_exp", 450000);
        set("shen_type", -1);
        set("attitude", "heroism");

        set_skill("unarmed", 95);
        set_skill("blade", 95);
        set_skill("claw", 95);
        set_skill("parry", 90);
        set_skill("dodge", 90);
        set_skill("sougu", 90);
        set_skill("lingxu-bu", 90);
        map_skill("dodge", "lingxu-bu");
        map_skill("claw", "sougu");
        map_skill("parry", "sougu");
        prepare_skill("claw", "sougu");

        setup();
        carry_object("/d/city/obj/tiejia")->wear();

        add_money("coin", 30);
}

