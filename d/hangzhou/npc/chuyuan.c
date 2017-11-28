// chuyuan.c

#include <ansi.h>

inherit NPC;

void create()
{
        set_name("褚圆", ({ "chu yuan", "chu", "yuan"}) );
        set("title", "御前侍卫");
        set("gender", "男性");
        set("age", 34);
        set("long",
                "褚圆原是和尚，法名智圆，后来犯了清规，被追缴度牒，逐
出庙门，他索性还了俗，做了大内侍卫。\n");
        set("combat_exp", 350000);
        set("shen_type", -1);
        set("attitude", "heroism");

        set_skill("unarmed", 55);
        set_skill("sword", 55);
        set_skill("parry", 50);
        set_skill("dodge", 50);
        set_skill("damo-jian", 50);
        set_skill("shaolin-shenfa", 50);
        map_skill("sword", "damo-jian");
        map_skill("parry", "damo-jian");
        map_skill("dodge", "shaolin-shenfa");

        setup();
        carry_object("/d/city/obj/tiejia")->wear();
        carry_object("/clone/weapon/changjian")->wield();

        add_money("coin", 10);
}

